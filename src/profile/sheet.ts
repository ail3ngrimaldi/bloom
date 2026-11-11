import type { Answers } from '@/funnel/types'
import { negativeEffectsScore } from './derive'

/**
 * What the plan sheet shows in its NOW vs YOUR GOAL comparison and in the Difficulty / Goal row
 * (PLAN-B 4.4). The reference shows the results of one visitor and none of the rules, so these are
 * Bloom's own, inferred and not diagnostic; they must be approved by the content team (D13).
 * YOUR GOAL is always the top of each scale.
 */

export type EnergyNow = 'low' | 'medium' | 'good'
export type WellbeingNow = 'weak' | 'fair'
export type SelfEsteemNow = 'low' | 'medium'
export type SheetDifficulty = 'perfectionist' | 'overthinker' | 'people_pleaser' | 'procrastinator'
export type SheetGoal = 'calm' | 'energy' | 'focus' | 'healthy' | 'routine'

export interface SheetProfile {
  /** Level and how many of the 5 flames are lit today. */
  energy: { level: EnergyNow; flames: number }
  /** Level and how many of the 3 segments are filled today. */
  wellbeing: { level: WellbeingNow; segments: number }
  selfEsteem: { level: SelfEsteemNow; segments: number }
  difficulty: SheetDifficulty
  goal: SheetGoal
}

/** The goal scale: High, 5 flames, Strong and High, 3 segments. */
export const GOAL_FLAMES = 5
export const GOAL_SEGMENTS = 3
export const ENERGY_FLAMES = GOAL_FLAMES

const ENERGY_BY_DRAINED: Readonly<Record<string, SheetProfile['energy']>> = {
  always: { level: 'low', flames: 1 },
  often: { level: 'low', flames: 2 },
  sometimes: { level: 'medium', flames: 3 },
  rarely: { level: 'good', flames: 4 },
}

const FREQ4: Readonly<Record<string, number>> = { always: 3, often: 2, sometimes: 1, rarely: 0 }
const OSN: Readonly<Record<string, number>> = { often: 3, sometimes: 1.5, never: 0 }

function points(value: unknown, table: Readonly<Record<string, number>>): number {
  return typeof value === 'string' ? (table[value] ?? 0) : 0
}

/** Missing data reads Low / Weak / Low, as in the reference. */
function energyNow(answers: Answers): SheetProfile['energy'] {
  const drained = answers.drained
  return (typeof drained === 'string' && ENERGY_BY_DRAINED[drained]) || { level: 'low', flames: 1 }
}

function wellbeingNow(answers: Answers): SheetProfile['wellbeing'] {
  const answered = ['drained', 'sleep', 'selfcare', 'phone'].some(
    (key) => typeof answers[key] === 'string',
  )
  if (!answered) return { level: 'weak', segments: 1 }
  return negativeEffectsScore(answers) >= 0.33
    ? { level: 'weak', segments: 1 }
    : { level: 'fair', segments: 2 }
}

function selfEsteemNow(answers: Answers): SheetProfile['selfEsteem'] {
  const released = Array.isArray(answers.wand) ? answers.wand : []
  const pleasing = points(answers.others_needs, OSN) >= 3 || points(answers.say_no, OSN) >= 3
  const unanswered = !Array.isArray(answers.wand) && answers.others_needs === undefined
  return released.includes('self_doubt') || pleasing || unanswered
    ? { level: 'low', segments: 1 }
    : { level: 'medium', segments: 2 }
}

/**
 * The dominant trait among overthinking (#03), people pleasing (#18 to #20, on average) and
 * procrastination (#09), when it is at least "often" (2 of 3); otherwise Perfectionist, the value
 * the reference showed.
 */
function difficulty(answers: Answers): SheetDifficulty {
  const candidates: Array<[SheetDifficulty, number]> = [
    ['overthinker', points(answers.overthink, FREQ4)],
    [
      'people_pleaser',
      (points(answers.others_needs, OSN) +
        points(answers.others_expect, OSN) +
        points(answers.say_no, OSN)) /
        3,
    ],
    ['procrastinator', points(answers.procrastinate, FREQ4)],
  ]
  const best = candidates.reduce((top, next) => (next[1] > top[1] ? next : top))
  return best[1] >= 2 ? best[0] : 'perfectionist'
}

/** #34 by priority (the reference's visitor picked two and got "State of calm"), then #33. */
const GOAL_BY_SUCCESS: ReadonlyArray<readonly [string, SheetGoal]> = [
  ['calmer', 'calm'],
  ['wake_motivated', 'energy'],
  ['no_procrastination', 'focus'],
  ['eat_healthier', 'healthy'],
  ['morning_routine', 'routine'],
]

const GOAL_BY_NEED: Readonly<Record<string, SheetGoal>> = {
  energy: 'energy',
  habits: 'routine',
  focus: 'focus',
  peace: 'calm',
}

function goal(answers: Answers): SheetGoal {
  const picked = Array.isArray(answers.success_30d) ? answers.success_30d : []
  const found = GOAL_BY_SUCCESS.find(([option]) => picked.includes(option))
  if (found) return found[1]
  const need = answers.need_most
  return (typeof need === 'string' && GOAL_BY_NEED[need]) || 'calm'
}

export function deriveSheetProfile(answers: Answers): SheetProfile {
  return {
    energy: energyNow(answers),
    wellbeing: wellbeingNow(answers),
    selfEsteem: selfEsteemNow(answers),
    difficulty: difficulty(answers),
    goal: goal(answers),
  }
}
