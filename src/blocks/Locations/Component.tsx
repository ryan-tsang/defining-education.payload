import React from 'react'
import { Clock, MapPin, Phone } from 'lucide-react'

import type { LocationsBlock as LocationsBlockProps } from '@/payload-types'

export const LocationsBlock: React.FC<LocationsBlockProps> = ({
  branches,
  heading,
  intro,
}) => {
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
          {(branches || []).map((branch, i) => {
            const { address, hours, mapUrl, name, phone } = branch
            return (
              <li
                className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm"
                key={i}
              >
                <h3 className="text-lg font-semibold text-brand-foreground">{name}</h3>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {address && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                      <span>{address}</span>
                    </p>
                  )}
                  {phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-accent-foreground" />
                      <span>{phone}</span>
                    </p>
                  )}
                  {hours && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-accent-foreground" />
                      <span>{hours}</span>
                    </p>
                  )}
                </div>
                {mapUrl && (
                  <a
                    className="mt-auto inline-flex w-fit items-center gap-1 pt-2 text-sm font-semibold text-accent-foreground hover:underline"
                    href={mapUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    查看地圖
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
