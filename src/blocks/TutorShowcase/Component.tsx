import React from 'react'

import type { TutorShowcaseBlock as TutorShowcaseBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'

export const TutorShowcaseBlock: React.FC<TutorShowcaseBlockProps> = ({
  heading,
  intro,
  tutors,
}) => {
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
        {(tutors || []).map((tutor, i) => {
          const { name, photo, subject } = tutor
          return (
            <li className="group flex flex-col items-center text-center" key={i}>
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
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm font-medium text-primary">{subject}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
