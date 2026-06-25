import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'
import * as k8s from '@pulumi/kubernetes'
import * as cloudflare from '@pulumi/cloudflare'
import * as command from '@pulumi/command'
import * as random from '@pulumi/random'
import * as crypto from 'crypto'

// ── Project constants (Redso dev standard, guideline §1/§10) ────────────────
const PROJECT = 'redso-elastic-dev' // shared GCP project + GKE cluster
const ZONE = 'asia-east2-a' // cluster location (zonal)
const REGION = 'asia-east2' // buckets / registries
const NAME = 'payload' // project short name → namespace, app
const BUCKET = 'redso-payload-dev' // GCS bucket — globally unique ('payload-dev' is taken)
const REGISTRY_ID = 'payload-dev' // Artifact Registry repo (project-scoped, not global)
const DOMAIN = 'payload.redsoapp.com' // requested dev hostname
const APP_PORT = 3000 // Next.js server port (Dockerfile EXPOSE 3000)

const config = new pulumi.Config()

// ── Kubernetes provider built from cluster data (works locally + in CI) ─────
const cluster = gcp.container.getClusterOutput({
  name: PROJECT,
  location: ZONE,
  project: PROJECT,
})

const kubeconfig = pulumi.interpolate`apiVersion: v1
kind: Config
clusters:
- name: gke
  cluster:
    certificate-authority-data: ${cluster.masterAuths[0].clusterCaCertificate}
    server: https://${cluster.endpoint}
contexts:
- name: gke
  context: { cluster: gke, user: gke }
current-context: gke
users:
- name: gke
  user:
    exec:
      apiVersion: client.authentication.k8s.io/v1beta1
      command: gke-gcloud-auth-plugin
      installHint: gcloud components install gke-gcloud-auth-plugin
      provideClusterInfo: true
`

const gke = new k8s.Provider('gke', { kubeconfig })
const k8sOpts = { provider: gke }

// ── Namespace (hard isolation rule, guideline §2) ───────────────────────────
const ns = new k8s.core.v1.Namespace('ns', { metadata: { name: NAME } }, k8sOpts)
const namespace = ns.metadata.name

// ── Enable the Artifact Registry API (disableOnDestroy false — shared project) ──
const arApi = new gcp.projects.Service('artifactregistry-api', {
  service: 'artifactregistry.googleapis.com',
  disableOnDestroy: false,
})

// ── Artifact Registry (Docker repo for CI images, guideline §10) ────────────
const registry = new gcp.artifactregistry.Repository(
  'registry',
  { repositoryId: REGISTRY_ID, format: 'DOCKER', location: REGION },
  { dependsOn: [arApi] },
)

// ── GCS bucket for media uploads (guideline §6) ─────────────────────────────
const bucket = new gcp.storage.Bucket('bucket', {
  name: BUCKET,
  location: 'ASIA-EAST2',
  uniformBucketLevelAccess: true,
  cors: [
    {
      // Restrict browser CORS to our own origins (not '*').
      origins: [
        `https://${DOMAIN}`,
        'https://www.definingeducation.com.hk',
        'https://definingeducation.com.hk',
      ],
      methods: ['GET', 'HEAD', 'OPTIONS', 'PUT'],
      responseHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
      maxAgeSeconds: 3600,
    },
  ],
})

// ── Workload Identity: app → GCS (so @payloadcms/storage-gcs uses ADC, no key) ──
const appGsa = new gcp.serviceaccount.Account('app-gsa', {
  accountId: `${NAME}-dev-app`,
  displayName: 'payload-dev app (GCS media access)',
})

new gcp.storage.BucketIAMMember('app-gcs-access', {
  bucket: bucket.name,
  role: 'roles/storage.objectAdmin',
  member: pulumi.interpolate`serviceAccount:${appGsa.email}`,
})

const appKsa = new k8s.core.v1.ServiceAccount(
  'app-ksa',
  {
    metadata: {
      name: `${NAME}-app`,
      namespace,
      annotations: { 'iam.gke.io/gcp-service-account': appGsa.email },
    },
  },
  k8sOpts,
)

// Let the KSA impersonate the GSA (Workload Identity binding).
new gcp.serviceaccount.IAMMember('app-wi', {
  serviceAccountId: appGsa.name,
  role: 'roles/iam.workloadIdentityUser',
  member: pulumi.interpolate`serviceAccount:${PROJECT}.svc.id.goog[${namespace}/${NAME}-app]`,
})

// ── PostgreSQL: StatefulSet + PVC + Service (guideline §4/§5) ────────────────
const dbUsername = 'payload'
const dbName = 'payload'
const dbPassword = new random.RandomString('db-password', {
  length: 24,
  special: false, // keep the DATABASE_URL clean (no URL-encoding needed)
})

const postgresPvc = new k8s.core.v1.PersistentVolumeClaim(
  'postgres-pvc',
  {
    metadata: {
      name: 'postgres-pvc',
      namespace,
      annotations: { 'pulumi.com/skipAwait': 'true' }, // binds on first consumer
    },
    spec: {
      storageClassName: 'standard',
      accessModes: ['ReadWriteOnce'],
      resources: { requests: { storage: '1Gi' } },
    },
  },
  k8sOpts,
)

const postgres = new k8s.apps.v1.StatefulSet(
  'postgres',
  {
    metadata: { name: 'postgres', namespace },
    spec: {
      serviceName: 'postgres',
      replicas: 1,
      selector: { matchLabels: { app: 'postgres' } },
      template: {
        metadata: { labels: { app: 'postgres' } },
        spec: {
          containers: [
            {
              name: 'postgres',
              image: 'postgres:16', // matches local docker-compose; never change major on an existing PVC
              ports: [{ containerPort: 5432 }],
              resources: { requests: { cpu: '50m', memory: '512Mi' } }, // guideline §4
              env: [
                { name: 'POSTGRES_USER', value: dbUsername },
                { name: 'POSTGRES_PASSWORD', value: dbPassword.result },
                { name: 'POSTGRES_DB', value: dbName },
                { name: 'PGDATA', value: '/var/lib/postgresql/data/pgdata' },
              ],
              volumeMounts: [
                // postgres ≤17 declares VOLUME /var/lib/postgresql/data — mount THERE.
                { name: 'postgres-volume', mountPath: '/var/lib/postgresql/data' },
                { name: 'postgres-shm', mountPath: '/dev/shm' },
              ],
            },
          ],
          volumes: [
            {
              name: 'postgres-volume',
              persistentVolumeClaim: { claimName: postgresPvc.metadata.name },
            },
            { name: 'postgres-shm', emptyDir: { medium: 'Memory', sizeLimit: '128Mi' } },
          ],
        },
      },
    },
  },
  { ...k8sOpts, ignoreChanges: ['spec.replicas'] },
)

new k8s.core.v1.Service(
  'postgres-svc',
  {
    metadata: { name: 'postgres', namespace },
    spec: { selector: { app: 'postgres' }, ports: [{ port: 5432 }], type: 'NodePort' },
  },
  k8sOpts,
)

// ── Secrets (k8s Secret, generated in IaC — guideline §7) ───────────────────
const payloadSecret = new random.RandomString('payload-secret', { length: 48, special: false })
const cronSecret = new random.RandomString('cron-secret', { length: 32, special: false })
const previewSecret = new random.RandomString('preview-secret', { length: 32, special: false })

const databaseUrl = pulumi.interpolate`postgresql://${dbUsername}:${dbPassword.result}@postgres:5432/${dbName}`

const appSecret = new k8s.core.v1.Secret(
  'app-secret',
  {
    metadata: { name: 'app', namespace },
    stringData: {
      DATABASE_URL: databaseUrl,
      PAYLOAD_SECRET: payloadSecret.result,
      CRON_SECRET: cronSecret.result,
      PREVIEW_SECRET: previewSecret.result,
    },
  },
  k8sOpts,
)

// Roll the app when Secret content changes (secretKeyRef env is read at start, §7).
const secretChecksum = appSecret.stringData.apply((d) =>
  crypto.createHash('sha256').update(JSON.stringify(d)).digest('hex'),
)

// ── App Deployment + Service (placeholder image; CI owns it, guideline §8) ──
const secretEnv = (key: string) => ({
  name: key,
  valueFrom: { secretKeyRef: { name: 'app', key } },
})

const main = new k8s.apps.v1.Deployment(
  'main',
  {
    metadata: {
      name: 'main',
      namespace,
      // The placeholder image can't pass the /healthz probe, so the pod never goes
      // Ready — don't block `pulumi up` on rollout. CI's real image will be healthy.
      annotations: { 'pulumi.com/skipAwait': 'true' },
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: 'main' } },
      template: {
        metadata: {
          labels: { app: 'main' },
          annotations: { 'checksum/secret': secretChecksum },
        },
        spec: {
          serviceAccountName: appKsa.metadata.name, // Workload Identity → GCS
          nodeSelector: { 'iam.gke.io/gke-metadata-server-enabled': 'true' },
          containers: [
            {
              name: 'main',
              image: 'nginx:alpine', // placeholder; CI sets the real image
              ports: [{ containerPort: APP_PORT }],
              resources: { requests: { cpu: '100m', memory: '512Mi' } }, // Payload SSR + sharp, guideline §4
              env: [
                { name: 'PORT', value: String(APP_PORT) },
                { name: 'NEXT_PUBLIC_SERVER_URL', value: `https://${DOMAIN}` },
                { name: 'GCS_BUCKET', value: BUCKET },
                { name: 'GCP_PROJECT_ID', value: PROJECT },
                secretEnv('DATABASE_URL'),
                secretEnv('PAYLOAD_SECRET'),
                secretEnv('CRON_SECRET'),
                secretEnv('PREVIEW_SECRET'),
              ],
              // cheap health endpoint (guideline §3c) — never SSR/DB
              readinessProbe: { httpGet: { path: '/healthz', port: APP_PORT }, periodSeconds: 10 },
              livenessProbe: { httpGet: { path: '/healthz', port: APP_PORT }, periodSeconds: 30 },
            },
          ],
        },
      },
    },
  },
  {
    ...k8sOpts,
    ignoreChanges: ['spec.replicas', 'spec.template.spec.containers[0].image'],
  },
)

const mainSvc = new k8s.core.v1.Service(
  'main-svc',
  {
    metadata: { name: 'main', namespace },
    spec: {
      selector: { app: 'main' },
      ports: [{ port: 80, targetPort: APP_PORT }],
      type: 'NodePort',
    },
  },
  k8sOpts,
)

// ── Routing: HTTPRoute on the shared Gateway (guideline §3a) ────────────────
// Resolve the gateway IP from its live status — never hardcode (guideline §3).
// @pulumi/kubernetes' generic CustomResource doesn't expose a CRD's `.status`, so
// read it with kubectl (re-resolved each apply; uses the ambient cluster creds).
const gatewayIpCmd = new command.local.Command('gateway-ip', {
  create:
    "kubectl get gateway shared-gateway -n gateway -o jsonpath='{.status.addresses[0].value}'",
})
const gatewayIp = gatewayIpCmd.stdout.apply((s) => s.trim())

const noindex = {
  type: 'ResponseHeaderModifier',
  responseHeaderModifier: { add: [{ name: 'X-Robots-Tag', value: 'noindex' }] },
}

new k8s.apiextensions.CustomResource(
  'route',
  {
    apiVersion: 'gateway.networking.k8s.io/v1',
    kind: 'HTTPRoute',
    metadata: { name: 'default', namespace },
    spec: {
      // Cloudflare terminates TLS for proxied *.redsoapp.com → bind the :80 listener.
      parentRefs: [{ name: 'shared-gateway', namespace: 'gateway', sectionName: 'http' }],
      hostnames: [DOMAIN],
      // Single backend: Payload's Next server handles /, /admin and /api.
      rules: [{ filters: [noindex], backendRefs: [{ name: mainSvc.metadata.name, port: 80 }] }],
    },
  },
  k8sOpts,
)

// Gateway LB health check — REQUIRED on the Gateway path (the readinessProbe does NOT
// configure it; without this the LB hits "/"). One policy per backend Service (§3c).
new k8s.apiextensions.CustomResource(
  'healthcheck-main',
  {
    apiVersion: 'networking.gke.io/v1',
    kind: 'HealthCheckPolicy',
    metadata: { name: 'main', namespace },
    spec: {
      default: {
        config: { type: 'HTTP', httpHealthCheck: { requestPath: '/healthz', port: APP_PORT } },
      },
      targetRef: { group: '', kind: 'Service', name: mainSvc.metadata.name },
    },
  },
  k8sOpts,
)

// ── DNS: Cloudflare A record → gateway IP, proxied (guideline §3) ───────────
const zone = cloudflare.getZoneOutput({ filter: { name: 'redsoapp.com' } })

new cloudflare.DnsRecord('dns', {
  zoneId: zone.zoneId,
  name: DOMAIN,
  content: gatewayIp,
  type: 'A',
  proxied: true,
  ttl: 1,
})

// ── Outputs ─────────────────────────────────────────────────────────────────
export const namespaceName = namespace
export const url = `https://${DOMAIN}`
export const gatewayAddress = gatewayIp
export const bucketName = bucket.name
export const artifactRegistry = pulumi.interpolate`${REGION}-docker.pkg.dev/${PROJECT}/${registry.repositoryId}`
export const dbConnection = pulumi.secret(databaseUrl)
