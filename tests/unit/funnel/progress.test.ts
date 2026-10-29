import { describe, expect, it } from 'vitest'
import { progressFor } from '@/funnel/progress'
import { STEPS, getStep } from '@/funnel/steps'
import type { StepId } from '@/funnel/steps'

describe('progressFor (PLAN 3)', () => {
  it('is (n - 1) / 39 for steps 1 to 38', () => {
    for (const step of STEPS.slice(0, 38)) expect(progressFor(step)).toBeCloseTo((step.n - 1) / 39)
  })

  it('starts at 0 on the intro and gives #39 the value of #38', () => {
    expect(progressFor(getStep('intro'))).toBe(0)
    expect(progressFor(getStep('name'))).toBe(progressFor(getStep('email')))
    expect(progressFor(getStep('email'))).toBeCloseTo(37 / 39)
  })

  it('matches the fill measured on the reference within 1.5 points', () => {
    // Fill of the 266px track measured on frames of the recording (PLAN 3 table).
    const measured: Array<[StepId, number]> = [
      ['drained', 0.023],
      ['overthink', 0.049],
      ['juggling', 0.15],
      ['procrastinate', 0.2],
      ['age', 0.38],
      ['tried_habits', 0.59],
      ['lose_motivation', 0.69],
      ['biggest_motivation', 0.87],
      ['email', 0.946],
      ['name', 0.946],
    ]
    for (const [id, fraction] of measured) {
      expect(Math.abs(progressFor(getStep(id)) - fraction), id).toBeLessThanOrEqual(0.015)
    }
  })

  it('counts the steps without a header: from #16 to #18 it jumps two steps', () => {
    expect(progressFor(getStep('others_needs')) - progressFor(getStep('age'))).toBeCloseTo(2 / 39)
  })
})
