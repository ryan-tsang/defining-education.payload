// Extracts the 11-character video ID from any common YouTube URL form
// (watch, youtu.be, embed, shorts, live) or a bare ID. Returns null when the
// input isn't a recognisable YouTube reference. Shared by the block's admin
// validation and the frontend renderer so both agree on what's valid.
export const getYouTubeID = (url: string | null | undefined): string | null => {
  if (!url) return null

  const trimmed = url.trim()

  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
    /youtube\.com\/live\/([\w-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = trimmed.match(pattern)
    if (match?.[1]) return match[1]
  }

  // Allow pasting a bare video ID.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed

  return null
}
