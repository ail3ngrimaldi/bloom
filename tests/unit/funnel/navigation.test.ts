import { afterEach, describe, expect, it, vi } from 'vitest'
import { allowedStep, readQaBypass, stepIdFromPath, stepPath } from '@/funnel/navigation'
import { getStep } from '@/funnel/steps'

describe('step URLs', () => {
  it('maps ids to /s/<id> and back', () => {
    expect(stepPath('gender')).toBe('/s/gender')
    expect(stepIdFromPath('/s/gender')).toBe('gender')
    expect(stepIdFromPath('/s/gender/')).toBe('gender')
  })

  it('knows the steps of both closings', () => {
    for (const id of ['paywall', 'checkout', 'pwyw', 'plan'])
      expect(stepIdFromPath(`/s/${id}`)).toBe(id)
  })

  it('rejects anything that is not a known step', () => {
    for (const path of ['/s/nope', '/s/', '/s', '/', '/s/gender/x', '/x/gender', null, undefined])
      expect(stepIdFromPath(path)).toBeNull()
  })
})

describe('allowedStep (guard)', () => {
  it('lets the visitor be on any step up to the furthest one reached', () => {
    const age = getStep('age')
    expect(allowedStep(age, 16, false, 'pwyw')).toBe(age)
    expect(allowedStep(getStep('drained'), 16, false, 'pwyw').id).toBe('drained')
  })

  it('sends a visitor who is further ahead back to the furthest step', () => {
    expect(allowedStep(getStep('pwyw'), 1, false, 'pwyw').id).toBe('intro')
    expect(allowedStep(getStep('pwyw'), 9, false, 'pwyw').id).toBe('procrastinate')
    expect(allowedStep(getStep('paywall'), 1, false, 'paywall').id).toBe('intro')
  })

  it('lets everything through with the QA bypass', () => {
    expect(allowedStep(getStep('pwyw'), 1, true, 'pwyw').id).toBe('pwyw')
    expect(allowedStep(getStep('paywall'), 1, true, 'pwyw').id).toBe('paywall')
  })

  it('sends a step of the other closing to the same position of this visitor’s closing', () => {
    expect(allowedStep(getStep('paywall'), 42, false, 'pwyw').id).toBe('pwyw')
    expect(allowedStep(getStep('checkout'), 42, false, 'pwyw').id).toBe('plan')
    expect(allowedStep(getStep('plan'), 42, false, 'paywall').id).toBe('checkout')
    expect(allowedStep(getStep('pwyw'), 42, false, 'paywall').id).toBe('paywall')
  })

  it('keeps the steps of the visitor’s own closing', () => {
    expect(allowedStep(getStep('plan'), 42, false, 'pwyw').id).toBe('plan')
    expect(allowedStep(getStep('checkout'), 42, false, 'paywall').id).toBe('checkout')
  })

  it('still applies the furthest step to the closing steps', () => {
    expect(allowedStep(getStep('plan'), 41, false, 'pwyw').id).toBe('pwyw')
    expect(allowedStep(getStep('paywall'), 40, false, 'pwyw').id).toBe('loading')
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
