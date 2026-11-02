import copyJson from './copy.en.json'
import closingJson from './copy.variant-b.en.json'
import type { StepId } from './steps'
import type { OptionSetId } from './types'

/** Words of one step. Screens read the fields they need; every step has at least a title. */
export interface StepCopy {
  readonly title: string
  readonly subtitle?: string
  readonly cta?: string
  readonly options?: Readonly<Record<string, string>>
  readonly [field: string]: unknown
}

export interface FunnelCopy {
  readonly brand: string
  readonly common: Readonly<Record<string, string>>
  readonly audience: Readonly<Record<'men' | 'women' | 'people', string>>
  readonly optionSets: Readonly<Record<OptionSetId, Readonly<Record<string, string>>>>
  /** Every step must have an entry: a missing one fails the type check. */
  readonly steps: Readonly<Record<StepId, StepCopy>>
}

/**
 * The quiz and the paywall closing (copy.en.json) plus the "pay what you want" closing's words
 * (copy.variant-b.en.json). JSON has no comments and everything in it is shipped to the browser, so
 * what these files are lives here:
 *
 * - English copy of the funnel, kept out of the components (decision D6). Question wording is seeded
 *   from the reference funnel (docs/feature-parity/funnel.reference.json) and is TODO(content):
 *   Bloom's own copy must replace it before launch.
 * - `{{brand}}` is the product name, `{{audience}}` is men, women or people (from the gender answer)
 *   and `{{claims.users}}` is the user count of src/funnel/claims.ts.
 * - Claims, credentials and testimonials are rendered, never gated (guardrails 2 and 3 of PLAN-B 2):
 *   their content is in src/funnel/claims.ts and the words around them are in these files.
 * - The pay what you want closing (#41 pwyw and #42 plan sheet) comes from
 *   docs/feature-parity/funnel.variant-b.reference.json. Its prices are demo data (decision D4) and
 *   the answers of four FAQ questions, which the reference never showed, are Bloom's own
 *   TODO(content).
 */
export const copy: FunnelCopy = {
  ...copyJson,
  steps: { ...copyJson.steps, ...closingJson.steps },
}

export function stepCopy(id: StepId): StepCopy {
  return copy.steps[id]
}

/** Reads a nested string field (for example 'bubbles.anxiety') of a step's copy. */
export function copyField(id: StepId, path: string): string | undefined {
  let node: unknown = copy.steps[id]
  for (const key of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return typeof node === 'string' ? node : undefined
}

export type TemplateVars = Readonly<Record<string, string | number>>

/**
 * Replaces `{{name}}` placeholders (dots allowed, as in `{{claims.users}}`). Unknown names are
 * left untouched so a missing value is visible in QA instead of silently disappearing.
 */
export function interpolate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  )
}

/** Label of an option: the step's own wording first, then its shared option set. */
export function optionLabel(id: StepId, option: string, optionSet?: OptionSetId): string {
  const own = copy.steps[id].options?.[option]
  if (own !== undefined) return own
  return (optionSet && copy.optionSets[optionSet][option]) || option
}
