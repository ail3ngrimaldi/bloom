import { afterEach, describe, expect, it, vi } from 'vitest'
import { allowedStep, readQaBypass, stepIdFromPath, stepPath } from '@/funnel/navigation'
import { getStep } from '@/funnel/steps'

describe('step URLs', () => {
  it('maps ids to /s/<id> and back', () => {
    expect(stepPath('gender')).toBe('/s/gender')
    expect(stepIdFromPath('/s/gender')).toBe('gender')
    expect(stepIdFromPath('/s/gender/')).toBe('gender')
  })

  it('rejects anything that is not a known step', () => {
    for (const path of ['/s/nope', '/s/', '/s', '/', '/s/gender/x', '/x/gender', null, undefined])
      expect(stepIdFromPath(path)).toBeNull()
  })
})

describe('allowedStep (guard)', () => {
  it('lets the visitor be on any step up to the furthest one reached', () => {
    const age = getStep('age')
    expect(allowedStep(age, 16, false)).toBe(age)
    expect(allowedStep(getStep('drained'), 16, false).id).toBe('drained')
  })

  it('sends a visitor who is further ahead back to the furthest step', () => {
    expect(allowedStep(getStep('paywall'), 1, false).id).toBe('intro')
    expect(allowedStep(getStep('paywall'), 9, false).id).toBe('procrastinate')
  })

  it('lets everything through with the QA bypass', () => {
    expect(allowedStep(getStep('paywall'), 1, true).id).toBe('paywall')
  })
})

describe('readQaBypass', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is on with ?qa while the dev tools are on', () => {
    expect(readQaBypass('?qa')).toBe(true)
    expect(readQaBypass('?utm_source=x&qa=1')).toBe(true)
    expect(readQaBypass('')).toBe(false)
  })

  it('is always off in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    expect(readQaBypass('?qa')).toBe(false)
  })
})
