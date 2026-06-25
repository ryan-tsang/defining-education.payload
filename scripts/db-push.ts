/**
 * Sync the connected database's schema to the current Payload config (Drizzle
 * dev "push") WITHOUT seeding data. Run this before deploying a build that adds
 * new fields/relations, so an existing dev DB gets the new columns (the
 * production image runs with push disabled and won't add them itself).
 *
 *   # against the in-cluster DB via port-forward:
 *   kubectl -n payload port-forward sts/postgres 15432:5432 &
 *   GCS_BUCKET=redso-payload-dev GCP_PROJECT_ID=redso-elastic-dev \
 *     PAYLOAD_SECRET=x DATABASE_URL='postgresql://payload:<pw>@localhost:15432/payload' \
 *     pnpm payload run scripts/db-push.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'

await getPayload({ config }) // init triggers the dev schema push
console.log('✓ schema push complete')
process.exit(0)
