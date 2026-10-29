import { describe, expect, it } from 'vitest'
import { getStep } from '@/funnel/steps'
import type { ScreenStep } from '@/screens/types'
import { activeDuration, ease, loaderScript } from '@/screens/loader/script'

const loader = getStep('loader') as ScreenStep<'loader'>
const none = () => false

describe('loader script (PLAN 5.8)', () => {
  it('stops bar 1 at 50 % and bar 2 at 58 % for the two questions', () => {
    const moves = loaderScript(3, loader.interrupts, none)
    expect(moves.map((move) => move.kind)).toEqual([
      'fill',
      'ask',
      'fill',
      'wait',
      'fill',
      'ask',
      'fill',
      'wait',
      'fill',
      'wait',
    ])
    expect(moves[0]).toMatchObject({ bar: 0, from: 0, to: 0.5, ease: 'out' })
    expect(moves[1]).toEqual({ kind: 'ask', interrupt: 0 })
    expect(moves[2]).toMatchObject({ bar: 0, from: 0.5, to: 1 })
    expect(moves[4]).toMatchObject({ bar: 1, from: 0, to: 0.58 })
    expect(moves[5]).toEqual({ kind: 'ask', interrupt: 1 })
    expect(moves[8]).toMatchObject({ bar: 2, from: 0, to: 1 })
  })

  it('runs 12 to 14 s without counting the answers', () => {
    const total = activeDuration(loaderScript(3, loader.interrupts, none))
    expect(total).toBeGreaterThanOrEqual(12_000)
    expect(total).toBeLessThanOrEqual(14_000)
  })

  it('does not ask again what was already answered (a reload, Back and forth)', () => {
    const moves = loaderScript(3, loader.interrupts, (key) => key === 'rushed_mornings')
    expect(moves.filter((move) => move.kind === 'ask')).toEqual([{ kind: 'ask', interrupt: 1 }])
    expect(moves[0]).toMatchObject({ bar: 0, from: 0, to: 1 })
  })

  it('eases out (slowing near the stop) and in-out', () => {
    expect(ease('out', 0)).toBe(0)
    expect(ease('out', 1)).toBe(1)
    expect(ease('out', 0.5)).toBeGreaterThan(0.8)
    expect(ease('inOut', 0.5)).toBeCloseTo(0.5)
    expect(ease('inOut', 0.25)).toBeLessThan(0.25)
    expect(ease('out', 2)).toBe(1)
  })
})
