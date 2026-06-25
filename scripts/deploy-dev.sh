#!/usr/bin/env bash
#
# Build the app image (linux/amd64) and deploy it to the Payload dev environment
# on the shared Redso GKE cluster (payload.redsoapp.com). Mirrors the manual flow
# in infra/dev/README.md and is safe to re-run.
#
#   bash scripts/deploy-dev.sh         # or: pnpm deploy:dev
#
# Requires: docker (buildx), kubectl + cluster creds, gcloud (logged in).
# Note: this deploys CODE only. A schema change (e.g. a new richText upload/relation)
# must be migrated/synced separately — see infra/dev/README.md.
set -euo pipefail

# ── Config (override via env) ────────────────────────────────────────────────
NAMESPACE="${NAMESPACE:-payload}"
DEPLOYMENT="${DEPLOYMENT:-main}"
CONTAINER="${CONTAINER:-main}"
DB_STS="${DB_STS:-postgres}"
DB_LOCAL_PORT="${DB_LOCAL_PORT:-15432}"
REGISTRY="${REGISTRY:-asia-east2-docker.pkg.dev/redso-elastic-dev/payload-dev/app}"
GCS_BUCKET="${GCS_BUCKET:-redso-payload-dev}"
GCP_PROJECT_ID="${GCP_PROJECT_ID:-redso-elastic-dev}"
SERVER_URL="${SERVER_URL:-https://payload.redsoapp.com}"
PLATFORM="${PLATFORM:-linux/amd64}"
CLUSTER="${CLUSTER:-redso-elastic-dev}"
ZONE="${ZONE:-asia-east2-a}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ── Preflight ─────────────────────────────────────────────────────────────────
log "Preflight"
command -v docker  >/dev/null || die "docker not found"
command -v kubectl >/dev/null || die "kubectl not found"
command -v gcloud  >/dev/null || die "gcloud not found"
kubectl -n "$NAMESPACE" get deploy "$DEPLOYMENT" >/dev/null 2>&1 || die \
  "can't reach deploy/$DEPLOYMENT in ns/$NAMESPACE — run:
   gcloud container clusters get-credentials $CLUSTER --zone $ZONE --project $GCP_PROJECT_ID"
gcloud auth configure-docker "${REGISTRY%%/*}" -q >/dev/null 2>&1 || true

# ── Build-time secrets (read from the cluster; never printed) ──────────────────
log "Reading DB connection from secret '$NAMESPACE/app'"
DBURL="$(kubectl -n "$NAMESPACE" get secret app -o jsonpath='{.data.DATABASE_URL}'  | base64 -d)"
PSECRET="$(kubectl -n "$NAMESPACE" get secret app -o jsonpath='{.data.PAYLOAD_SECRET}' | base64 -d)"
[ -n "$DBURL" ] && [ -n "$PSECRET" ] || die "DATABASE_URL/PAYLOAD_SECRET missing from secret 'app'"
# Payload prerenders against the DB at build time → point the build at a port-forward.
BUILD_DB="$(printf '%s' "$DBURL" | sed "s#@${DB_STS}:5432/#@host.docker.internal:${DB_LOCAL_PORT}/#")"

# ── Port-forward the in-cluster DB ─────────────────────────────────────────────
log "Port-forward $NAMESPACE/$DB_STS → localhost:$DB_LOCAL_PORT"
kubectl -n "$NAMESPACE" port-forward --address 0.0.0.0 "sts/$DB_STS" "${DB_LOCAL_PORT}:5432" >/tmp/deploy-dev-pf.log 2>&1 &
PF_PID=$!
cleanup() { kill "$PF_PID" 2>/dev/null || true; }
trap cleanup EXIT
ok=
for _ in $(seq 1 30); do
  if docker run --rm --platform "$PLATFORM" busybox sh -c "nc -z -w3 host.docker.internal $DB_LOCAL_PORT" >/dev/null 2>&1; then ok=1; break; fi
  sleep 1
done
[ -n "$ok" ] || die "DB not reachable at host.docker.internal:$DB_LOCAL_PORT (build needs it for prerender)"

# ── Build + push ────────────────────────────────────────────────────────────────
TAG="$(date +%Y%m%d-%H%M%S)"
IMG="$REGISTRY:$TAG"
log "Build $IMG ($PLATFORM)  [the Dockerfile regenerates the import map with GCS]"
docker buildx build --platform "$PLATFORM" --load --provenance=false \
  --build-arg DATABASE_URL="$BUILD_DB" \
  --build-arg PAYLOAD_SECRET="$PSECRET" \
  --build-arg NEXT_PUBLIC_SERVER_URL="$SERVER_URL" \
  --build-arg GCS_BUCKET="$GCS_BUCKET" \
  --build-arg GCP_PROJECT_ID="$GCP_PROJECT_ID" \
  -t "$IMG" -t "$REGISTRY:latest" .

log "Push to Artifact Registry"
docker push "$IMG"
docker push "$REGISTRY:latest"

# ── Roll out ──────────────────────────────────────────────────────────────────
log "Roll out to $NAMESPACE/$DEPLOYMENT"
kubectl -n "$NAMESPACE" set image "deploy/$DEPLOYMENT" "$CONTAINER=$IMG"
kubectl -n "$NAMESPACE" rollout status "deploy/$DEPLOYMENT" --timeout=300s

# ── Verify ────────────────────────────────────────────────────────────────────
code="$(curl -s -o /dev/null -w '%{http_code}' "$SERVER_URL/healthz" || true)"
printf '\n\033[1;32m✓ Deployed %s\033[0m  (%s/healthz → HTTP %s)\n' "$IMG" "$SERVER_URL" "$code"
