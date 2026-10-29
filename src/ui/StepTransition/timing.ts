/**
 * Step transition timing (PLAN 4.4). Mirrored by --motion-step-out, --motion-step-gap and
 * --motion-step-in in src/styles/tokens.css; StepTransition.test.ts fails if they drift apart.
 */
export const STEP_OUT_MS = 400 // outgoing content fades 1 to 0
export const STEP_GAP_MS = 150 // nothing visible, only the card
export const STEP_IN_MS = 300 // incoming content fades 0 to 1

/** Longest fade allowed under prefers-reduced-motion (--motion-reduced-fade). */
export const REDUCED_FADE_MS = 100

export interface StepTiming {
  out: number
  gap: number
  in: number
}

export const STEP_TIMING: StepTiming = { out: STEP_OUT_MS, gap: STEP_GAP_MS, in: STEP_IN_MS }
export const REDUCED_STEP_TIMING: StepTiming = { out: REDUCED_FADE_MS, gap: 0, in: REDUCED_FADE_MS }

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function getStepTiming(reduced = prefersReducedMotion()): StepTiming {
  return reduced ? REDUCED_STEP_TIMING : STEP_TIMING
}
