import type { NextConfig } from 'next'

// Vercel sets VERCEL_ENV ('production' | 'preview' | 'development') on every build. It is mirrored
// into NEXT_PUBLIC_VERCEL_ENV so the dev-tools switch (src/lib/env.ts) does not depend on anyone
// enabling "Automatically expose System Environment Variables" in the dashboard.
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? ''

// Preview deployments show the QA tools (UI gallery, demo content) by default, so a reviewer sees
// something without configuring anything. NEXT_PUBLIC_ENABLE_DEV_TOOLS=0 hides them again; the
// production environment never shows them (isDevToolsEnabled checks the environment too).
const devTools = process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS ?? (vercelEnv === 'preview' ? '1' : '')

// The gallery only holds design-system components, so while the site is pre-launch it is shown on
// every Vercel deployment, Production included, to let the owner look at the work. At launch set
// NEXT_PUBLIC_SHOW_GALLERY=0 on the Production environment. Builds outside Vercel keep it hidden.
const showGallery = process.env.NEXT_PUBLIC_SHOW_GALLERY ?? (vercelEnv ? '1' : '')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_VERCEL_ENV: vercelEnv,
    NEXT_PUBLIC_ENABLE_DEV_TOOLS: devTools,
    NEXT_PUBLIC_SHOW_GALLERY: showGallery,
  },
  // Next refuses two dev servers on the same distDir, so parallel runs set NEXT_DIST_DIR=.next-<tag>.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Dev only. Next blocks dev resources (HMR) requested from any origin but localhost, and the page
  // then never hydrates; scripts and tools that open http://127.0.0.1:<port> need this entry.
  allowedDevOrigins: ['127.0.0.1'],
  // Keeps the "N" route badge out of dev-server screenshots (visual comparison); errors still show.
  devIndicators: false,
  typescript: {
    // Next rewrites the tsconfig it type-checks with (it adds `<distDir>/types/**` to `include`,
    // which differs per NEXT_DIST_DIR). A config that extends another is left alone, so Next uses
    // this shim and tsconfig.json stays the single hand-written source.
    tsconfigPath: 'tsconfig.next.json',
  },
  async rewrites() {
    // The QA gallery keeps the URL of the plan (/__gallery). App Router treats folders that start
    // with an underscore as private (not routable), so the real folder is src/app/gallery.
    return [{ source: '/__gallery/:path*', destination: '/gallery/:path*' }]
  },
}

export default nextConfig
