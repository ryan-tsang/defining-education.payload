import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { TutorShowcaseBlock as TutorShowcaseBlockProps, Tutor } from '@/payload-types'

import { Media } from '@/components/Media'

export const TutorShowcaseBlock: React.FC<TutorShowcaseBlockProps> = async ({
  heading,
  intro,
  limit,
  showAll,
  tutors,
}) => {
  let docs: Tutor[] = []

  if (showAll) {
    const payload = await getPayload({ config: configPromise })
    const { docs: found } = await payload.find({
      collection: 'tutors',
      depth: 1,
      limit: limit || 100,
      sort: 'createdAt',
      where: { _status: { equals: 'published' } },
    })
    docs = found as Tutor[]
  } else {
    docs = (tutors || []).filter((t): t is Tutor => typeof t === 'object')
  }

  if (docs.length === 0) return null

  return (
    <section className="container">
      {(heading || intro) && (
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          {heading && <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>}
          <span aria-hidden className="h-1 w-16 rounded-full bg-brand-yellow" />
          {intro && <p className="max-w-2xl text-muted-foreground">{intro}</p>}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {docs.map((tutor) => {
          const { name, nameEn, photo, slug, subject } = tutor
          const Inner = (
            <>
              <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-2xl bg-secondary ring-1 ring-border">
                {photo && typeof photo === 'object' ? (
                  <Media
                    fill
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                    resource={photo}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent text-4xl font-bold text-accent-foreground">
                    {name?.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent-foreground">
                {name}
              </h3>
              <p className="text-sm font-medium text-accent-foreground">{nameEn || subject}</p>
              {nameEn && <p className="text-xs text-muted-foreground">{subject}</p>}
            </>
          )

          return (
            <li className="group flex flex-col text-center" key={tutor.id}>
              {slug ? (
                <Link className="flex flex-col items-center no-underline" href={`/tutors/${slug}`}>
                  {Inner}
                </Link>
              ) : (
                <div className="flex flex-col items-center">{Inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
