import { isDevToolsEnabled } from '@/lib/env'
import { slugClosing } from './attribution'
import type { ClosingVariant } from './types'

/**
 * The paywall countdown (decision D7, guardrail 5) is off unless the discount really ends:
 * NEXT_PUBLIC_PAYWALL_COUNTDOWN=1 turns it on for real; `?countdown` previews it where the dev
 * tools are on. Once on, it starts when the discount is granted (the first paywall view on the
 * paywall of the A closing) and survives reloads. This is `paywall.countdown.enabled`, one flag for
 * both closings.
 */
export function paywallCountdownEnabled(search: string): boolean {
  if (process.env.NEXT_PUBLIC_PAYWALL_COUNTDOWN === '1') return true
  return isDevToolsEnabled() && new URLSearchParams(search).has('countdown')
}

export const COUNTDOWN_SECONDS = 15 * 60

/** Prices are demo data (decision D4): the closing screens label them until real ones exist. */
export const DEMO_PRICES = true

export function isClosingVariant(value: unknown): value is ClosingVariant {
  return value === 'paywall' || value === 'pwyw'
}

/** `funnel.closing` when nothing else picks one: NEXT_PUBLIC_FUNNEL_CLOSING, else "pwyw" (D9). */
export function defaultClosing(): ClosingVariant {
  return process.env.NEXT_PUBLIC_FUNNEL_CLOSING === 'paywall' ? 'paywall' : 'pwyw'
}

/**
 * `funnel.closing`: which closing the visitor walks. In order: `?closing=` (only where the dev tools
 * are on, never in production), the closing of the funnel slug they arrived through (the stored
 * first-touch slug, else the one in the URL), then the build default. Call it where `window`
 * exists; on the server use defaultClosing().
 */
export function closingVariant(search: string, slug?: string | null): ClosingVariant {
  const params = new URLSearchParams(search)
  if (isDevToolsEnabled()) {
    const requested = params.get('closing')
    if (isClosingVariant(requested)) return requested
  }
  return slugClosing(slug) ?? slugClosing(params.get('slug')) ?? defaultClosing()
}
