import { STEPS } from '@/funnel/steps'
import type { FunnelState } from '@/funnel/state'
import type { Answers } from '@/funnel/types'
import { deriveProfile } from '@/profile/derive'
import type { LeadSubmission } from './types'

/** Answer keys of the steps flagged as health data (#12). */
export const SENSITIVE_ANSWER_KEYS: readonly string[] = STEPS.flatMap((step) =>
  'sensitive' in step ? [step.answerKey] : [],
)

/**
 * The lead as it may leave the browser: email, name, the answers without health data and a
 * profile derived from those same answers, so nothing in it reveals the health answer either
 * (the summary on screen still uses every answer; it never leaves the browser).
 */
export function buildLeadSubmission(state: FunnelState): LeadSubmission {
  const answers: Record<string, Answers[string]> = {}
  for (const [key, value] of Object.entries(state.answers)) {
    if (!SENSITIVE_ANSWER_KEYS.includes(key)) answers[key] = value
  }
  return {
    lead: { ...state.lead },
    answers,
    profile: deriveProfile(answers),
  }
}
