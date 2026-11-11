import { describe, expect, it } from 'vitest'
import { evidenceOutcomes } from '@/profile/evidence'
import { deriveSheetProfile } from '@/profile/sheet'

describe('evidenceOutcomes (#30, PLAN-B 6.4)', () => {
  it('Self-doubt + Anxiety + Lack of motivation: anxiety and procrastination (recording A)', () => {
    expect(evidenceOutcomes({ wand: ['self_doubt', 'anxiety', 'lack_of_motivation'] })).toEqual([
      'anxiety',
      'motivation',
    ])
  })

  it('Self-doubt + Burnout + Anxiety: burnout wins (recording B)', () => {
    expect(evidenceOutcomes({ wand: ['self_doubt', 'burnout', 'anxiety'] })).toEqual(['burnout'])
  })

  it('adds the phrase of each of Anxiety and Lack of motivation on its own', () => {
    expect(evidenceOutcomes({ wand: ['anxiety'] })).toEqual(['anxiety'])
    expect(evidenceOutcomes({ wand: ['lack_of_motivation'] })).toEqual(['motivation'])
  })

  it('falls back to a generic phrase with none of them, or no wand answer', () => {
    expect(evidenceOutcomes({ wand: ['self_doubt', 'loneliness'] })).toEqual(['generic'])
    expect(evidenceOutcomes({})).toEqual(['generic'])
    expect(evidenceOutcomes({ wand: 'burnout' })).toEqual(['generic'])
  })
})

describe('deriveSheetProfile (NOW vs YOUR GOAL, PLAN-B 4.4 and 6.4)', () => {
  it('reads Low / Weak / Low when there is no data, as the reference showed', () => {
    const profile = deriveSheetProfile({})
    expect(profile.energy).toEqual({ level: 'low', flames: 1 })
    expect(profile.wellbeing).toEqual({ level: 'weak', segments: 1 })
    expect(profile.selfEsteem).toEqual({ level: 'low', segments: 1 })
    expect(profile.difficulty).toBe('perfectionist')
    expect(profile.goal).toBe('calm')
  })

  it('lights flames by how often the visitor feels drained', () => {
    const flames = (drained: string) => deriveSheetProfile({ drained }).energy.flames
    expect([flames('always'), flames('often'), flames('sometimes'), flames('rarely')]).toEqual([
      1, 2, 3, 4,
    ])
    expect(deriveSheetProfile({ drained: 'rarely' }).energy.level).toBe('good')
  })

  it('ties self-esteem to the Self-doubt bubble, and well-being to the profile score', () => {
    expect(deriveSheetProfile({ wand: ['self_doubt'] }).selfEsteem.level).toBe('low')
    expect(
      deriveSheetProfile({ wand: ['anxiety'], others_needs: 'never', say_no: 'never' }).selfEsteem
        .level,
    ).toBe('medium')
    const calm = deriveSheetProfile({
      drained: 'rarely',
      sleep: 'rarely',
      selfcare: 'rarely',
      phone: 'rarely',
    })
    expect(calm.wellbeing).toEqual({ level: 'fair', segments: 2 })
    const worn = deriveSheetProfile({
      drained: 'always',
      sleep: 'always',
      selfcare: 'always',
      phone: 'always',
    })
    expect(worn.wellbeing).toEqual({ level: 'weak', segments: 1 })
  })

  it('picks the dominant trait when it is at least "often", else Perfectionist', () => {
    expect(deriveSheetProfile({ overthink: 'always' }).difficulty).toBe('overthinker')
    expect(deriveSheetProfile({ procrastinate: 'often' }).difficulty).toBe('procrastinator')
    expect(
      deriveSheetProfile({ others_needs: 'often', others_expect: 'often', say_no: 'often' })
        .difficulty,
    ).toBe('people_pleaser')
    expect(deriveSheetProfile({ overthink: 'sometimes' }).difficulty).toBe('perfectionist')
  })

  it('takes the goal from #34 by priority: Feeling calmer wins over the others (recording B)', () => {
    expect(deriveSheetProfile({ success_30d: ['no_procrastination', 'calmer'] }).goal).toBe('calm')
    expect(deriveSheetProfile({ success_30d: ['eat_healthier'] }).goal).toBe('healthy')
    expect(deriveSheetProfile({ success_30d: ['morning_routine', 'wake_motivated'] }).goal).toBe(
      'energy',
    )
    expect(deriveSheetProfile({ success_30d: ['no_procrastination'] }).goal).toBe('focus')
    expect(deriveSheetProfile({ success_30d: ['morning_routine'] }).goal).toBe('routine')
  })

  it('falls back to #33 for the goal when #34 has no answer', () => {
    expect(deriveSheetProfile({ need_most: 'energy' }).goal).toBe('energy')
    expect(deriveSheetProfile({ need_most: 'focus' }).goal).toBe('focus')
    expect(deriveSheetProfile({ need_most: 'peace' }).goal).toBe('calm')
  })
})
