import { describe, expect, it } from 'vitest'
import { CLAIMS } from '@/funnel/claims'
import { copy, interpolate } from '@/funnel/copy'
import { audienceFor, personalize, templateVars } from '@/funnel/personalize'
import { STEP_IDS } from '@/funnel/steps'

describe('audience (PLAN 6.3)', () => {
  it('follows the gender answer: male -> men, female -> women, non-binary -> people', () => {
    expect(audienceFor({ gender: 'male' })).toBe('men')
    expect(audienceFor({ gender: 'female' })).toBe('women')
    expect(audienceFor({ gender: 'non_binary' })).toBe('people')
  })

  it('defaults to people without an answer or with an unknown one', () => {
    expect(audienceFor({})).toBe('people')
    expect(audienceFor({ gender: 'other' })).toBe('people')
    expect(audienceFor({ gender: ['male'] })).toBe('people')
  })
})

describe('interpolate', () => {
  it('replaces known placeholders, dotted ones included, and keeps unknown ones visible', () => {
    expect(interpolate('{{a}} and {{ b.c }}', { a: 1, 'b.c': 'two' })).toBe('1 and two')
    expect(interpolate('Hi {{missing}}', {})).toBe('Hi {{missing}}')
  })
})

describe('personalize', () => {
  it('fills the brand and the audience', () => {
    expect(personalize('{{brand}} for {{audience}}', { gender: 'male' })).toBe('Bloom for men')
    expect(personalize('{{brand}} for {{audience}}', {})).toBe('Bloom for people')
  })

  it('always offers the claim figures (guardrail 2 of PLAN-B 2): there is no gate', () => {
    expect(Object.keys(templateVars({}))).toContain('claims.users')
    expect(personalize('Join over {{claims.users}} {{audience}}', { gender: 'male' })).toBe(
      `Join over ${CLAIMS.users.value} men`,
    )
  })

  it('leaves no placeholder in any text of the funnel', () => {
    const texts: string[] = []
    const collect = (node: unknown) => {
      if (typeof node === 'string') texts.push(node)
      else if (node && typeof node === 'object')
        for (const value of Object.values(node)) collect(value)
    }
    for (const id of STEP_IDS) collect(copy.steps[id])
    // Filled by the screens that own them (wand counter, expert title, summary meter, evidence
    // outcome, paywall, checkout and plan-sheet amounts and dates, legal links, the gift); every
    // other placeholder must be a funnel one.
    const screenVars = Object.fromEntries(
      [
        'count',
        'total',
        'label',
        'emphasis',
        'level',
        'name',
        'percent',
        'price',
        'original',
        'renewal',
        'period',
        'terms',
        'privacy',
        'policy',
        'outcome',
        'companyCost',
        'trialDays',
        'trialPrice',
        'renewalPrice',
        'trialEndDate',
        'domain',
        'pct',
        'day',
        'minutes',
        'n',
        'firstName',
        'nextYear',
        'todayLong',
      ].map((name) => [name, 'x']),
    )
    for (const text of texts) {
      expect(personalize(text, { gender: 'female' }, screenVars), text).not.toMatch(/\{\{/)
    }
  })

  it('does not name the reference product anywhere in the copy or the claims', () => {
    expect(JSON.stringify(copy)).not.toMatch(/fabulous/i)
    expect(JSON.stringify(CLAIMS)).not.toMatch(/fabulous/i)
  })
})
