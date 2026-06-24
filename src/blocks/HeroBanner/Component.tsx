import React from 'react'

import type { HeroBannerBlock as HeroBannerBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'

export const HeroBannerBlock: React.FC<HeroBannerBlockProps> = ({ links, media, richText }) => {
  const hasMedia = media && typeof media === 'object'

  return (
    <section className="relative w-full overflow-hidden bg-brand-foreground text-white">
      {hasMedia && <Media fill priority imgClassName="object-cover" resource={media} />}

      {/* Brand scrim — keeps the heading legible over any photo, and provides a
          teal gradient wash when no image is set. */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0',
          hasMedia
            ? 'bg-brand-foreground/80'
            : 'bg-gradient-to-br from-brand-foreground via-brand-foreground to-accent-foreground',
        )}
      />

      {/* Soft yellow brand accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-yellow/25 blur-3xl"
      />

      <div className="container relative z-10 flex min-h-[26rem] flex-col items-center justify-center gap-8 py-20 text-center md:min-h-[32rem] md:py-28">
        {richText && (
          <RichText
            className="max-w-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_p]:text-lg [&_p]:opacity-90 md:[&_p]:text-xl"
            data={richText}
            enableGutter={false}
          />
        )}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} size="lg" />
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
