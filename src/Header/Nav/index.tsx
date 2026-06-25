'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, SearchIcon, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

// Frontend auth routes don't exist yet — these are placeholder CTAs to wire up.
const LOGIN_HREF = '/login'
const SIGNUP_HREF = '/register'

const SearchField: React.FC<{ className?: string; autoFocus?: boolean }> = ({
  className,
  autoFocus,
}) => (
  <form
    action="/search"
    method="get"
    role="search"
    className={
      'flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2 transition-colors focus-within:border-primary ' +
      (className ?? '')
    }
  >
    <SearchIcon className="w-4 shrink-0 text-muted-foreground" />
    <input
      autoFocus={autoFocus}
      name="q"
      type="search"
      placeholder="搜尋課程"
      aria-label="搜尋課程"
      className="w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
    />
  </form>
)

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const subjectItems = data?.subjectItems || []
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
      {/* Desktop nav (md and up): nav links · search · auth */}
      <div className="hidden flex-1 items-center gap-5 md:flex">
        <nav className="flex shrink-0 items-center gap-5">
          {navItems.map(({ link }, i) => (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="font-medium text-foreground no-underline hover:text-primary hover:no-underline"
            />
          ))}
        </nav>

        <SearchField className="max-w-sm flex-1" />

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={LOGIN_HREF}
            className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary no-underline transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            登入
          </Link>
          <Link
            href={SIGNUP_HREF}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
          >
            免費註冊
          </Link>
        </div>
      </div>

      {/* Mobile controls (below md): search + hamburger */}
      <div className="ml-auto flex items-center gap-1 md:hidden">
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
          <div className="absolute inset-x-0 top-0 max-h-screen overflow-y-auto border-b border-border bg-card shadow-xl">
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
            <div className="container pb-6">
              <SearchField autoFocus className="mb-4" />

              <nav id="mobile-nav">
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
                </ul>
              </nav>

              {/* Subject categories */}
              {subjectItems.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-3 text-sm font-semibold text-muted-foreground">科目分類</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-3">
                    {subjectItems.map(({ link }, i) => (
                      <CMSLink
                        key={i}
                        {...link}
                        appearance="link"
                        className="text-base font-medium text-foreground no-underline hover:text-primary hover:no-underline"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Auth CTAs */}
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={LOGIN_HREF}
                  className="rounded-full border border-primary px-5 py-3 text-center text-base font-semibold text-primary no-underline hover:bg-primary hover:text-primary-foreground"
                >
                  登入
                </Link>
                <Link
                  href={SIGNUP_HREF}
                  className="rounded-full bg-primary px-5 py-3 text-center text-base font-semibold text-primary-foreground no-underline hover:bg-primary/90"
                >
                  免費註冊
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
