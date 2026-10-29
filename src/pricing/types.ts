export type PlanId = 'trial_1w' | 'month_1' | 'month_3'

/** A paywall plan with its derived display numbers. Prices are demo data until real ones exist. */
export interface Plan {
  id: PlanId
  title: string
  /** Length of the first billing period in days; the per-day price divides by it. */
  days: number
  price: number
  originalPrice: number
  perDay: number
  perDayOriginal: number
  ribbon?: string
  badge?: string
  default?: boolean
}
