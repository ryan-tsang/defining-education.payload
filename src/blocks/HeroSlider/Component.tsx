'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { HeroSliderBlock as HeroSliderBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Slide = NonNullable<HeroSliderBlockProps['slides']>[number]

// Mirror CMSLink's href resolution so a whole slide can be wrapped in a link
// without nesting anchors inside the call-to-action button.
const resolveHref = (link: Slide['link']): { href: string; newTab: boolean } | null => {
  if (!link) return null
  const { type, reference, url, newTab } = link
  const href =
    type === 'reference' && reference && typeof reference.value === 'object' && reference.value.slug
      ? `${reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''}/${reference.value.slug}`
      : url
  if (!href) return null
  return { href, newTab: Boolean(newTab) }
}

export const HeroSliderBlock: React.FC<HeroSliderBlockProps> = ({ slides, autoplay, interval }) => {
  const items = (slides || []).filter((s) => s && typeof s.image === 'object')
  const count = items.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const go = useCallback((next: number) => setActive((next + count) % count), [count])

  useEffect(() => {
    if (!autoplay || paused || count < 2) return
    const ms = Math.max(2, interval || 6) * 1000
    const id = setInterval(() => setActive((i) => (i + 1) % count), ms)
    return () => clearInterval(id)
  }, [autoplay, interval, paused, count])

  if (count === 0) return null

  return (
    <section
      aria-roledescription="carousel"
      className="relative w-full overflow-hidden bg-brand-foreground"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[5/2]">
        {items.map((slide, i) => {
          const { image, eyebrow, heading, subheading, ctaLabel, link } = slide
          const target = resolveHref(link)
          const isActive = i === active
          const hasOverlay = Boolean(eyebrow || heading || subheading || ctaLabel)

          const slideInner = (
            <>
              {typeof image === 'object' && (
                <Media fill priority={i === 0} imgClassName="object-cover" resource={image} />
              )}

              {hasOverlay && (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-brand-foreground/80 via-brand-foreground/25 to-transparent"
                  />
                  <div className="container relative z-10 flex h-full flex-col items-start justify-end gap-3 pb-14 text-white md:gap-4 md:pb-20">
                    {eyebrow && (
                      <span className="rounded-full bg-brand-yellow px-3 py-1 text-sm font-semibold text-brand-yellow-foreground">
                        {eyebrow}
                      </span>
                    )}
                    {heading && (
                      <h2 className="max-w-2xl text-2xl font-bold tracking-tight drop-shadow-sm md:text-4xl lg:text-5xl">
                        {heading}
                      </h2>
                    )}
                    {subheading && (
                      <p className="max-w-xl text-sm opacity-90 md:text-lg">{subheading}</p>
                    )}
                    {ctaLabel && (
                      <span
                        className={cn(
                          'mt-1 inline-flex items-center rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors md:text-base',
                          link?.appearance === 'outline'
                            ? 'border border-white/80 bg-transparent text-white'
                            : 'bg-primary text-primary-foreground',
                        )}
                      >
                        {ctaLabel}
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          )

          return (
            <div
              aria-hidden={!isActive}
              aria-label={`${i + 1} / ${count}`}
              aria-roledescription="slide"
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-in-out',
                isActive ? 'z-[1] opacity-100' : 'pointer-events-none z-0 opacity-0',
              )}
              key={i}
              role="group"
            >
              {target ? (
                <Link
                  className="relative block h-full w-full"
                  href={target.href}
                  tabIndex={isActive ? 0 : -1}
                  {...(target.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                >
                  {slideInner}
                </Link>
              ) : (
                slideInner
              )}
            </div>
          )
        })}
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="上一張"
            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm transition-colors hover:bg-white/50 md:left-6 md:h-12 md:w-12"
            onClick={() => go(active - 1)}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="下一張"
            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/30 text-white backdrop-blur-sm transition-colors hover:bg-white/50 md:right-6 md:h-12 md:w-12"
            onClick={() => go(active + 1)}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {items.map((_, i) => (
              <button
                aria-current={i === active}
                aria-label={`前往第 ${i + 1} 張`}
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  i === active ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80',
                )}
                key={i}
                onClick={() => setActive(i)}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
