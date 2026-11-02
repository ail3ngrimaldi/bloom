import type { CountdownService } from './types'

/**
 * Default countdown (decision D4): the browser's clock. It cannot stop a user who changes their
 * system time, which is acceptable only while nothing real is charged. TODO(backend): replace with
 * an adapter that asks the server for the time and for the window (PLAN-B 6.5, phase 8).
 */
export const localCountdown: CountdownService = {
  now: () => Date.now(),
  open(seconds) {
    const grantedAt = Date.now()
    return { grantedAt, expiresAt: grantedAt + seconds * 1000 }
  },
}

/** Whole seconds left until `expiresAt`, never negative. */
export function remainingSeconds(expiresAt: number, now: number): number {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000))
}
