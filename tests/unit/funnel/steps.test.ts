/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { copy, optionLabel, stepCopy } from '@/funnel/copy'
import {
  ALL_STEPS,
  CLOSINGS,
  FUNNEL_LENGTH,
  OPTION_SETS,
  QUIZ_LENGTH,
  QUIZ_STEPS,
  STEP_IDS,
  closingOf,
  getStep,
  isQuestion,
  isStepId,
  isTransient,
  nextStep,
  stepAt,
  stepsFor,
} from '@/funnel/steps'
import type { StepId } from '@/funnel/steps'

interface ReferenceStep {
  n: number
  id: string
  type: string
  header: boolean
  theme: string
  title?: string
  subtitle?: string
  optionSet?: keyof typeof OPTION_SETS
  options?: string[]
}

// jsdom's URL is not Node's, so the path is built by hand (as tests/unit/helpers/css.ts does).
const here = dirname(fileURLToPath(import.meta.url))
const docs = join(here, '../../../docs/feature-parity')
const reference = JSON.parse(readFileSync(join(docs, 'funnel.reference.json'), 'utf8')) as {
  steps: ReferenceStep[]
  optionSets: Record<string, string[]>
}
const referenceB = JSON.parse(
  readFileSync(join(docs, 'funnel.variant-b.reference.json'), 'utf8'),
) as {
  closing: { steps: Array<{ n: number; id: string; type: string }> }
}

const refById = new Map(reference.steps.map((step) => [step.id, step]))

describe('step catalogue (PLAN 3)', () => {
  it('has 40 shared steps in order, numbered by position, and 42 steps per closing', () => {
    expect(QUIZ_STEPS).toHaveLength(QUIZ_LENGTH)
    QUIZ_STEPS.forEach((step, index) => expect(step.n).toBe(index + 1))
    for (const closing of ['paywall', 'pwyw'] as const) {
      const steps = stepsFor(closing)
      expect(steps).toHaveLength(FUNNEL_LENGTH)
      steps.forEach((step, index) => expect(step.n, `${closing} #${index + 1}`).toBe(index + 1))
    }
    expect(FUNNEL_LENGTH).toBe(42)
  })

  it('has unique ids across both closings', () => {
    expect(ALL_STEPS).toHaveLength(44)
    expect(new Set(STEP_IDS).size).toBe(44)
  })

  it('matches the reference catalogue of the paywall closing: same ids, types and order', () => {
    expect(stepsFor('paywall').map((step) => [step.n, step.id, step.type])).toEqual(
      reference.steps.map((step) => [step.n, step.id, step.type]),
    )
  })

  it('matches the pay-what-you-want reference: the shared steps, then #41 pwyw and #42 plan sheet', () => {
    const [, pwyw, plan] = referenceB.closing.steps
    expect(pwyw).toMatchObject({ n: 41, id: 'pwyw', type: 'pwyw' })
    expect(plan).toMatchObject({ n: 42, id: 'plan', type: 'plan_sheet' })
    expect(CLOSINGS.pwyw.map((step) => [step.n, step.id, step.type])).toEqual([
      [41, 'pwyw', 'pwyw'],
      [42, 'plan', 'plan_sheet'],
    ])
    // The 40 shared steps are the same in both closings (the quiz is the same).
    expect(stepsFor('pwyw').slice(0, QUIZ_LENGTH)).toEqual(
      stepsFor('paywall').slice(0, QUIZ_LENGTH),
    )
  })

  it('has 28 questions', () => {
    expect(QUIZ_STEPS.filter(isQuestion)).toHaveLength(28)
  })

  it('shows the header on single, intro and capture steps only', () => {
    for (const step of ALL_STEPS) {
      const expected = ['single', 'intro', 'capture'].includes(step.type)
      expect(step.header, step.id).toBe(expected)
      const ref = refById.get(step.id)
      if (ref) expect(step.header, step.id).toBe(ref.header)
    }
  })

  it('uses the background of each screen type', () => {
    const themeByType: Record<string, string> = {
      intro: 'lilac',
      single: 'lilac',
      multi: 'lilac',
      wand: 'dark',
      summary: 'soft',
      loader: 'soft',
      capture: 'warm',
      loading: 'white',
      paywall: 'white',
      checkout: 'white',
      pwyw: 'white',
      plan_sheet: 'white',
    }
    for (const step of ALL_STEPS) {
      const expected =
        step.type === 'inter'
          ? step.variant === 'match'
            ? 'lilac'
            : 'soft'
          : themeByType[step.type]
      expect(step.theme, step.id).toBe(expected)
    }
  })

  it('has the options of the reference for every question, in order', () => {
    for (const step of QUIZ_STEPS) {
      if (step.type !== 'single' && step.type !== 'multi') continue
      const ref = refById.get(step.id)!
      const refOptions = ref.optionSet ? reference.optionSets[ref.optionSet] : ref.options!
      const labels = step.options.map((option) =>
        optionLabel(step.id, option, 'optionSet' in step ? step.optionSet : undefined),
      )
      // #12 adds "I'd rather not say" (health data must be optional, PLAN 2 guardrail 4).
      const expected = step.id === 'adhd' ? [...refOptions, "I'd rather not say"] : refOptions
      expect(labels, step.id).toEqual(expected)
    }
  })

  it('keeps the reference wording of every question title and subtitle', () => {
    for (const step of QUIZ_STEPS) {
      if (!isQuestion(step)) continue
      const ref = refById.get(step.id)!
      expect(stepCopy(step.id).title, step.id).toBe(ref.title)
      if (step.type === 'single') expect(stepCopy(step.id).subtitle, step.id).toBe(ref.subtitle)
    }
  })

  it('labels every option of every step in the copy', () => {
    for (const step of QUIZ_STEPS) {
      if (!('options' in step)) continue
      const own = stepCopy(step.id).options ?? {}
      const shared = 'optionSet' in step ? copy.optionSets[step.optionSet] : {}
      for (const option of step.options) {
        expect(own[option] ?? shared[option], `${step.id}.${option}`).toEqual(expect.any(String))
      }
    }
  })

  it('has copy for every step and no copy for unknown steps', () => {
    expect(Object.keys(copy.steps).sort()).toEqual([...STEP_IDS].sort())
    for (const id of STEP_IDS) expect(stepCopy(id).title.length, id).toBeGreaterThan(0)
  })

  it('looks steps up by id and by position within a closing', () => {
    expect(getStep('gender').n).toBe(15)
    expect(stepAt(15, 'pwyw')?.id).toBe('gender')
    expect(stepAt(0, 'pwyw')).toBeUndefined()
    expect(stepAt(43, 'pwyw')).toBeUndefined()
    expect(stepAt(41, 'pwyw')?.id).toBe('pwyw')
    expect(stepAt(41, 'paywall')?.id).toBe('paywall')
    expect(stepAt(42, 'pwyw')?.id).toBe('plan')
    expect(nextStep(getStep('juggling'), 'pwyw')?.id).toBe('wand')
    expect(nextStep(getStep('loading'), 'pwyw')?.id).toBe('pwyw')
    expect(nextStep(getStep('loading'), 'paywall')?.id).toBe('paywall')
    expect(nextStep(getStep('pwyw'), 'pwyw')?.id).toBe('plan')
    expect(nextStep(getStep('checkout'), 'paywall')).toBeUndefined()
    expect(nextStep(getStep('plan'), 'pwyw')).toBeUndefined()
    expect(isStepId('paywall')).toBe(true)
    expect(isStepId('plan')).toBe(true)
    expect(isStepId('nope')).toBe(false)
  })

  it('knows which closing a step belongs to', () => {
    expect(closingOf(getStep('intro'))).toBeNull()
    expect(closingOf(getStep('loading'))).toBeNull()
    expect(closingOf(getStep('paywall'))).toBe('paywall')
    expect(closingOf(getStep('checkout'))).toBe('paywall')
    expect(closingOf(getStep('pwyw'))).toBe('pwyw')
    expect(closingOf(getStep('plan'))).toBe('pwyw')
  })

  it('marks the self-advancing loaders as transient', () => {
    expect(ALL_STEPS.filter(isTransient).map((step) => step.id)).toEqual<StepId[]>([
      'loader',
      'loading',
    ])
  })

  it('flags the ADHD question as health data', () => {
    expect(ALL_STEPS.filter((step) => 'sensitive' in step).map((step) => step.id)).toEqual(['adhd'])
  })

  it('offers three amounts, the last one the popular one and the full cost to the company', () => {
    const pwyw = getStep('pwyw')
    if (pwyw.type !== 'pwyw') throw new Error('#41 is not pwyw')
    expect(pwyw.tiles.map((tile) => tile.amount)).toEqual([2, 10, 16.41])
    expect(pwyw.tiles.filter((tile) => 'mostPopular' in tile)).toHaveLength(1)
    expect(pwyw.trialDays).toBe(14)
  })
})
