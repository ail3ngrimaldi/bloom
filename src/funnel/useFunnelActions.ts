'use client'

import { useMemo } from 'react'
import type { PlanId } from '@/pricing/types'
import { buildLeadSubmission } from '@/services/lead/submission'
import type { Lead } from '@/services/lead/types'
import { hasAttribution } from './attribution'
import type { Attribution } from './attribution'
import type { FunnelEventBody } from './analytics'
import { closingVariant } from './flags'
import { useFunnelContext } from './FunnelProvider'
import { stepIdFromPath, stepPath } from './navigation'
import { isTransient, nextStep } from './steps'
import type { StepId } from './steps'
import type { Discount } from './state'
import type { AnswerValue, ClosingVariant, Step } from './types'

export interface FunnelActions {
  /** Stores an answer under its key and tracks it. */
  answer(key: string, value: AnswerValue): void
  /** Stores an answer without tracking it (a multi-select still being edited). */
  setAnswer(key: string, value: AnswerValue): void
  /**
   * Moves from `from` to the following step. Ignored when the visitor is no longer on `from`
   * (a delayed auto-advance after Back), so a step can never skip the one the user is looking at.
   */
  next(from: Step): void
  /** Goes to any step; the guard still applies. */
  goTo(id: StepId, options?: { replace?: boolean }): void
  /** The browser's Back (closing the checkout returns to the paywall entry). */
  back(): void
  setLead(patch: Partial<Lead>): void
  /** Hands the lead to the lead service (health answers left out) and tracks it, without PII. */
  submitLead(): Promise<void>
  selectPlan(planId: PlanId): void
  /** Starts the paywall countdown once; later calls keep the first start time. */
  startPaywall(): void
  /** What the visitor chose to pay today for the trial ("pay what you want"). */
  chooseTrial(amount: number): void
  /** Stores the discount a gift revealed; only the first one counts (it is never granted twice). */
  grantDiscount(discount: Discount): void
  setReminder(value: boolean): void
  /** Remembers where the visit comes from (first touch wins). */
  attribute(incoming: Attribution): void
  /** The closing this visitor walks (`funnel.closing`), read when called. */
  closing(): ClosingVariant
  track(event: FunnelEventBody): void
}

export function useFunnelActions(): FunnelActions {
  const { store, navigator, analytics, leads } = useFunnelContext()

  return useMemo<FunnelActions>(() => {
    const closing = () => closingVariant(window.location.search, store.getState().attribution.slug)
    // Every event carries the visit's attribution once there is one.
    const track = (event: FunnelEventBody) => {
      const { attribution } = store.getState()
      analytics.track(hasAttribution(attribution) ? { ...event, attribution } : event)
    }
    return {
      answer(key, value) {
        store.dispatch({ type: 'answer', key, value })
        track({ name: 'answer', id: key, value })
      },
      setAnswer(key, value) {
        store.dispatch({ type: 'answer', key, value })
      },
      next(from) {
        if (stepIdFromPath(navigator.currentPath()) !== from.id) return
        const to = nextStep(from, closing())
        if (!to) return
        store.dispatch({ type: 'reach', n: to.n })
        if (isTransient(from)) navigator.replace(stepPath(to.id))
        else navigator.push(stepPath(to.id))
      },
      goTo(id, options) {
        if (options?.replace) navigator.replace(stepPath(id))
        else navigator.push(stepPath(id))
      },
      back() {
        navigator.back()
      },
      setLead(patch) {
        store.dispatch({ type: 'lead', patch })
      },
      async submitLead() {
        await leads.submit(buildLeadSubmission(store.getState()))
        track({ name: 'lead_submit' })
      },
      selectPlan(planId) {
        store.dispatch({ type: 'selectPlan', planId })
        track({ name: 'plan_select', planId })
      },
      startPaywall() {
        store.dispatch({ type: 'startPaywall', at: Date.now() })
      },
      chooseTrial(amount) {
        store.dispatch({ type: 'chooseTrial', amount })
      },
      grantDiscount(discount) {
        store.dispatch({ type: 'grantDiscount', discount })
      },
      setReminder(value) {
        store.dispatch({ type: 'reminder', value })
      },
      attribute(incoming) {
        store.dispatch({ type: 'attribute', incoming })
      },
      closing,
      track,
    }
  }, [store, navigator, analytics, leads])
}
