/**
 * Pricing of the "pay what you want" closing (PLAN-B 6.3): the amount chosen for the two-week
 * trial, the price after it with the gift discount, and the dates. Pure functions: the screens
 * show what they return and the checkout charges the same numbers (guardrail 4).
 */

export interface ClosingPricing {
  /** Length of the trial in days. */
  trialDays: number
  /** Days one billing period after the trial covers (every 2 months). */
  periodDays: number
  /**
   * The regular price of one period, before any gift discount. It is also the "previous price" the
   * struck figures come from, so it must be a price that was really charged before (guardrail 4).
   * Demo data until Bloom has one (decision D4); 133.30 makes the reference's 70 % give 39.99.
   */
  listPrice: number
}

export const DEMO_CLOSING_PRICING: ClosingPricing = {
  trialDays: 14,
  periodDays: 60,
  listPrice: 133.3,
}

/** Cents-exact, half up, over the unrounded value (rounding twice would give 2.23 for 2.2217). */
export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** The date `days` after `from`, at local midnight (calendar days, so daylight saving cannot shift it). */
export function addDays(from: Date, days: number): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days)
}

const longDate = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})
const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })

/** "November 14, 2026". */
export function formatLongDate(date: Date): string {
  return longDate.format(date)
}

/** The lowercase month of a promo code: "off_70_october". */
export function promoCode(pct: number, today: Date): string {
  return `off_${pct}_${monthName.format(today).toLowerCase()}`
}

export interface PlanQuote {
  /** What the visitor pays today for the trial; it never changes with the discount. */
  trialAmount: number
  trialDays: number
  /** The day of the reminder nudge: two days before the trial ends ("Day 12"). */
  reminderDay: number
  /** The day of the first charge after the trial. */
  trialEndDate: Date
  periodDays: number
  /** 0 when there is no discount (none granted, or it ended). */
  discountPct: number
  /** What the first period after the trial costs: the list price less the discount. */
  renewalPrice: number
  /** The renewal price per day. */
  perDay: number
  /** The previous (list) price per day, struck through; only with a discount over a real list price. */
  perDayStruck: number | null
  listPrice: number
}

export interface QuoteInput {
  trialAmount: number
  /** The discount in force, 0 for none. */
  discountPct: number
  today: Date
  pricing?: ClosingPricing
}

/**
 * Prices the plan: `renewalPrice = listPrice x (1 - discount)`, `perDay = renewalPrice / periodDays`
 * and, only with a discount, `perDayStruck = listPrice / periodDays`. The struck figure comes from
 * the list price, never from the discount percentage. 39.99 / 60 = 0.67 and 133.30 / 60 = 2.22.
 */
export function quotePlan({
  trialAmount,
  discountPct,
  today,
  pricing = DEMO_CLOSING_PRICING,
}: QuoteInput): PlanQuote {
  const pct = discountPct > 0 ? discountPct : 0
  const renewalPrice = roundCents(pricing.listPrice * (1 - pct / 100))
  return {
    trialAmount,
    trialDays: pricing.trialDays,
    reminderDay: pricing.trialDays - 2,
    trialEndDate: addDays(today, pricing.trialDays),
    periodDays: pricing.periodDays,
    discountPct: pct,
    renewalPrice,
    perDay: roundCents(renewalPrice / pricing.periodDays),
    perDayStruck: pct > 0 ? roundCents(pricing.listPrice / pricing.periodDays) : null,
    listPrice: pricing.listPrice,
  }
}
