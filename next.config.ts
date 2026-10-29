import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Next refuses two dev servers on the same distDir, so parallel runs set NEXT_DIST_DIR=.next-<tag>.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  async rewrites() {
    // The QA gallery keeps the URL of the plan (/__gallery). App Router treats folders that start
    // with an underscore as private (not routable), so the real folder is src/app/gallery.
    return [{ source: '/__gallery/:path*', destination: '/gallery/:path*' }]
  },
}

export default nextConfig
