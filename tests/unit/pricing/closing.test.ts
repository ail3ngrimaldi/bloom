import { describe, expect, it } from 'vitest'
import {
  DEMO_CLOSING_PRICING,
  addDays,
  formatLongDate,
  promoCode,
  quotePlan,
  roundCents,
} from '@/pricing/closing'

describe('roundCents', () => {
  it('rounds half up, always over the unrounded value', () => {
    expect(roundCents(0.6665)).toBe(0.67)
    expect(roundCents(2.221666)).toBe(2.22)
    expect(roundCents(133.3 * 0.3)).toBe(39.99)
    expect(roundCents(1.005)).toBe(1.01)
  })
})

describe('addDays', () => {
  it('adds calendar days across months and years', () => {
    expect(formatLongDate(addDays(new Date(2026, 9, 31), 14))).toBe('November 14, 2026')
    expect(formatLongDate(addDays(new Date(2026, 11, 25), 14))).toBe('January 8, 2027')
  })

  it('is not moved by daylight saving or by the time of day', () => {
    const lateEvening = new Date(2026, 2, 20, 23, 30)
    const end = addDays(lateEvening, 14)
    expect([end.getMonth(), end.getDate(), end.getHours()]).toEqual([3, 3, 0])
  })
})

describe('promoCode', () => {
  it('carries the discount and the month: off_70_october', () => {
    expect(promoCode(70, new Date(2026, 9, 31))).toBe('off_70_october')
    expect(promoCode(50, new Date(2026, 0, 2))).toBe('off_50_january')
  })
})

describe('quotePlan (PLAN-B 6.3, with the figures the reference showed)', () => {
  const today = new Date(2026, 9, 31)

  it('prices the plan after the 70 % gift: $39.99 every 2 months, $0.67 a day, struck $2.22', () => {
    const quote = quotePlan({ trialAmount: 2, discountPct: 70, today })
    expect(quote).toMatchObject({
      trialAmount: 2,
      trialDays: 14,
      reminderDay: 12,
      periodDays: 60,
      discountPct: 70,
      renewalPrice: 39.99,
      perDay: 0.67,
      perDayStruck: 2.22,
      listPrice: 133.3,
    })
    expect(formatLongDate(quote.trialEndDate)).toBe('November 14, 2026')
  })

  it('has no discount and no struck price before the gift is applied or after it ends', () => {
    const quote = quotePlan({ trialAmount: 2, discountPct: 0, today })
    expect(quote.renewalPrice).toBe(133.3)
    expect(quote.perDay).toBe(2.22)
    expect(quote.perDayStruck).toBeNull()
    expect(quote.discountPct).toBe(0)
    expect(quotePlan({ trialAmount: 2, discountPct: -5, today }).discountPct).toBe(0)
  })

  it('takes the struck price from the list price, never from the discount percentage', () => {
    const pricing = { ...DEMO_CLOSING_PRICING, listPrice: 100 }
    const quote = quotePlan({ trialAmount: 10, discountPct: 50, today, pricing })
    expect(quote.renewalPrice).toBe(50)
    expect(quote.perDay).toBe(0.83)
    // Derived from the rounded per-day price and the percentage it would be 1.66.
    expect(quote.perDayStruck).toBe(1.67)
  })

  it('never lets the discount change what is paid today for the trial', () => {
    for (const trialAmount of [2, 10, 16.41]) {
      for (const discountPct of [0, 70]) {
        expect(quotePlan({ trialAmount, discountPct, today }).trialAmount).toBe(trialAmount)
      }
    }
  })

  it('names the day of the reminder two days before the trial ends', () => {
    const pricing = { ...DEMO_CLOSING_PRICING, trialDays: 7 }
    expect(quotePlan({ trialAmount: 2, discountPct: 0, today, pricing }).reminderDay).toBe(5)
  })
})
