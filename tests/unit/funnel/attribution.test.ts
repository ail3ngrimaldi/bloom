import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  FUNNEL_SLUGS,
  hasAttribution,
  isKnownSlug,
  mergeAttribution,
  parseAttribution,
  parseStoredAttribution,
  slugClosing,
} from '@/funnel/attribution'
import { closingVariant, defaultClosing } from '@/funnel/flags'

describe('parseAttribution (PLAN-B 3.1 and 6.6)', () => {
  it('keeps the UTM parameters, the placement, the site source, fbclid and a known slug', () => {
    const search =
      '?utm_source=facebook&utm_medium=paid&utm_campaign=c1&utm_content=a2&utm_term=ad3' +
      '&placement=Instagram_Reels&site_source_name=ig&fbclid=abc123&slug=bloom-initial-pwyw'
    expect(parseAttribution(search)).toEqual({
      utm_source: 'facebook',
      utm_medium: 'paid',
      utm_campaign: 'c1',
      utm_content: 'a2',
      utm_term: 'ad3',
      placement: 'Instagram_Reels',
      site_source_name: 'ig',
      fbclid: 'abc123',
      slug: 'bloom-initial-pwyw',
    })
  })

  it('drops unknown keys, empty values, odd characters and very long values', () => {
    expect(parseAttribution('?utm_source=&email=a%40b.co&qa&closing=paywall')).toEqual({})
    expect(parseAttribution('?utm_source=a%0Ab')).toEqual({})
    expect(parseAttribution(`?fbclid=${'x'.repeat(257)}`)).toEqual({})
    expect(parseAttribution(`?fbclid=${'x'.repeat(256)}`)).toEqual({ fbclid: 'x'.repeat(256) })
  })

  it('ignores a slug the funnel does not know', () => {
    expect(parseAttribution('?slug=not-a-funnel')).toEqual({})
    expect(parseAttribution('?slug=__proto__')).toEqual({})
  })

  it('keeps the unresolved macros of an ad as they arrive', () => {
    expect(parseAttribution('?utm_campaign={{campaign.id}}')).toEqual({
      utm_campaign: '{{campaign.id}}',
    })
  })
})

describe('mergeAttribution', () => {
  it('is first touch: known keys stay, new keys are added', () => {
    const first = { utm_source: 'facebook' }
    const merged = mergeAttribution(first, { utm_source: 'google', utm_term: 't' })
    expect(merged).toEqual({ utm_source: 'facebook', utm_term: 't' })
    expect(mergeAttribution(merged, { utm_source: 'bing' })).toBe(merged)
    expect(mergeAttribution(merged, {})).toBe(merged)
  })

  it('reports whether there is anything to attach', () => {
    expect(hasAttribution({})).toBe(false)
    expect(hasAttribution({ utm_source: 'x' })).toBe(true)
  })
})

describe('parseStoredAttribution', () => {
  it('accepts nothing, or an object of clean strings for known keys', () => {
    expect(parseStoredAttribution(undefined)).toEqual({})
    expect(parseStoredAttribution({ utm_source: 'x', slug: 'bloom-initial-paywall' })).toEqual({
      utm_source: 'x',
      slug: 'bloom-initial-paywall',
    })
  })

  it('rejects anything else', () => {
    for (const raw of [
      null,
      'x',
      ['a'],
      { utm_source: 1 },
      { utm_source: '' },
      { utm_source: 'a\nb' },
    ])
      expect(parseStoredAttribution(raw)).toBeNull()
  })

  it('drops unknown keys and a slug that no longer exists, instead of losing the session', () => {
    expect(parseStoredAttribution({ utm_source: 'x', secret: 'y' })).toEqual({ utm_source: 'x' })
    expect(parseStoredAttribution({ utm_source: 'x', slug: 'nope' })).toEqual({ utm_source: 'x' })
  })
})

describe('funnel slugs (one per variant and language)', () => {
  it('knows the pay-what-you-want and the paywall funnels, in English', () => {
    expect(Object.keys(FUNNEL_SLUGS).sort()).toEqual([
      'bloom-initial-paywall',
      'bloom-initial-pwyw',
    ])
    expect(isKnownSlug('bloom-initial-pwyw')).toBe(true)
    expect(isKnownSlug('toString')).toBe(false)
    expect(slugClosing('bloom-initial-pwyw')).toBe('pwyw')
    expect(slugClosing('bloom-initial-paywall')).toBe('paywall')
    expect(slugClosing('nope')).toBeUndefined()
    expect(slugClosing(null)).toBeUndefined()
  })
})

describe('closingVariant (funnel.closing)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is "pwyw" by default (decision D9)', () => {
    expect(defaultClosing()).toBe('pwyw')
    expect(closingVariant('')).toBe('pwyw')
  })

  it('follows NEXT_PUBLIC_FUNNEL_CLOSING', () => {
    vi.stubEnv('NEXT_PUBLIC_FUNNEL_CLOSING', 'paywall')
    expect(defaultClosing()).toBe('paywall')
    expect(closingVariant('')).toBe('paywall')
    vi.stubEnv('NEXT_PUBLIC_FUNNEL_CLOSING', 'anything else')
    expect(defaultClosing()).toBe('pwyw')
  })

  it('takes ?closing= while the dev tools are on', () => {
    expect(closingVariant('?closing=paywall')).toBe('paywall')
    expect(closingVariant('?closing=pwyw')).toBe('pwyw')
    expect(closingVariant('?closing=nonsense')).toBe('pwyw')
  })

  it('ignores ?closing= in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    expect(closingVariant('?closing=paywall')).toBe('pwyw')
  })

  it('follows the slug the visitor arrived through, in production too', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    expect(closingVariant('', 'bloom-initial-paywall')).toBe('paywall')
    expect(closingVariant('?slug=bloom-initial-paywall')).toBe('paywall')
    expect(closingVariant('?slug=nope')).toBe('pwyw')
  })

  it('prefers the stored first-touch slug to a later one in the URL, and ?closing= to both', () => {
    expect(closingVariant('?slug=bloom-initial-pwyw', 'bloom-initial-paywall')).toBe('paywall')
    expect(closingVariant('?closing=pwyw', 'bloom-initial-paywall')).toBe('pwyw')
  })
})
