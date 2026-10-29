import { describe, expect, it } from 'vitest'
import {
  DEMO_PLANS,
  computePlan,
  defaultPlanId,
  formatMoney,
  plansFor,
  selectedPlan,
  splitMoney,
} from '@/pricing/plans'

describe('demo plans (PLAN 5.10)', () => {
  it('derive the per-day prices and savings of the reference', () => {
    const plans = plansFor()
    expect(
      plans.map((plan) => [plan.id, plan.perDayOriginal, plan.perDay, plan.savingsPercent]),
    ).toEqual([
      ['trial_1w', 1.33, 0.74, 87],
      ['month_1', 1.33, 0.3, 78],
      ['month_3', 0.67, 0.19, 72],
    ])
  })

  it('shows the savings badge on the month plans only and defaults to 1 month', () => {
    expect(DEMO_PLANS.filter((plan) => plan.showSavings).map((plan) => plan.id)).toEqual([
      'month_1',
      'month_3',
    ])
    expect(defaultPlanId()).toBe('month_1')
    expect(DEMO_PLANS.find((plan) => plan.mostPopular)?.id).toBe('month_1')
  })

  it('charges the original price once the discount has ended', () => {
    const plan = computePlan(DEMO_PLANS[1], false)
    expect(plan.price).toBe(39.99)
    expect(plan.perDay).toBe(1.33)
    expect(plan.discounted).toBe(false)
  })

  it('selects the stored plan, or the default', () => {
    const plans = plansFor()
    expect(selectedPlan(plans, 'month_3').id).toBe('month_3')
    expect(selectedPlan(plans, null).id).toBe('month_1')
  })

  it('formats dollars and splits the per-day price for the big digit', () => {
    expect(formatMoney(8.99)).toBe('$8.99')
    expect(formatMoney(39.99)).toBe('$39.99')
    expect(splitMoney(0.3)).toEqual({ symbol: '$', whole: '0', fraction: '.30' })
    expect(splitMoney(1.33)).toEqual({ symbol: '$', whole: '1', fraction: '.33' })
  })
})
