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

/** Placeholder values every funnel text can use: {{brand}}, {{audience}} and the claim figures. */
export function templateVars(answers: Answers, extra: TemplateVars = {}): TemplateVars {
  const vars: Record<string, string | number> = {
    brand: copy.brand,
    audience: copy.audience[audienceFor(answers)],
  }
  for (const [name, claim] of Object.entries(CLAIMS)) {
    if (claim.evidence && claim.value !== undefined) vars[`claims.${name}`] = claim.value
  }
  return { ...vars, ...extra }
}

/** Interpolates a funnel text with the answers so far. */
export function personalize(template: string, answers: Answers, extra?: TemplateVars): string {
  return interpolate(template, templateVars(answers, extra))
}
