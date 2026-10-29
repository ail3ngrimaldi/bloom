/**
 * QA tooling (the UI gallery, demo content) is on in `next dev` and 404s in production. The one
 * production-build exception is a Vercel PREVIEW deployment: next.config.ts derives
 * NEXT_PUBLIC_VERCEL_ENV from Vercel's VERCEL_ENV and turns NEXT_PUBLIC_ENABLE_DEV_TOOLS on by
 * default there, so whoever opens a preview sees the gallery with no configuration. Set
 * NEXT_PUBLIC_ENABLE_DEV_TOOLS=0 on the Preview environment to hide it again. The production
 * environment never qualifies, even with the variable set.
 *
 * Both variables are read as literal `process.env.X` so Next inlines them at build time.
 */
export function isDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === '1'
  )
}
