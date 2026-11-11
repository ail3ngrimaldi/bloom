import type { PlanId } from '@/pricing/types'
import type { Lead } from '@/services/lead/types'
import { NO_ATTRIBUTION, mergeAttribution, parseStoredAttribution } from './attribution'
import type { Attribution } from './attribution'
import { FUNNEL_LENGTH } from './steps'
import type { AnswerValue, Answers } from './types'

/**
 * The discount a gift revealed on the plan sheet (PLAN-B 4.3). `expiresAt` is null while the
 * countdown flag is off: then the discount does not end. It is kept for the session so a reload
 * neither asks for the gift again nor restarts the countdown (guardrail 5).
 */
export interface Discount {
  readonly pct: number
  readonly code: string
  /** ms since epoch. */
  readonly grantedAt: number
  /** ms since epoch, or null when the discount does not expire. */
  readonly expiresAt: number | null
}

/** Everything the funnel remembers. The current step is not here: it is the URL (/s/<id>). */
export interface FunnelState {
  readonly answers: Answers
  readonly lead: Lead
  readonly selectedPlanId: PlanId | null
  /** When the paywall was first shown (ms since epoch); the countdown runs from it. */
  readonly paywallStartedAt: number | null
  /** Highest step number reached by moving forward; later steps redirect back to it. */
  readonly furthest: number
  /** What the visitor chose to pay today for the trial on "Pay what you want" (USD). */
  readonly trialAmount: number | null
  readonly discount: Discount | null
  /** The "we'll remind you before renewal" box of the payment block; on by default. */
  readonly reminderOptIn: boolean
  /** UTM parameters, placement and slug of the visit (first touch). */
  readonly attribution: Attribution
}

export const INITIAL_STATE: FunnelState = {
  answers: {},
  lead: { email: '', name: '' },
  selectedPlanId: null,
  paywallStartedAt: null,
  furthest: 1,
  trialAmount: null,
  discount: null,
  reminderOptIn: true,
  attribution: NO_ATTRIBUTION,
}

export type FunnelAction =
  | { type: 'answer'; key: string; value: AnswerValue }
  | { type: 'reach'; n: number }
  | { type: 'lead'; patch: Partial<Lead> }
  | { type: 'selectPlan'; planId: PlanId }
  | { type: 'startPaywall'; at: number }
  | { type: 'chooseTrial'; amount: number }
  | { type: 'grantDiscount'; discount: Discount }
  | { type: 'reminder'; value: boolean }
  | { type: 'attribute'; incoming: Attribution }
  | { type: 'restore'; state: FunnelState }
  | { type: 'reset' }

export function funnelReducer(state: FunnelState, action: FunnelAction): FunnelState {
  switch (action.type) {
    case 'answer':
      return { ...state, answers: { ...state.answers, [action.key]: action.value } }
    case 'reach':
      return action.n > state.furthest
        ? { ...state, furthest: Math.min(action.n, FUNNEL_LENGTH) }
        : state
    case 'lead':
      return { ...state, lead: { ...state.lead, ...action.patch } }
    case 'selectPlan':
      return state.selectedPlanId === action.planId
        ? state
        : { ...state, selectedPlanId: action.planId }
    case 'startPaywall':
      // The countdown must not restart on reload or when the user comes back (guardrail 5).
      return state.paywallStartedAt === null ? { ...state, paywallStartedAt: action.at } : state
    case 'chooseTrial':
      return state.trialAmount === action.amount ? state : { ...state, trialAmount: action.amount }
    case 'grantDiscount':
      // One gift per visit: a reload, Back or a second tab never grants (or restarts) it again.
      return state.discount === null ? { ...state, discount: action.discount } : state
    case 'reminder':
      return state.reminderOptIn === action.value
        ? state
        : { ...state, reminderOptIn: action.value }
    case 'attribute': {
      const attribution = mergeAttribution(state.attribution, action.incoming)
      return attribution === state.attribution ? state : { ...state, attribution }
    }
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

function parseDiscount(raw: unknown): Discount | null | undefined {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'object') return undefined
  const { pct, code, grantedAt, expiresAt } = raw as Record<string, unknown>
  if (typeof pct !== 'number' || !(pct > 0 && pct < 100)) return undefined
  if (typeof code !== 'string' || code === '') return undefined
  if (typeof grantedAt !== 'number' || !Number.isFinite(grantedAt)) return undefined
  if (expiresAt !== null && !(typeof expiresAt === 'number' && Number.isFinite(expiresAt)))
    return undefined
  return { pct, code, grantedAt, expiresAt }
}

/**
 * Validates state read back from storage. Anything malformed, or from another version of the
 * shape, is dropped as a whole: starting over beats running on half-trusted data. The fields the
 * "pay what you want" closing added are optional, so a session stored before them still loads.
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
  if (furthest < 1 || furthest > FUNNEL_LENGTH) return null

  const trialAmount = value.trialAmount ?? null
  if (
    trialAmount !== null &&
    !(typeof trialAmount === 'number' && Number.isFinite(trialAmount) && trialAmount >= 0)
  )
    return null
  const discount = parseDiscount(value.discount)
  if (discount === undefined) return null
  const reminderOptIn = value.reminderOptIn ?? true
  if (typeof reminderOptIn !== 'boolean') return null
  const attribution = parseStoredAttribution(value.attribution)
  if (attribution === null) return null

  return {
    answers: answers as Answers,
    lead: { email, name },
    selectedPlanId: selectedPlanId as PlanId | null,
    paywallStartedAt: paywallStartedAt as number | null,
    furthest,
    trialAmount,
    discount,
    reminderOptIn,
    attribution,
  }
}
