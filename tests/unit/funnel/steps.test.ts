/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { copy, optionLabel, stepCopy } from '@/funnel/copy'
import {
  OPTION_SETS,
  STEPS,
  STEP_IDS,
  getStep,
  isQuestion,
  isStepId,
  isTransient,
  nextStep,
  stepAt,
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
const reference = JSON.parse(
  readFileSync(join(here, '../../../docs/feature-parity/funnel.reference.json'), 'utf8'),
) as { steps: ReferenceStep[]; optionSets: Record<string, string[]> }

const refById = new Map(reference.steps.map((step) => [step.id, step]))

describe('step catalogue (PLAN 3)', () => {
  it('has the 42 steps in order, numbered by position, with unique ids', () => {
    expect(STEPS).toHaveLength(42)
    STEPS.forEach((step, index) => expect(step.n).toBe(index + 1))
    expect(new Set(STEP_IDS).size).toBe(42)
  })

  it('matches the reference catalogue: same ids, types and order', () => {
    expect(STEPS.map((step) => [step.n, step.id, step.type])).toEqual(
      reference.steps.map((step) => [step.n, step.id, step.type]),
    )
  })

  it('has 28 questions', () => {
    expect(STEPS.filter(isQuestion)).toHaveLength(28)
  })

  it('shows the header on single, intro and capture steps only', () => {
    for (const step of STEPS) {
      const expected = ['single', 'intro', 'capture'].includes(step.type)
      expect(step.header, step.id).toBe(expected)
      expect(step.header, step.id).toBe(refById.get(step.id)!.header)
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
    }
    for (const step of STEPS) {
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
    for (const step of STEPS) {
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
    for (const step of STEPS) {
      if (!isQuestion(step)) continue
      const ref = refById.get(step.id)!
      expect(stepCopy(step.id).title, step.id).toBe(ref.title)
      if (step.type === 'single') expect(stepCopy(step.id).subtitle, step.id).toBe(ref.subtitle)
    }
  })

  it('labels every option of every step in the copy', () => {
    for (const step of STEPS) {
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

  it('looks steps up by id and position', () => {
    expect(getStep('gender').n).toBe(15)
    expect(stepAt(15)?.id).toBe('gender')
    expect(stepAt(0)).toBeUndefined()
    expect(stepAt(43)).toBeUndefined()
    expect(nextStep(getStep('juggling'))?.id).toBe('wand')
    expect(nextStep(getStep('checkout'))).toBeUndefined()
    expect(isStepId('paywall')).toBe(true)
    expect(isStepId('nope')).toBe(false)
  })

  it('marks the self-advancing loaders as transient', () => {
    expect(STEPS.filter(isTransient).map((step) => step.id)).toEqual<StepId[]>([
      'loader',
      'loading',
    ])
  })

  it('flags the ADHD question as health data', () => {
    expect(STEPS.filter((step) => 'sensitive' in step).map((step) => step.id)).toEqual(['adhd'])
  })
})
