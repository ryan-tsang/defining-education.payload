import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import React, { cache } from 'react'

import type { Tutor } from '@/payload-types'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const tutors = await payload.find({
    collection: 'tutors',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return tutors.docs.map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function TutorPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/tutors/' + decodedSlug
  const tutor = await queryTutorBySlug({ slug: decodedSlug })

  if (!tutor) return <PayloadRedirects url={url} />

  const hasPhoto = tutor.photo && typeof tutor.photo === 'object'
  const courseHref = `/search?q=${encodeURIComponent(tutor.name)}`

  return (
    <article className="pb-24">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-brand-foreground text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-yellow/20 blur-3xl"
        />
        <div className="container relative z-10 flex flex-col items-center gap-8 py-20 text-center md:flex-row md:items-center md:gap-12 md:py-24 md:text-left">
          <div className="relative aspect-square w-44 shrink-0 overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 md:w-56">
            {hasPhoto ? (
              <Media fill imgClassName="object-cover" resource={tutor.photo} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white/90">
                {tutor.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-3 md:items-start">
            <span className="inline-flex rounded-full bg-brand-yellow px-3 py-1 text-sm font-semibold text-brand-yellow-foreground">
              {tutor.subject}
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{tutor.name}</h1>
            {tutor.nameEn && <p className="text-lg uppercase tracking-wide opacity-80">{tutor.nameEn}</p>}
          </div>
        </div>
      </section>

      <div className="container flex flex-col gap-10 pt-12">
        {tutor.bio && (
          <RichText className="mx-auto max-w-3xl" data={tutor.bio} enableGutter={false} />
        )}

        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4">
          <Link
            href={courseHref}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            查看{tutor.name}的課程
          </Link>
          <Link
            href="/tutors"
            className="inline-flex items-center gap-1 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground no-underline transition-colors hover:border-primary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            所有名師
          </Link>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const tutor = await queryTutorBySlug({ slug: decodeURIComponent(slug) })
  if (!tutor) return { title: '凝皓教育 Defining Education' }
  const title = `${tutor.name}${tutor.nameEn ? ` ${tutor.nameEn}` : ''}｜本校名師 - 凝皓教育`
  return {
    title,
    description: `${tutor.name}（${tutor.subject}）— 凝皓教育 DSE ${tutor.subject}科名師。`,
  }
}

const queryTutorBySlug = cache(async ({ slug }: { slug: string }): Promise<Tutor | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'tutors',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return (result.docs?.[0] as Tutor) || null
})
