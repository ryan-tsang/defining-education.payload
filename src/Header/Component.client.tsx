'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { CMSLink } from '@/components/Link'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const subjectItems = data?.subjectItems || []

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="relative z-20 border-b border-border bg-background"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      {/* Top bar: logo + nav links + search + auth */}
      <div className="container">
        <div className="flex items-center gap-6 py-4 md:py-5">
          <Link className="shrink-0" href="/">
            <Logo loading="eager" priority="high" />
          </Link>
          <HeaderNav data={data} />
        </div>
      </div>

      {/* Subject categories bar (desktop only; mobile shows them inside the menu) */}
      {subjectItems.length > 0 && (
        <div className="hidden border-t border-border bg-muted/40 md:block">
          <div className="container">
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 py-2.5" aria-label="科目分類">
              {subjectItems.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  className="text-sm font-medium text-foreground/80 no-underline transition-colors hover:text-primary hover:no-underline"
                />
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
