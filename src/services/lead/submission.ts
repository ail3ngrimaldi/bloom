import { hasAttribution } from '@/funnel/attribution'
import { QUIZ_STEPS } from '@/funnel/steps'
import type { FunnelState } from '@/funnel/state'
import type { Answers } from '@/funnel/types'
import { deriveProfile } from '@/profile/derive'
import type { LeadSubmission } from './types'

/** Answer keys of the steps flagged as health data (#12). */
export const SENSITIVE_ANSWER_KEYS: readonly string[] = QUIZ_STEPS.flatMap((step) =>
  'sensitive' in step ? [step.answerKey] : [],
)

/**
 * The lead as it may leave the browser: email, name, the answers without health data, a profile
 * derived from those same answers, so nothing in it reveals the health answer either (the summary
 * on screen still uses every answer; it never leaves the browser), and where the visit came from
 * (UTM parameters, placement, slug) when it came from an ad.
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
    ...(hasAttribution(state.attribution) ? { attribution: state.attribution } : {}),
  }
}
