/**
 * Two build-time switches (Next inlines the literal `process.env.X` reads).
 *
 * isDevToolsEnabled(): QA tooling that must never reach real users (demo content, the step-guard
 * bypass, debug flags). On in `next dev` and on Vercel PREVIEW deployments: next.config.ts derives
 * NEXT_PUBLIC_VERCEL_ENV from VERCEL_ENV and turns NEXT_PUBLIC_ENABLE_DEV_TOOLS on by default
 * there (NEXT_PUBLIC_ENABLE_DEV_TOOLS=0 hides it). The production environment never qualifies,
 * even with the variable set.
 *
 * isGalleryEnabled(): the UI gallery, which only holds design-system components. While the site is
 * pre-launch it is also visible on the Vercel Production deployment so the owner can look at the
 * work: next.config.ts turns NEXT_PUBLIC_SHOW_GALLERY on by default for every Vercel build. At
 * launch, set NEXT_PUBLIC_SHOW_GALLERY=0 on the Production environment and redeploy.
 */
export function isDevToolsEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' &&
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === '1'
  )
}

export function isGalleryEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') return true
  return process.env.NEXT_PUBLIC_SHOW_GALLERY === '1'
}
