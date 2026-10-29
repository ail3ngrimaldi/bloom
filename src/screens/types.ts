import type { FunnelStep } from '@/funnel/steps'
import type { StepType } from '@/funnel/types'

/** One configured step of the given type, with its literal id. */
export type ScreenStep<T extends StepType> = Extract<FunnelStep, { type: T }>

export interface ScreenProps<T extends StepType> {
  step: ScreenStep<T>
  /** Moves on to the following step. Safe to call late: it is ignored once the user has left. */
  onNext: () => void
}
