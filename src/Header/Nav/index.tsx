'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, SearchIcon, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // While the mobile menu is open, lock body scroll and allow Escape to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* Desktop nav (md and up) */}
      <nav className="hidden items-center gap-6 md:flex">
        {navItems.map(({ link }, i) => (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className="font-medium text-foreground no-underline hover:text-primary hover:no-underline"
          />
        ))}
        <Link className="text-foreground hover:text-primary" href="/search">
          <span className="sr-only">搜尋</span>
          <SearchIcon className="w-5" />
        </Link>
      </nav>

      {/* Mobile controls (below md): search + hamburger */}
      <div className="flex items-center gap-1 md:hidden">
        <Link
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
          href="/search"
        >
          <span className="sr-only">搜尋</span>
          <SearchIcon className="w-5" />
        </Link>
        <button
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? '關閉選單' : '開啟選單'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu sheet */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden
            className="absolute inset-0 bg-brand-foreground/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 border-b border-border bg-card shadow-xl">
            <div className="container flex items-center justify-between py-5">
              <span className="text-lg font-bold tracking-tight text-foreground">選單</span>
              <button
                aria-label="關閉選單"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="container pb-6" id="mobile-nav">
              <ul className="flex flex-col">
                {navItems.map(({ link }, i) => (
                  <li className="border-t border-border first:border-t-0" key={i}>
                    <CMSLink
                      {...link}
                      appearance="link"
                      className="block py-4 text-lg font-medium text-foreground no-underline hover:text-primary hover:no-underline"
                    />
                  </li>
                ))}
                <li className="border-t border-border">
                  <Link
                    className="flex items-center gap-2 py-4 text-lg font-medium text-foreground hover:text-primary"
                    href="/search"
                  >
                    <SearchIcon className="w-5" />
                    搜尋
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
