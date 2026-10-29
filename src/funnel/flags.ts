import { isDevToolsEnabled } from '@/lib/env'

/**
 * The paywall countdown (decision D7, guardrail 6) is off unless the discount really ends:
 * NEXT_PUBLIC_PAYWALL_COUNTDOWN=1 turns it on for real; `?countdown` previews it where the dev
 * tools are on. Once on, it starts at 15:00 on the first paywall view and survives reloads.
 */
export function paywallCountdownEnabled(search: string): boolean {
  if (process.env.NEXT_PUBLIC_PAYWALL_COUNTDOWN === '1') return true
  return isDevToolsEnabled() && new URLSearchParams(search).has('countdown')
}

export const COUNTDOWN_SECONDS = 15 * 60

/** Prices are demo data (decision D4): the paywall labels them until real ones exist. */
export const DEMO_PRICES = true
