# Dev infrastructure (Pulumi)

Deploys the Payload site's dev environment to the shared Redso GKE cluster
(`redso-elastic-dev`, `asia-east2-a`). See the Redso dev-infra guideline for the rules.

## What it creates

Namespace `payload`, in-cluster PostgreSQL (16) + 1Gi PVC, a generated app `Secret`,
the app `Deployment`/`Service` (Workload Identity → GCS), GCS bucket `redso-payload-dev`
(media), Artifact Registry repo `payload-dev`, an `HTTPRoute` + `HealthCheckPolicy` on the
shared Gateway for `payload.redsoapp.com`, and the Cloudflare DNS record.

## Bootstrap on a fresh checkout

`Pulumi.dev.yaml` is gitignored (it holds the Cloudflare token, encrypted with an empty
passphrase = effectively plaintext). Recreate the stack + config:

```sh
cd infra/dev
npm install
export PULUMI_CONFIG_PASSPHRASE=""                      # dev secrets live in k8s, not state
pulumi login gs://redso-elastic-dev/payload-dev-state
pulumi stack select dev   # or: pulumi stack init dev

pulumi config set gcp:project redso-elastic-dev
pulumi config set gcp:region asia-east2
pulumi config set --secret cloudflare:apiToken          # token from the org board (guideline §7)

pulumi preview        # read-only
pulumi up
```

Requires `gcloud` + `kubectl` + `gke-gcloud-auth-plugin`, logged in (CLI **and**
`gcloud auth application-default login`), with cluster creds fetched
(`gcloud container clusters get-credentials redso-elastic-dev --zone asia-east2-a`).

## Deploying the app image (CI is not yet wired)

```sh
# build linux/amd64 with the DB reachable (it prerenders at build time):
kubectl -n payload port-forward --address 0.0.0.0 sts/postgres 15432:5432 &
docker buildx build --platform linux/amd64 --load \
  --build-arg DATABASE_URL='postgresql://payload:<pw>@host.docker.internal:15432/payload' \
  --build-arg PAYLOAD_SECRET='<from k8s secret>' \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://payload.redsoapp.com \
  --build-arg GCS_BUCKET=redso-payload-dev \
  --build-arg GCP_PROJECT_ID=redso-elastic-dev \
  -t asia-east2-docker.pkg.dev/redso-elastic-dev/payload-dev/app:$(date +%s) .
docker push <that tag>
kubectl -n payload set image deploy/main main=<that tag>
```

The Dockerfile regenerates the Payload import map with `GCS_BUCKET` set during the build —
required, or the admin panel renders blank (the `gcsStorage` admin component would be
missing from the map).
