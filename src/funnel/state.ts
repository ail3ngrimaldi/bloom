import type { PlanId } from '@/pricing/types'
import type { Lead } from '@/services/lead/types'
import { STEPS } from './steps'
import type { AnswerValue, Answers } from './types'

/** Everything the funnel remembers. The current step is not here: it is the URL (/s/<id>). */
export interface FunnelState {
  readonly answers: Answers
  readonly lead: Lead
  readonly selectedPlanId: PlanId | null
  /** When the paywall was first shown (ms since epoch); the countdown runs from it. */
  readonly paywallStartedAt: number | null
  /** Highest step number reached by moving forward; later steps redirect back to it. */
  readonly furthest: number
}

export const INITIAL_STATE: FunnelState = {
  answers: {},
  lead: { email: '', name: '' },
  selectedPlanId: null,
  paywallStartedAt: null,
  furthest: 1,
}

export type FunnelAction =
  | { type: 'answer'; key: string; value: AnswerValue }
  | { type: 'reach'; n: number }
  | { type: 'lead'; patch: Partial<Lead> }
  | { type: 'selectPlan'; planId: PlanId }
  | { type: 'startPaywall'; at: number }
  | { type: 'restore'; state: FunnelState }
  | { type: 'reset' }

export function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case 'answer':
      return { ...state, answers: { ...state.answers, [action.key]: action.value } }
    case 'reach':
      return action.n > state.furthest
        ? { ...state, furthest: Math.min(action.n, STEPS.length) }
        : state
    case 'lead':
      return { ...state, lead: { ...state.lead, ...action.patch } }
    case 'selectPlan':
      return state.selectedPlanId === action.planId
        ? state
        : { ...state, selectedPlanId: action.planId }
    case 'startPaywall':
      // The countdown must not restart on reload or when the user comes back (guardrail 6).
      return state.paywallStartedAt === null ? { ...state, paywallStartedAt: action.at } : state
    case 'restore':
      return action.state
    case 'reset':
      return INITIAL_STATE
  }
}

/** Toggles an option in a multi-select answer, keeping the order of selection. */
export function toggleOption(current: AnswerValue | undefined, option: string): readonly string[] {
  const list = Array.isArray(current) ? current : []
  return list.includes(option) ? list.filter((item) => item !== option) : [...list, option]
}

const PLAN_IDS: readonly string[] = ['trial_1w', 'month_1', 'month_3'] satisfies PlanId[]

function isAnswerValue(value: unknown): value is AnswerValue {
  return (
    typeof value === 'string' ||
    (Array.isArray(value) && value.every((item) => typeof item === 'string'))
  )
}

/**
 * Validates state read back from storage. Anything malformed, or from another version of the
 * shape, is dropped as a whole: starting over beats running on half-trusted data.
 */
export function parseState(raw: unknown): FunnelState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Record<string, unknown>
  const { answers, lead, selectedPlanId, paywallStartedAt, furthest } = value

  if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) return null
  if (!Object.values(answers).every(isAnswerValue)) return null
  if (typeof lead !== 'object' || lead === null) return null
  const { email, name } = lead as Record<string, unknown>
  if (typeof email !== 'string' || typeof name !== 'string') return null
  if (
    selectedPlanId !== null &&
    !(typeof selectedPlanId === 'string' && PLAN_IDS.includes(selectedPlanId))
  )
    return null
  if (paywallStartedAt !== null && typeof paywallStartedAt !== 'number') return null
  if (typeof furthest !== 'number' || !Number.isInteger(furthest)) return null
  if (furthest < 1 || furthest > STEPS.length) return null

  return {
    answers: answers as Answers,
    lead: { email, name },
    selectedPlanId: selectedPlanId as PlanId | null,
    paywallStartedAt: paywallStartedAt as number | null,
    furthest,
  }
}
