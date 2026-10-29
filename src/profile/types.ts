export type ProfileLevel = 'low' | 'medium' | 'high'

/** Output of the wellbeing-profile derivation (PLAN 6.5); the summary screen renders it. */
export interface WellbeingProfile {
  level: ProfileLevel
  /** Normalised negative-effects score in 0..1; it is also where the meter knob sits. */
  score: number
  mainDifficulty: string
  challengingPeriod: string
  trigger: string
  energyLevel: string
}
