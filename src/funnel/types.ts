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

/** Page background by screen type (PLAN 3, "Fondos"). Same names as the PageShell themes. */
export type StepTheme = 'lilac' | 'soft' | 'dark' | 'warm' | 'white'

/** Shared answer sets: FREQ4 = Always..Rarely, YSN = Yes/Sometimes/No, OSN = Often/Sometimes/Never. */
export type OptionSetId = 'FREQ4' | 'YSN' | 'OSN'

export type InterVariant = 'science' | 'match' | 'not_alone' | 'evidence' | 'expert'

/** Claims that need Bloom's own evidence before they can be shown (PLAN 2, guardrail 2). */
export type ClaimRef = 'users' | 'press' | 'universities' | 'expert' | 'testimonials'

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
  readonly claimRefs?: readonly ClaimRef[]
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
  readonly claimRefs?: readonly ClaimRef[]
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

export type StepOfType<T extends StepType> = Extract<Step, { type: T }>

/** A single answer is an option id; a multi answer (or the wand) is a list of ids in pick order. */
export type AnswerValue = string | readonly string[]

export type Answers = Readonly<Record<string, AnswerValue>>
