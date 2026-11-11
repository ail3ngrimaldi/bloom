import { isDevToolsEnabled } from '@/lib/env'
import type { Attribution } from './attribution'
import type { AnswerValue } from './types'

/** Funnel events of PLAN 6.4 and PLAN-B 6.6. Nothing is sent until a real adapter and consent exist. */
export type FunnelEventBody =
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
  // The "pay what you want" closing.
  | { name: 'pwyw_view' }
  | { name: 'pwyw_select'; amount: number }
  | { name: 'sheet_open' }
  | { name: 'sheet_ready'; ms: number }
  | { name: 'gift_view' }
  | { name: 'gift_pick'; index: number }
  | { name: 'discount_apply'; pct: number }
  | { name: 'countdown_expire' }
  | { name: 'start_now_click' }
  | { name: 'card_field_focus'; field: 'number' | 'expiry' | 'cvv' }
  | { name: 'start_membership_click' }

/** Any event, with the visit's attribution (UTM, placement, slug) once it is known. */
export type FunnelEvent = FunnelEventBody & { attribution?: Attribution }

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
