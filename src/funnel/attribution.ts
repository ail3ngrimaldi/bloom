import type { ClosingVariant } from './types'

/**
 * Where a visit comes from (PLAN-B 3.1 and 6.6). The ad's destination URL carries UTM parameters,
 * the placement and the funnel slug; they are kept for the session and travel with the lead and the
 * analytics events. Nothing here is sent anywhere by itself.
 */
export const ATTRIBUTION_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'placement',
  'site_source_name',
  'fbclid',
] as const

export type AttributionKey = (typeof ATTRIBUTION_PARAMS)[number] | 'slug'

/** The attribution of a visit; only the keys that arrived are present. */
export type Attribution = Readonly<Partial<Record<AttributionKey, string>>>

export const NO_ATTRIBUTION: Attribution = {}

/**
 * One slug per funnel variant and language (/onboarding/<slug>). The slug picks the closing and,
 * once there are more languages, the copy. Only English exists for now (decision D14).
 */
export const FUNNEL_SLUGS: Readonly<Record<string, { closing: ClosingVariant; locale: 'en' }>> = {
  'bloom-initial-pwyw': { closing: 'pwyw', locale: 'en' },
  'bloom-initial-paywall': { closing: 'paywall', locale: 'en' },
}

export function isKnownSlug(slug: string): boolean {
  return Object.hasOwn(FUNNEL_SLUGS, slug)
}

/** The closing a slug selects, or undefined for an unknown slug. */
export function slugClosing(slug: string | null | undefined): ClosingVariant | undefined {
  return slug && isKnownSlug(slug) ? FUNNEL_SLUGS[slug].closing : undefined
}

const MAX_VALUE_LENGTH = 256
// Printable characters only: the values end up in analytics payloads and logs.
const PRINTABLE = /^[ -~]+$/

function clean(value: string | null): string | null {
  const trimmed = value?.trim() ?? ''
  return trimmed !== '' && trimmed.length <= MAX_VALUE_LENGTH && PRINTABLE.test(trimmed)
    ? trimmed
    : null
}

/** Reads the attribution out of a query string. Unknown keys, empty and odd values are dropped. */
export function parseAttribution(search: string): Attribution {
  const params = new URLSearchParams(search)
  const found: Partial<Record<AttributionKey, string>> = {}
  for (const key of ATTRIBUTION_PARAMS) {
    const value = clean(params.get(key))
    if (value !== null) found[key] = value
  }
  const slug = clean(params.get('slug'))
  if (slug !== null && isKnownSlug(slug)) found.slug = slug
  return found
}

/** First touch wins: keys already known are kept, new ones are added. */
export function mergeAttribution(current: Attribution, incoming: Attribution): Attribution {
  const added = (Object.keys(incoming) as AttributionKey[]).filter(
    (key) => current[key] === undefined,
  )
  if (added.length === 0) return current
  const merged: Partial<Record<AttributionKey, string>> = { ...current }
  for (const key of added) merged[key] = incoming[key]
  return merged
}

export function hasAttribution(attribution: Attribution): boolean {
  return Object.keys(attribution).length > 0
}

/** Validates attribution read back from storage: only known keys with clean values survive. */
export function parseStoredAttribution(raw: unknown): Attribution | null {
  if (raw === undefined) return NO_ATTRIBUTION
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const found: Partial<Record<AttributionKey, string>> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== 'string') return null
    if (
      key === 'slug' ? isKnownSlug(value) : (ATTRIBUTION_PARAMS as readonly string[]).includes(key)
    ) {
      if (clean(value) === null) return null
      found[key as AttributionKey] = value
    }
  }
  return found
}
