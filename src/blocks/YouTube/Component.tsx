import React from 'react'

import type { YouTubeBlock as YouTubeBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { getYouTubeID } from './getYouTubeID'

// Renders a YouTube embed as a responsive 16:9 iframe. Uses the privacy-friendly
// youtube-nocookie host. Returns null when the stored URL can't be parsed so a
// bad link never breaks the surrounding rich text.
export const YouTubeBlock: React.FC<YouTubeBlockProps & { className?: string }> = ({
  className,
  url,
  caption,
}) => {
  const id = getYouTubeID(url)
  if (!id) return null

  return (
    <div className={cn('not-prose my-6', className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-[0.8rem]">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={caption || 'YouTube video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {caption && <p className="mt-2 text-center text-sm text-muted-foreground">{caption}</p>}
    </div>
  )
}
