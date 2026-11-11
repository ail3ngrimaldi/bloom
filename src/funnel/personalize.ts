import { CLAIMS } from './claims'
import { copy, interpolate } from './copy'
import type { TemplateVars } from './copy'
import type { Answers } from './types'

export type Audience = 'men' | 'women' | 'people'

/**
 * Who the copy speaks about, from the gender answer (#15). Only Male -> men was observed in the
 * reference; Female -> women and Non-binary -> people are inferred (PLAN 3). No answer -> people.
 */
const AUDIENCE_BY_GENDER: Readonly<Record<string, Audience>> = {
  male: 'men',
  female: 'women',
  non_binary: 'people',
}

export function audienceFor(answers: Answers): Audience {
  const gender = answers.gender
  return (typeof gender === 'string' && AUDIENCE_BY_GENDER[gender]) || 'people'
}

/**
 * Placeholder values every funnel text can use: {{brand}}, {{audience}} and the claim figures
 * ({{claims.users}}). Claims are never withheld (guardrail 2 of PLAN-B 2).
 */
export function templateVars(answers: Answers, extra: TemplateVars = {}): TemplateVars {
  return {
    brand: copy.brand,
    audience: copy.audience[audienceFor(answers)],
    'claims.users': CLAIMS.users.value,
    ...extra,
  }
}

/** Interpolates a funnel text with the answers so far. */
export function personalize(template: string, answers: Answers, extra?: TemplateVars): string {
  return interpolate(template, templateVars(answers, extra))
}
