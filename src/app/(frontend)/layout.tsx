import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Noto_Sans_HK } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

// Traditional Chinese + Latin brand font, matching the live site.
// preload disabled: CJK font files are too large to preload up front.
const notoSansHK = Noto_Sans_HK({
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
  preload: false,
  variable: '--font-noto',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    // Light-only brand site — theme is fixed to match definingeducation.com.hk.
    <html
      className={cn(notoSansHK.variable, GeistMono.variable)}
      data-theme="light"
      lang="zh-HK"
      suppressHydrationWarning
    >
      <head>
        <link href="/de-logo-mark.png" rel="icon" sizes="any" type="image/png" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
