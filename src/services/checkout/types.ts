import type { PlanId } from '@/pricing/types'

export type PaymentMethod = 'paypal' | 'google_pay' | 'card'

export interface CheckoutRequest {
  email: string
  /** The paywall closing: the plan chosen there. */
  planId?: PlanId
  /** The "pay what you want" closing: what the visitor pays today for the trial, in USD. */
  trialAmount?: number
}

export type CheckoutResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  /** The mock: nothing was charged. */
  | { status: 'demo' }

/**
 * Payment provider behind the checkout modal and the plan sheet (PLAN 6.6, PLAN-B 6.7). The UI
 * only talks to this interface, so a real provider (Stripe Express Checkout and Payment Element,
 * phase 8) replaces the mock without touching the screens.
 */
export interface CheckoutProvider {
  /** Loads the provider's buttons (its SDK); the screens show placeholders until it resolves. */
  load(): Promise<void>
  /** Express methods. */
  pay(method: Exclude<PaymentMethod, 'card'>, request: CheckoutRequest): Promise<CheckoutResult>
  /**
   * Pays with the card typed in the provider's own fields. The app never sees the card details: a
   * real provider hosts the fields (Stripe's Payment Element) and charges from there, so this
   * takes the request only. The mock fields of the plan sheet keep what is typed in memory and
   * never store, log or send it.
   */
  payCard(request: CheckoutRequest): Promise<CheckoutResult>
}
