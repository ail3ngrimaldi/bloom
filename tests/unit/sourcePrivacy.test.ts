import { describe, expect, it } from 'vitest'
import { filesUnder, readText } from './helpers/repo'

/**
 * Guardrail 7 of PLAN-B 2: nothing of the source material's owner reaches code, fixtures or tests:
 * not their email, not their name, not their payment method. The values are not written here;
 * the guard finds them by shape: an email at a domain that is not reserved for examples and tests,
 * and a run of digits that looks like a card number.
 */
const SCANNED = ['src', 'tests', 'scripts']
const TEXT = /\.(?:tsx?|jsx?|mjs|cjs|css|json|md|svg|html|txt)$/i

/** example.* and the domains RFC 2606 and RFC 6761 reserve for tests, plus localhost. */
const RESERVED_DOMAIN = /(?:^|\.)(?:example(?:\.[a-z]+)?|test|invalid|localhost|local)$/i

/**
 * Synthetic addresses that existing tests already use (lead and state tests; `a@b.c` is an invalid
 * one on purpose). They name nobody; anything else at a real-looking domain fails.
 */
const ALLOWED = new Set(['a@b.co', 'a@b.c', 'b@c.co', 'x@sub.domain.io'])

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g
// 13 to 19 digits, plain or in groups of four separated by a space or a dash.
const CARD_PLAIN = /(?<![\w.#-])\d{13,19}(?![\w.-])/g
const CARD_GROUPED = /(?<![\w.#-])(?:\d{4}[ -]){3}\d{1,7}(?![\w.-])/g

function emailsAt(path: string, text: string): string[] {
  const found: string[] = []
  for (const match of text.matchAll(EMAIL)) {
    const email = match[0]
    const domain = email.slice(email.indexOf('@') + 1)
    if (RESERVED_DOMAIN.test(domain) || ALLOWED.has(email)) continue
    // A scoped npm package or a file name such as logo@2x.png is not an address.
    if (/\.(?:png|jpe?g|webp|svg|gif|woff2?)$/i.test(domain)) continue
    found.push(`${path}: ${email}`)
  }
  return found
}

function cardNumbersAt(path: string, text: string): string[] {
  const found: string[] = []
  for (const pattern of [CARD_PLAIN, CARD_GROUPED])
    for (const match of text.matchAll(pattern)) found.push(`${path}: ${match[0].length} digits`)
  return found
}

describe('source material privacy (guardrail 7)', () => {
  const files = SCANNED.flatMap((dir) => filesUnder(dir)).filter((path) => TEXT.test(path))

  it('scans the product source, the tests and the scripts', () => {
    expect(files.length).toBeGreaterThan(100)
    expect(files).toContain('tests/unit/sourcePrivacy.test.ts')
  })

  it('has no email at a domain that is not reserved for examples and tests', () => {
    const offenders = files.flatMap((path) => emailsAt(path, readText(path)))
    expect(offenders).toEqual([])
  })

  it('has no run of digits shaped like a card number', () => {
    const offenders = files.flatMap((path) => cardNumbersAt(path, readText(path)))
    expect(offenders).toEqual([])
  })

  describe('the detectors themselves', () => {
    it('flag a real-looking address and let the reserved ones through', () => {
      // Built from pieces: this file must not hold an address of a real domain either.
      const real = ['someone', ['mail', 'provider', 'com'].join('.')].join('@')
      const sample = `a ${real} b qa@example.com c qa@example.test d x@sub.domain.io e q@x.invalid`
      expect(emailsAt('sample', sample)).toEqual([`sample: ${real}`])
    })

    it('flag card-shaped digits, plain or grouped, and not shorter numbers', () => {
      const digits = (count: number) => '7'.repeat(count)
      expect(cardNumbersAt('sample', `n ${digits(16)} m`)).toHaveLength(1)
      expect(
        cardNumbersAt('sample', `n ${digits(4)} ${digits(4)} ${digits(4)} ${digits(4)} m`),
      ).toHaveLength(1)
      expect(
        cardNumbersAt('sample', `ms ${digits(12)} and 901_000 and 0.${digits(14)}`),
      ).toHaveLength(0)
    })
  })
})
