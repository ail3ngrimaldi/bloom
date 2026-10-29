export type ProfileLevel = 'low' | 'medium' | 'high'

export type MainDifficulty = 'adhd' | 'attention' | 'procrastination' | 'focus' | 'habits'
export type ChallengingPeriod = 'days' | 'weeks' | 'months' | 'long'
export type Trigger =
  'anxiety' | 'burnout' | 'self_doubt' | 'loneliness' | 'lack_of_motivation' | 'stress'
export type EnergyLevel = 'very_low' | 'low' | 'moderate' | 'good'

/**
 * Output of the wellbeing-profile derivation (PLAN 6.5); the summary screen renders it. The
 * values are ids: their wording lives in the copy (steps.summary).
 */
export interface WellbeingProfile {
  level: ProfileLevel
  /** Normalised negative-effects score in 0..1; it is also where the meter knob sits. */
  score: number
  mainDifficulty: MainDifficulty
  challengingPeriod: ChallengingPeriod
  trigger: Trigger
  energyLevel: EnergyLevel
}
