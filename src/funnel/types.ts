/**
 * Step model of the funnel (PLAN 6.1). The config in steps.ts is the single source of truth for
 * order, type, theme and the answer each step stores; the words live in copy.en.json.
 */

export type StepType =
  | 'intro'
  | 'single'
  | 'multi'
  | 'wand'
  | 'inter'
  | 'summary'
  | 'loader'
  | 'capture'
  | 'loading'
  | 'paywall'
  | 'checkout'
  | 'pwyw'
  | 'plan_sheet'

/**
 * Which closing the funnel ends with (decision D9): the paywall of three plans plus a checkout
 * modal, or "Pay what you want" plus the plan sheet. Both are built; `funnel.closing` picks one.
 */
export type ClosingVariant = 'paywall' | 'pwyw'

/** Page background by screen type (PLAN 3, "Fondos"). Same names as the PageShell themes. */
export type StepTheme = 'lilac' | 'soft' | 'dark' | 'warm' | 'white'

/** Shared answer sets: FREQ4 = Always..Rarely, YSN = Yes/Sometimes/No, OSN = Often/Sometimes/Never. */
export type OptionSetId = 'FREQ4' | 'YSN' | 'OSN'

export type InterVariant = 'science' | 'match' | 'not_alone' | 'evidence' | 'expert'

interface StepBase {
  /** Position in the funnel, 1 to 42 (PLAN 3). */
  readonly n: number
  /** Stable id, also the URL segment: /s/<id>. */
  readonly id: string
  readonly theme: StepTheme
  /** Shows the logo and the progress bar. */
  readonly header: boolean
}

export interface IntroStep extends StepBase {
  readonly type: 'intro'
}

export interface SingleStep extends StepBase {
  readonly type: 'single'
  readonly answerKey: string
  /** Option ids in display order; labels come from the copy. */
  readonly options: readonly string[]
  /** Labels come from this shared set unless the step's copy overrides them. */
  readonly optionSet?: OptionSetId
  /** Health data: needs the privacy notice and non-diagnostic wording (PLAN 2, guardrail 4). */
  readonly sensitive?: 'health'
}

export interface MultiStep extends StepBase {
  readonly type: 'multi'
  readonly answerKey: string
  readonly options: readonly string[]
  /** The CTA stays disabled below this many selections. */
  readonly minSelected: number
}

export interface WandStep extends StepBase {
  readonly type: 'wand'
  readonly answerKey: string
  /** Bubble ids; labels come from the copy. */
  readonly bubbles: readonly string[]
  /** Releases needed to finish. */
  readonly pick: number
}

export interface InterStep extends StepBase {
  readonly type: 'inter'
  readonly variant: InterVariant
  /** The CTA is disabled this long after the screen mounts. */
  readonly ctaEnableDelayMs: number
}

export interface SummaryStep extends StepBase {
  readonly type: 'summary'
}

export interface LoaderInterrupt {
  /** Index of the progress bar the question interrupts. */
  readonly bar: number
  /** Progress (0 to 1) of that bar at which the question opens. */
  readonly atProgress: number
  readonly answerKey: string
  readonly options: readonly string[]
}

export interface LoaderStep extends StepBase {
  readonly type: 'loader'
  /** Progress bar ids in order; labels come from the copy, colours are --step-1..3. */
  readonly bars: readonly string[]
  readonly interrupts: readonly LoaderInterrupt[]
}

export interface CaptureStep extends StepBase {
  readonly type: 'capture'
  readonly field: 'email' | 'name'
}

export interface LoadingStep extends StepBase {
  readonly type: 'loading'
}

export interface PaywallStep extends StepBase {
  readonly type: 'paywall'
}

export interface CheckoutStep extends StepBase {
  readonly type: 'checkout'
}

/** One of the three amounts of "Pay what you want" (PLAN-B 4.1). */
export interface PwywTile {
  readonly id: string
  /** What the visitor pays today for the trial, in USD. It is the amount charged now. */
  readonly amount: number
  /** Carries the "MOST POPULAR" ribbon and is the tile preselected on arrival (D10). */
  readonly mostPopular?: boolean
}

/** #41 of the "pwyw" closing: choose what to pay for the trial (PLAN-B 4.1). */
export interface PwywStep extends StepBase {
  readonly type: 'pwyw'
  readonly trialDays: number
  readonly tiles: readonly PwywTile[]
}

/** #42 of the "pwyw" closing: the plan sheet with the gift, the discount and the payment. */
export interface PlanSheetStep extends StepBase {
  readonly type: 'plan_sheet'
  /** Gifts of the discount modal: how many are offered and the discount each one reveals (D11). */
  readonly gift: { readonly count: 1 | 3; readonly outcomes: readonly number[] }
}

export type Step =
  | IntroStep
  | SingleStep
  | MultiStep
  | WandStep
  | InterStep
  | SummaryStep
  | LoaderStep
  | CaptureStep
  | LoadingStep
  | PaywallStep
  | CheckoutStep
  | PwywStep
  | PlanSheetStep

export type StepOfType<T extends StepType> = Extract<Step, { type: T }>

/** A single answer is an option id; a multi answer (or the wand) is a list of ids in pick order. */
export type AnswerValue = string | readonly string[]

export type Answers = Readonly<Record<string, AnswerValue>>
