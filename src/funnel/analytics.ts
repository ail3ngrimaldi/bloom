import { isDevToolsEnabled } from '@/lib/env'
import type { AnswerValue } from './types'

/** Funnel events of PLAN 6.4. Nothing is sent anywhere until a real adapter and consent exist. */
export type FunnelEvent =
  | { name: 'funnel_start' }
  | { name: 'step_view'; n: number; id: string }
  | { name: 'answer'; id: string; value: AnswerValue }
  | { name: 'wand_release'; label: string; count: number }
  | { name: 'loader_modal_answer'; id: string; value: string }
  | { name: 'lead_submit' }
  | { name: 'paywall_view' }
  | { name: 'plan_select'; planId: string }
  | { name: 'checkout_open' }
  | { name: 'payment_method_click'; method: string }
  | { name: 'purchase_success' }

export interface AnalyticsAdapter {
  track(event: FunnelEvent): void
}

declare global {
  interface Window {
    /** QA only (dev and previews): the events tracked in this page, oldest first. */
    __bloomEvents?: FunnelEvent[]
  }
}

/**
 * Default adapter: sends nothing (no consent banner or provider yet, decision D8). With the dev
 * tools on it records events in window.__bloomEvents so QA and the e2e tests can inspect them.
 */
export const localAnalytics: AnalyticsAdapter = {
  track(event) {
    if (typeof window === 'undefined' || !isDevToolsEnabled()) return
    ;(window.__bloomEvents ??= []).push(event)
  },
}
