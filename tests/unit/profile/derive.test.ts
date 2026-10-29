import { describe, expect, it } from 'vitest'
import {
  SCORED_QUESTIONS,
  challengingPeriod,
  deriveProfile,
  energyLevel,
  levelFor,
  mainDifficulty,
  negativeEffectsScore,
  trigger,
} from '@/profile/derive'

/** The walkthrough of the recording (PLAN 6.5, "Observado" column). */
const RECORDED = {
  drained: 'often',
  overthink: 'often',
  sleep: 'often',
  selfcare: 'often',
  phone: 'often',
  juggling: 'yes',
  procrastinate: 'always',
  concentration: 'always',
  others_needs: 'often',
  others_expect: 'often',
  say_no: 'often',
  restart_habit: 'often',
  adhd: 'diagnosed',
  control_life: 'few_weeks',
  wand: ['self_doubt', 'anxiety', 'lack_of_motivation'],
}

describe('negative effects score', () => {
  it('uses the 11 questions of PLAN 6.5', () => {
    expect(Object.keys(SCORED_QUESTIONS).sort()).toEqual(
      [
        'concentration',
        'drained',
        'juggling',
        'others_expect',
        'others_needs',
        'overthink',
        'phone',
        'procrastinate',
        'say_no',
        'selfcare',
        'sleep',
      ].sort(),
    )
  })

  it('is 0 for the calmest answers and 1 for the hardest', () => {
    const calm = { ...Object.fromEntries(Object.keys(SCORED_QUESTIONS).map((k) => [k, 'rarely'])) }
    calm.juggling = 'no'
    for (const key of ['others_needs', 'others_expect', 'say_no']) calm[key] = 'never'
    expect(negativeEffectsScore(calm)).toBe(0)

    const hard = { ...Object.fromEntries(Object.keys(SCORED_QUESTIONS).map((k) => [k, 'always'])) }
    hard.juggling = 'yes'
    for (const key of ['others_needs', 'others_expect', 'say_no']) hard[key] = 'often'
    expect(negativeEffectsScore(hard)).toBe(1)
  })

  it('normalises over the questions answered and ignores unknown values', () => {
    expect(negativeEffectsScore({})).toBe(0)
    expect(negativeEffectsScore({ drained: 'sometimes' })).toBeCloseTo(1 / 3)
    expect(negativeEffectsScore({ drained: 'sometimes', sleep: 'what' })).toBeCloseTo(1 / 3)
  })

  it('maps to levels at 0.33 and 0.66', () => {
    expect(levelFor(0)).toBe('low')
    expect(levelFor(0.329)).toBe('low')
    expect(levelFor(0.33)).toBe('medium')
    expect(levelFor(0.659)).toBe('medium')
    expect(levelFor(0.66)).toBe('high')
  })
})

describe('profile of the recorded walkthrough', () => {
  it('matches what the reference showed: High, Manage ADHD, Few weeks, Anxiety, Low', () => {
    const profile = deriveProfile(RECORDED)
    expect(profile).toMatchObject({
      level: 'high',
      mainDifficulty: 'adhd',
      challengingPeriod: 'weeks',
      trigger: 'anxiety',
      energyLevel: 'low',
    })
    // The reference knob sat at about 74 %.
    expect(profile.score).toBeGreaterThan(0.66)
    expect(profile.score).toBeLessThan(0.9)
  })
})

describe('main difficulty', () => {
  it('never turns a suspicion into a diagnosis', () => {
    expect(mainDifficulty({ adhd: 'diagnosed' })).toBe('adhd')
    expect(mainDifficulty({ adhd: 'suspect' })).toBe('attention')
  })

  it('without ADHD, picks the hardest of procrastination, focus and habits', () => {
    expect(mainDifficulty({ adhd: 'no', procrastinate: 'rarely', concentration: 'often' })).toBe(
      'focus',
    )
    expect(mainDifficulty({ adhd: 'prefer_not', restart_habit: 'often' })).toBe('habits')
    expect(mainDifficulty({ procrastinate: 'often', concentration: 'often' })).toBe(
      'procrastination',
    )
  })
})

describe('period, trigger and energy', () => {
  it('maps the last time in control to a period', () => {
    expect(challengingPeriod({ control_life: 'this_week' })).toBe('days')
    expect(challengingPeriod({ control_life: 'months' })).toBe('months')
    expect(challengingPeriod({ control_life: 'not_sure' })).toBe('long')
  })

  it('takes the released bubble with the highest priority', () => {
    expect(trigger({ wand: ['loneliness', 'burnout'] })).toBe('burnout')
    expect(trigger({ wand: ['lack_of_motivation'] })).toBe('lack_of_motivation')
    expect(trigger({})).toBe('stress')
  })

  it('reads energy from how often the user feels drained', () => {
    expect(energyLevel({ drained: 'always' })).toBe('very_low')
    expect(energyLevel({ drained: 'rarely' })).toBe('good')
    expect(energyLevel({})).toBe('moderate')
  })
})
