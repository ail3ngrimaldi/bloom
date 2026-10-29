'use client'

import { useMemo } from 'react'
import type { PlanId } from '@/pricing/types'
import type { Lead } from '@/services/lead/types'
import type { FunnelEvent } from './analytics'
import { useFunnelContext } from './FunnelProvider'
import { stepIdFromPath, stepPath } from './navigation'
import { isTransient, nextStep } from './steps'
import type { StepId } from './steps'
import type { AnswerValue, Step } from './types'

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
  setLead(patch: Partial<Lead>): void
  selectPlan(planId: PlanId): void
  /** Starts the paywall countdown once; later calls keep the first start time. */
  startPaywall(): void
  track(event: FunnelEvent): void
}

export function useFunnelActions(): FunnelActions {
  const { store, navigator, analytics } = useFunnelContext()

  return useMemo<FunnelActions>(
    () => ({
      answer(key, value) {
        store.dispatch({ type: 'answer', key, value })
        analytics.track({ name: 'answer', id: key, value })
      },
      setAnswer(key, value) {
        store.dispatch({ type: 'answer', key, value })
      },
      next(from) {
        if (stepIdFromPath(navigator.currentPath()) !== from.id) return
        const to = nextStep(from)
        if (!to) return
        store.dispatch({ type: 'reach', n: to.n })
        if (isTransient(from)) navigator.replace(stepPath(to.id))
        else navigator.push(stepPath(to.id))
      },
      goTo(id, options) {
        if (options?.replace) navigator.replace(stepPath(id))
        else navigator.push(stepPath(id))
      },
      setLead(patch) {
        store.dispatch({ type: 'lead', patch })
      },
      selectPlan(planId) {
        store.dispatch({ type: 'selectPlan', planId })
        analytics.track({ name: 'plan_select', planId })
      },
      startPaywall() {
        store.dispatch({ type: 'startPaywall', at: Date.now() })
      },
      track(event) {
        analytics.track(event)
      },
    }),
    [store, navigator, analytics],
  )
}
