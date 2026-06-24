import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { LatestPostsBlock as LatestPostsBlockProps, Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'

const ZH_MONTHS = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
]

const DateBadge: React.FC<{ date?: string | null }> = ({ date }) => {
  if (!date) return null
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return null
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-col items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-center shadow-sm">
      <span className="text-2xl font-bold leading-none text-brand-foreground">
        {String(d.getDate()).padStart(2, '0')}
      </span>
      <span className="mt-0.5 text-xs font-medium text-accent-foreground">
        {ZH_MONTHS[d.getMonth()]}
      </span>
    </div>
  )
}

export const LatestPostsBlock: React.FC<LatestPostsBlockProps & { id?: string }> = async ({
  heading,
  intro,
  limit,
  link,
}) => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: limit || 6,
    sort: '-publishedAt',
    where: { _status: { equals: 'published' } },
  })

  const posts = docs as Post[]
  if (posts.length === 0) return null

  return (
    <section className="w-full bg-secondary py-16 md:py-20">
      <div className="container flex flex-col gap-10">
        {(heading || intro) && (
          <div className="flex flex-col items-center gap-4 text-center">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
            )}
            <span aria-hidden className="h-1 w-16 rounded-full bg-brand-yellow" />
            {intro && <p className="max-w-2xl text-muted-foreground">{intro}</p>}
          </div>
        )}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const href = `/posts/${post.slug}`
            const image = post.meta?.image || post.heroImage
            return (
              <li key={post.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <Link className="relative block aspect-[16/9] overflow-hidden bg-brand-foreground" href={href}>
                    <DateBadge date={post.publishedAt} />
                    {image && typeof image === 'object' ? (
                      <Media
                        fill
                        size="33vw"
                        imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                        resource={image}
                      />
                    ) : (
                      <div
                        aria-hidden
                        className="h-full w-full bg-gradient-to-br from-brand-foreground via-accent-foreground to-primary"
                      />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
                      <Link className="transition-colors hover:text-accent-foreground" href={href}>
                        {post.title}
                      </Link>
                    </h3>
                    {post.meta?.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {post.meta.description}
                      </p>
                    )}
                    <Link
                      className="mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold text-accent-foreground"
                      href={href}
                    >
                      閱讀更多
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>

        {link?.label && (
          <div className="flex justify-center">
            <CMSLink {...link} appearance="outline" size="lg" />
          </div>
        )}
      </div>
    </section>
  )
}
