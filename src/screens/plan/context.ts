'use client'

import { createContext, useContext } from 'react'
import type { Discount } from '@/funnel/state'
import type { PlanQuote } from '@/pricing/closing'

/** What every section of the plan sheet needs; the sheet computes it once. */
export interface PlanContextValue {
  /** The plan priced for the amount chosen and the discount in force. */
  quote: PlanQuote
  /** The discount in force (granted and not ended), or null. */
  discount: Discount | null
  /** Whether `paywall.countdown.enabled` is on. */
  countdownEnabled: boolean
  /** Seconds left of the discount; null when no countdown is running. */
  remaining: number | null
  /** True once a discount that was granted has ended: it no longer applies. */
  discountEnded: boolean
  /** The date of the visit: "today" for the trial and the letter. */
  today: Date
  /** The site's own domain, for the cancellation line of the legal text. */
  domain: string
}

export const PlanContext = createContext<PlanContextValue | null>(null)

export function usePlan(): PlanContextValue {
  const value = useContext(PlanContext)
  if (!value) throw new Error('usePlan must be used inside <PlanSheet>')
  return value
}
