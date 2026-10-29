import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { inter, sourceSerif } from './fonts'
import '@/styles/tokens.css'
import '@/styles/global.css'

export const metadata: Metadata = {
  title: 'Bloom',
  description: 'Bloom: a short guided quiz that builds a personal plan.',
  // Pre-launch: keep the site out of search indexes until the owner decides otherwise.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Keep in sync with --bg-page-lilac in src/styles/tokens.css.
  themeColor: '#eceaff',
  colorScheme: 'light',
}

/*
 * The lilac page background is painted by global.css on html and body, so it is in the first
 * stylesheet the browser blocks on and there is no white or black flash before the page renders.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
