export type PlanId = 'trial_1w' | 'month_1' | 'month_3'

/** How often a plan renews, for the legal copy ("every month", "every 3 months"). */
export type RenewalPeriod = 'month' | 'three_months'

/** A plan as configured (PLAN 5.10). Prices are demo data until real ones exist (D4). */
export interface PlanConfig {
  id: PlanId
  /** Length of the first billing period in days; the per-day price divides by it. */
  days: number
  /** First-period price with the discount. */
  price: number
  /** Full price the discount is taken from, also what the plan renews at. */
  originalPrice: number
  /**
   * Days the original price covers, for the struck per-day price. The trial compares against
   * the monthly price (39.99 / 30 = 1.33), as the reference does; confirm with pricing.
   */
  comparisonDays: number
  renewal: RenewalPeriod
  /** Shows "SAVE nn%". The reference shows no badge on the trial. */
  showSavings: boolean
  mostPopular?: boolean
  default?: boolean
}

/** A paywall plan with its derived display numbers. */
export interface Plan extends PlanConfig {
  perDay: number
  perDayOriginal: number
  /** 0..100, rounded: 1 - price / originalPrice. */
  savingsPercent: number
  /** False once the discount has ended: the plan then costs its original price. */
  discounted: boolean
}
