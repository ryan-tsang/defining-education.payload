// Extracts the 11-character video ID from any common YouTube URL form
// (watch, youtu.be, embed, shorts, live) or a bare ID. Returns null when the
// input isn't a recognisable YouTube reference. Shared by the block's admin
// validation and the frontend renderer so both agree on what's valid.
//
// The host is validated against the real YouTube domains (so look-alikes like
// notyoutube.com or evil.com/youtube.com/... are rejected) and the ID must be
// exactly 11 chars (so a malformed/over-length token is rejected rather than
// silently truncated to its first 11 characters).
const ID = /^[\w-]{11}$/

const isYouTubeHost = (hostname: string): 'youtu.be' | 'youtube.com' | null => {
  const host = hostname.replace(/^(www\.|m\.|music\.)/, '')
  if (host === 'youtu.be') return 'youtu.be'
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) return 'youtube.com'
  return null
}

export const getYouTubeID = (url: string | null | undefined): string | null => {
  if (!url) return null

  const trimmed = url.trim()
  if (!trimmed) return null

  // Allow pasting a bare video ID.
  if (ID.test(trimmed)) return trimmed

  let parsed: URL
  try {
    parsed = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = isYouTubeHost(parsed.hostname)
  if (!host) return null

  // youtu.be/<id>
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0]
    return ID.test(id) ? id : null
  }

  // youtube.com/watch?v=<id> (any param order)
  const v = parsed.searchParams.get('v')
  if (v && ID.test(v)) return v

  // youtube.com/{embed,shorts,live,v}/<id>
  const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]+)/)
  if (match && ID.test(match[1])) return match[1]

  return null
}
