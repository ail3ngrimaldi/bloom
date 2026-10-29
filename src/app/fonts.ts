import localFont from 'next/font/local'

/*
 * Self-hosted variable fonts (latin subset of @fontsource-variable, SIL OFL, see src/assets/fonts):
 * no runtime request to Google Fonts, and the build works offline. next/font serves them from the
 * app's own origin and preloads them. tokens.css composes --font-sans and --font-serif from the
 * variables below, followed by the metric-matched 'Inter Fallback' declared in global.css.
 */
export const inter = localFont({
  src: '../assets/fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: false,
})

export const sourceSerif = localFont({
  src: '../assets/fonts/source-serif-4-latin-wght-normal.woff2',
  weight: '200 900',
  style: 'normal',
  display: 'swap',
  variable: '--font-source-serif',
  adjustFontFallback: false,
})
