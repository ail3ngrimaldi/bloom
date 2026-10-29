import type { Answers } from '@/funnel/types'
import type {
  ChallengingPeriod,
  EnergyLevel,
  MainDifficulty,
  ProfileLevel,
  Trigger,
  WellbeingProfile,
} from './types'

/**
 * Wellbeing profile of the summary (#36). The reference does not show its rules; these are the
 * ones proposed in PLAN 6.5. Not a diagnosis: the summary says so.
 */

const FREQ4: Record<string, number> = { always: 3, often: 2, sometimes: 1, rarely: 0 }
const YSN: Record<string, number> = { yes: 3, sometimes: 1.5, no: 0 }
const OSN: Record<string, number> = { often: 3, sometimes: 1.5, never: 0 }

/** Questions that make up the negative-effects score, with their points per answer. */
export const SCORED_QUESTIONS: Readonly<Record<string, Record<string, number>>> = {
  drained: FREQ4,
  overthink: FREQ4,
  sleep: FREQ4,
  selfcare: FREQ4,
  phone: FREQ4,
  juggling: YSN,
  procrastinate: FREQ4,
  concentration: FREQ4,
  others_needs: OSN,
  others_expect: OSN,
  say_no: OSN,
}

const MAX_POINTS = 3

/** Below 0.33 low, from 0.66 high, medium in between. */
export function levelFor(score: number): ProfileLevel {
  if (score >= 0.66) return 'high'
  if (score >= 0.33) return 'medium'
  return 'low'
}

/** Points over the answered scored questions, normalised to 0..1 (0 with none answered). */
export function negativeEffectsScore(answers: Answers): number {
  let points = 0
  let answered = 0
  for (const [key, table] of Object.entries(SCORED_QUESTIONS)) {
    const value = answers[key]
    if (typeof value !== 'string' || !(value in table)) continue
    points += table[value]
    answered += 1
  }
  return answered === 0 ? 0 : points / (answered * MAX_POINTS)
}

const HABIT_POINTS: Record<string, number> = { stick: 0, rarely: 1, sometimes: 2, often: 3 }

function points(value: unknown, table: Record<string, number>): number {
  return typeof value === 'string' ? (table[value] ?? 0) : 0
}

/**
 * #12 first: a diagnosis reads "Manage ADHD"; a suspicion gets non-diagnostic wording ("Focus
 * and attention"); "No" or "I'd rather not say" fall through to the hardest of procrastination
 * (#09), focus (#11) and habits (#10), in that order on ties.
 */
export function mainDifficulty(answers: Answers): MainDifficulty {
  if (answers.adhd === 'diagnosed') return 'adhd'
  if (answers.adhd === 'suspect') return 'attention'
  const candidates: Array<[MainDifficulty, number]> = [
    ['procrastination', points(answers.procrastinate, FREQ4)],
    ['focus', points(answers.concentration, FREQ4)],
    ['habits', points(answers.restart_habit, HABIT_POINTS)],
  ]
  return candidates.reduce((best, next) => (next[1] > best[1] ? next : best))[0]
}

const PERIOD: Record<string, ChallengingPeriod> = {
  this_week: 'days',
  few_weeks: 'weeks',
  months: 'months',
  not_sure: 'long',
}

export function challengingPeriod(answers: Answers): ChallengingPeriod {
  const value = answers.control_life
  return (typeof value === 'string' && PERIOD[value]) || 'weeks'
}

/** Wand bubbles by priority: the trigger is the highest one released. */
export const TRIGGER_PRIORITY: readonly Trigger[] = [
  'anxiety',
  'burnout',
  'self_doubt',
  'loneliness',
  'lack_of_motivation',
]

export function trigger(answers: Answers): Trigger {
  const released = Array.isArray(answers.wand) ? answers.wand : []
  return TRIGGER_PRIORITY.find((bubble) => released.includes(bubble)) ?? 'stress'
}

const ENERGY: Record<string, EnergyLevel> = {
  always: 'very_low',
  often: 'low',
  sometimes: 'moderate',
  rarely: 'good',
}

export function energyLevel(answers: Answers): EnergyLevel {
  const value = answers.drained
  return (typeof value === 'string' && ENERGY[value]) || 'moderate'
}

export function deriveProfile(answers: Answers): WellbeingProfile {
  const score = negativeEffectsScore(answers)
  return {
    level: levelFor(score),
    score,
    mainDifficulty: mainDifficulty(answers),
    challengingPeriod: challengingPeriod(answers),
    trigger: trigger(answers),
    energyLevel: energyLevel(answers),
  }
}
