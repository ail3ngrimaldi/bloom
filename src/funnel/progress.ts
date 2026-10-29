import type { Step } from './types'

/**
 * Progress bar value (PLAN 3): it grows by one 39th per step, (n - 1) / 39 for n = 1..38, and the
 * steps without a header count too. The name step (#39) shares the value of the email step (#38).
 */
export const PROGRESS_DENOMINATOR = 39
const LAST_PROGRESS_STEP = 38

export function progressFor(step: Step): number {
  const n = Math.min(step.n, LAST_PROGRESS_STEP)
  return Math.max(0, n - 1) / PROGRESS_DENOMINATOR
}
