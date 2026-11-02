import type { Answers } from '@/funnel/types'

/** What the closing phrase of #30 promises to help with; the words are in the copy (evidence.outcomes). */
export type EvidenceOutcome = 'burnout' | 'anxiety' | 'motivation' | 'generic'

/**
 * The closing phrase of #30 depends on the bubbles released in the wand (PLAN-B 3.2 and 6.4). The
 * reference showed two cases: Self-doubt + Anxiety + Lack of motivation -> "overcome anxiety and
 * neutralize your procrastination tendencies", and Self-doubt + Burnout + Anxiety -> "overcome
 * burnout". The rule that fits both (and is inferred, not shown): Burnout wins; else Anxiety and
 * Lack of motivation each add their phrase; with neither, a generic phrase.
 */
export function evidenceOutcomes(answers: Answers): readonly EvidenceOutcome[] {
  const released = Array.isArray(answers.wand) ? answers.wand : []
  if (released.includes('burnout')) return ['burnout']
  const found: EvidenceOutcome[] = []
  if (released.includes('anxiety')) found.push('anxiety')
  if (released.includes('lack_of_motivation')) found.push('motivation')
  return found.length > 0 ? found : ['generic']
}
