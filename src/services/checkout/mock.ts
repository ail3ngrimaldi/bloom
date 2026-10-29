import type { CheckoutProvider } from './types'

/** The buttons appear after this, like an SDK loading (the reference took 7 to 8 s; target < 2 s). */
export const MOCK_CHECKOUT_LOAD_MS = 700
export const MOCK_CHECKOUT_PAY_MS = 900

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Default checkout (decision D4): no SDK, no request, nothing charged. Paying resolves to
 * { status: 'demo' } and the modal says so.
 */
export const mockCheckoutProvider: CheckoutProvider = {
  load: () => wait(MOCK_CHECKOUT_LOAD_MS),
  pay: async () => {
    await wait(MOCK_CHECKOUT_PAY_MS)
    return { status: 'demo' }
  },
}
