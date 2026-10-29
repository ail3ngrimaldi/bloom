import { describe, expect, it } from 'vitest'
import { INITIAL_STATE, funnelReducer, parseState, toggleOption } from '@/funnel/state'
import type { FunnelState } from '@/funnel/state'

describe('funnelReducer', () => {
  it('stores answers by key without touching the others', () => {
    const a = funnelReducer(INITIAL_STATE, { type: 'answer', key: 'drained', value: 'often' })
    const b = funnelReducer(a, { type: 'answer', key: 'sacrifice', value: ['sleep'] })
    expect(b.answers).toEqual({ drained: 'often', sacrifice: ['sleep'] })
    expect(INITIAL_STATE.answers).toEqual({})
  })

  it('only moves the furthest step forward, capped at the last step', () => {
    const a = funnelReducer(INITIAL_STATE, { type: 'reach', n: 5 })
    expect(a.furthest).toBe(5)
    expect(funnelReducer(a, { type: 'reach', n: 3 })).toBe(a)
    expect(funnelReducer(a, { type: 'reach', n: 99 }).furthest).toBe(42)
  })

  it('merges the lead and selects a plan', () => {
    const a = funnelReducer(INITIAL_STATE, { type: 'lead', patch: { email: 'a@b.co' } })
    const b = funnelReducer(a, { type: 'lead', patch: { name: 'Sam' } })
    expect(b.lead).toEqual({ email: 'a@b.co', name: 'Sam' })
    const c = funnelReducer(b, { type: 'selectPlan', planId: 'month_3' })
    expect(c.selectedPlanId).toBe('month_3')
    expect(funnelReducer(c, { type: 'selectPlan', planId: 'month_3' })).toBe(c)
  })

  it('starts the paywall countdown once and never restarts it', () => {
    const a = funnelReducer(INITIAL_STATE, { type: 'startPaywall', at: 1000 })
    expect(a.paywallStartedAt).toBe(1000)
    expect(funnelReducer(a, { type: 'startPaywall', at: 5000 })).toBe(a)
  })

  it('restores and resets', () => {
    const saved: FunnelState = { ...INITIAL_STATE, furthest: 7 }
    expect(funnelReducer(INITIAL_STATE, { type: 'restore', state: saved })).toBe(saved)
    expect(funnelReducer(saved, { type: 'reset' })).toBe(INITIAL_STATE)
  })
})

describe('toggleOption', () => {
  it('adds in selection order and removes', () => {
    expect(toggleOption(undefined, 'a')).toEqual(['a'])
    expect(toggleOption(['a'], 'b')).toEqual(['a', 'b'])
    expect(toggleOption(['a', 'b'], 'a')).toEqual(['b'])
    expect(toggleOption('a', 'b')).toEqual(['b'])
  })
})

describe('parseState', () => {
  const valid = {
    answers: { drained: 'often', sacrifice: ['sleep', 'time'] },
    lead: { email: '', name: '' },
    selectedPlanId: 'month_1',
    paywallStartedAt: null,
    furthest: 12,
  }

  it('accepts a well-formed state', () => {
    expect(parseState(valid)).toEqual(valid)
  })

  it.each([
    ['not an object', 'x'],
    ['null', null],
    ['answers as a list', { ...valid, answers: [] }],
    ['a numeric answer', { ...valid, answers: { a: 1 } }],
    ['a lead without name', { ...valid, lead: { email: '' } }],
    ['an unknown plan', { ...valid, selectedPlanId: 'lifetime' }],
    ['a string start time', { ...valid, paywallStartedAt: 'yesterday' }],
    ['a fractional furthest step', { ...valid, furthest: 2.5 }],
    ['a furthest step past the end', { ...valid, furthest: 43 }],
    ['a furthest step of zero', { ...valid, furthest: 0 }],
  ])('rejects %s', (_, raw) => {
    expect(parseState(raw)).toBeNull()
  })
})
