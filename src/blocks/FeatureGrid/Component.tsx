import React from 'react'

import type { FeatureGridBlock as FeatureGridBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'

const colClasses: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export const FeatureGridBlock: React.FC<FeatureGridBlockProps> = ({
  columns,
  heading,
  intro,
  items,
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

      <ul className={cn('grid grid-cols-1 gap-6', colClasses[columns || 3])}>
        {(items || []).map((item, i) => {
          const { description, icon, title } = item
          return (
            <li
              className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              key={i}
            >
              {icon && (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-2xl text-accent-foreground">
                  {icon}
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
