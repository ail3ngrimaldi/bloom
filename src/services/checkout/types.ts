import type { PlanId } from '@/pricing/types'

export type PaymentMethod = 'paypal' | 'google_pay' | 'card'

export interface CheckoutRequest {
  planId: PlanId
  email: string
}

export type CheckoutResult =
  | { status: 'success' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string }
  /** The mock: nothing was charged. */
  | { status: 'demo' }

/**
 * Payment provider behind the checkout modal (PLAN 6.6). The UI only talks to this interface, so
 * a real provider (Stripe Express Checkout and Payment Element, phase 8) replaces the mock
 * without touching the screens.
 */
export interface CheckoutProvider {
  /** Loads the provider's buttons (its SDK); the modal shows placeholders until it resolves. */
  load(): Promise<void>
  /** Express methods only; cards go through the provider's own form once integrated. */
  pay(method: Exclude<PaymentMethod, 'card'>, request: CheckoutRequest): Promise<CheckoutResult>
}
