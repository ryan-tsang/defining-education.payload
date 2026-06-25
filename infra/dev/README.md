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

Use the deploy script from the repo root — it port-forwards the DB, builds
`linux/amd64`, pushes to Artifact Registry, and rolls out the Deployment:

```sh
pnpm deploy:dev          # = bash scripts/deploy-dev.sh
```

It reads `DATABASE_URL`/`PAYLOAD_SECRET` from the `payload/app` k8s Secret (never
printed) and tags the image with a timestamp + `latest`. Override any default via env,
e.g. `SERVER_URL=… GCS_BUCKET=… pnpm deploy:dev`.

The Dockerfile regenerates the Payload import map with `GCS_BUCKET` set during the build —
required, or the admin panel renders blank (the `gcsStorage` admin component would be
missing from the map).

> Code only. A schema change (e.g. a new richText upload adds a `media` column to
> `*_rels`) won't be applied by a deploy — sync it separately (a `pulumi`-side migration,
> or a one-off `payload migrate` / dev-push against the port-forwarded DB).
