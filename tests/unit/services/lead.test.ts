import { describe, expect, it, vi } from 'vitest'
import { INITIAL_STATE } from '@/funnel/state'
import {
  MOCK_LEAD_DELAY_MS,
  SENSITIVE_ANSWER_KEYS,
  buildLeadSubmission,
  isValidEmail,
  isValidName,
  mockLeadService,
  normalizeName,
} from '@/services/lead'

describe('lead validation (PLAN 5.9)', () => {
  it.each(['a@b.co', 'first.last+tag@example.com', '  spaced@example.org  ', 'x@sub.domain.io'])(
    'accepts %s',
    (email) => expect(isValidEmail(email)).toBe(true),
  )

  it.each([
    '',
    'plain',
    'a@b',
    'a@b.c',
    '@b.co',
    'a b@c.co',
    'a@@b.co',
    'a@.co',
    `${'x'.repeat(250)}@b.co`,
  ])('rejects %j', (email) => expect(isValidEmail(email)).toBe(false))

  it('accepts names of 1 to 40 characters after trimming', () => {
    expect(isValidName('Sam')).toBe(true)
    expect(isValidName('  ')).toBe(false)
    expect(isValidName('x'.repeat(40))).toBe(true)
    expect(isValidName('x'.repeat(41))).toBe(false)
    expect(normalizeName('  Ana   María ')).toBe('Ana María')
  })
})

describe('buildLeadSubmission', () => {
  const state = {
    ...INITIAL_STATE,
    lead: { email: 'qa@example.com', name: 'Sam' },
    answers: { adhd: 'diagnosed', drained: 'often', procrastinate: 'always', wand: ['anxiety'] },
  }

  it('keeps the health answer out, and the profile does not reveal it either', () => {
    expect(SENSITIVE_ANSWER_KEYS).toEqual(['adhd'])
    const submission = buildLeadSubmission(state)
    expect(submission.lead).toEqual({ email: 'qa@example.com', name: 'Sam' })
    expect(submission.answers).toEqual({
      drained: 'often',
      procrastinate: 'always',
      wand: ['anxiety'],
    })
    expect(submission.profile.mainDifficulty).toBe('procrastination')
    expect(JSON.stringify(submission)).not.toMatch(/adhd|diagnosed/i)
  })
})

describe('mockLeadService', () => {
  it('resolves after a short delay and sends nothing', async () => {
    vi.useFakeTimers()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    let done = false
    void mockLeadService.submit(buildLeadSubmission(INITIAL_STATE)).then(() => (done = true))
    await vi.advanceTimersByTimeAsync(MOCK_LEAD_DELAY_MS - 1)
    expect(done).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(done).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
    fetchSpy.mockRestore()
  })
})
