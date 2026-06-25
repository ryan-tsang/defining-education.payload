// Cheap, dependency-free health endpoint for the GKE load balancer + k8s probes
// (Redso dev guideline §3c). Must never touch the DB, auth, or SSR — just a static 200.
export const dynamic = 'force-static'

export function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/plain' },
  })
}
