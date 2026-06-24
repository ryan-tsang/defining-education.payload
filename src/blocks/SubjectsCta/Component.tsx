import React from 'react'

import type { SubjectsCtaBlock as SubjectsCtaBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const SubjectsCtaBlock: React.FC<SubjectsCtaBlockProps> = ({
  description,
  heading,
  subjects,
}) => {
  return (
    <section className="w-full bg-secondary py-16 md:py-20">
      <div className="container flex flex-col gap-10">
        {(heading || description) && (
          <div className="flex flex-col items-center gap-4 text-center">
            {heading && (
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
            )}
            <span aria-hidden className="h-1 w-16 rounded-full bg-brand-yellow" />
            {description && <p className="max-w-2xl text-muted-foreground">{description}</p>}
          </div>
        )}

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {(subjects || []).map(({ link }, i) => {
            return (
              <li key={i}>
                <CMSLink
                  {...link}
                  appearance="inline"
                  className="flex items-center justify-center rounded-xl border border-border bg-card px-4 py-6 text-center text-base font-semibold text-foreground no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:no-underline hover:shadow-md"
                />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
