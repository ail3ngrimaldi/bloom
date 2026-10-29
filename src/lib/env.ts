/**
 * QA tooling (the UI gallery, demo content) is on in `next dev` and 404s in production. The one
 * production exception is a Vercel PREVIEW deployment that opts in with
 * NEXT_PUBLIC_ENABLE_DEV_TOOLS=1, so the team can review layout there; the production
 * environment never qualifies.
 *
 * NEXT_PUBLIC_VERCEL_ENV is Vercel's VERCEL_ENV ('production' | 'preview' | 'development'),
 * exposed to the code by enabling "Automatically expose System Environment Variables" in the
 * project settings. Both variables are read as literal `process.env.X` so Next inlines them.
 */
export function isDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === '1'
  )
}
