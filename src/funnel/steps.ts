import type { OptionSetId, Step } from './types'

/** Option ids of the shared answer sets; their labels are in copy.en.json (optionSets). */
export const OPTION_SETS = {
  FREQ4: ['always', 'often', 'sometimes', 'rarely'],
  YSN: ['yes', 'sometimes', 'no'],
  OSN: ['often', 'sometimes', 'never'],
} as const satisfies Record<OptionSetId, readonly string[]>

function single<const Id extends string, const Set extends OptionSetId>(
  n: number,
  id: Id,
  set: Set,
) {
  return {
    n,
    id,
    type: 'single',
    theme: 'lilac',
    header: true,
    answerKey: id,
    optionSet: set,
    options: OPTION_SETS[set],
  } as const
}

function choice<const Id extends string>(n: number, id: Id, options: readonly string[]) {
  return { n, id, type: 'single', theme: 'lilac', header: true, answerKey: id, options } as const
}

function multi<const Id extends string>(n: number, id: Id, options: readonly string[]) {
  return {
    n,
    id,
    type: 'multi',
    theme: 'lilac',
    header: false,
    answerKey: id,
    options,
    minSelected: 1,
  } as const
}

/**
 * The 42 steps of PLAN section 3, in order. `n` is the position (1 based) and must match the
 * index; `id` is the URL segment (/s/<id>) and, for questions, the answer key.
 */
export const STEPS = [
  { n: 1, id: 'intro', type: 'intro', theme: 'lilac', header: true },
  single(2, 'drained', 'FREQ4'),
  single(3, 'overthink', 'FREQ4'),
  single(4, 'sleep', 'FREQ4'),
  single(5, 'selfcare', 'FREQ4'),
  single(6, 'phone', 'FREQ4'),
  single(7, 'juggling', 'YSN'),
  {
    n: 8,
    id: 'wand',
    type: 'wand',
    theme: 'dark',
    header: false,
    answerKey: 'wand',
    bubbles: ['anxiety', 'self_doubt', 'burnout', 'loneliness', 'lack_of_motivation'],
    pick: 3,
  },
  single(9, 'procrastinate', 'FREQ4'),
  choice(10, 'restart_habit', ['stick', 'rarely', 'sometimes', 'often']),
  single(11, 'concentration', 'FREQ4'),
  { ...choice(12, 'adhd', ['diagnosed', 'suspect', 'no', 'prefer_not']), sensitive: 'health' },
  choice(13, 'untapped', ['yes', 'sometimes', 'not_really']),
  choice(14, 'control_life', ['this_week', 'few_weeks', 'months', 'not_sure']),
  choice(15, 'gender', ['female', 'male', 'non_binary']),
  choice(16, 'age', ['under_20', '20s', '30s', '40s', '50_plus']),
  {
    n: 17,
    id: 'science',
    type: 'inter',
    variant: 'science',
    theme: 'soft',
    header: false,
    ctaEnableDelayMs: 500,
    claimRefs: ['press', 'users'],
  },
  single(18, 'others_needs', 'OSN'),
  single(19, 'others_expect', 'OSN'),
  single(20, 'say_no', 'OSN'),
  multi(21, 'sacrifice', ['sleep', 'nutrition', 'alone_time', 'own_goals', 'emotional_space']),
  multi(22, 'missing', ['motivation', 'structure', 'support', 'clear_plan', 'time', 'self_belief']),
  choice(23, 'wish_understood', ['trying_hard', 'where_to_start', 'time_support', 'stuck']),
  choice(24, 'tried_habits', ['many_times', 'few_times', 'never_tried']),
  {
    n: 25,
    id: 'match',
    type: 'inter',
    variant: 'match',
    theme: 'lilac',
    header: false,
    ctaEnableDelayMs: 500,
  },
  {
    n: 26,
    id: 'not_alone',
    type: 'inter',
    variant: 'not_alone',
    theme: 'soft',
    header: false,
    ctaEnableDelayMs: 500,
    claimRefs: ['users'],
  },
  multi(27, 'who_for', ['myself', 'family', 'future_self', 'believer', 'not_sure']),
  choice(28, 'lose_motivation', ['yes', 'no', 'not_tried']),
  choice(29, 'expert_referral', ['yes', 'no']),
  {
    n: 30,
    id: 'evidence',
    type: 'inter',
    variant: 'evidence',
    theme: 'soft',
    header: false,
    ctaEnableDelayMs: 500,
    claimRefs: ['universities'],
  },
  {
    n: 31,
    id: 'expert',
    type: 'inter',
    variant: 'expert',
    theme: 'soft',
    header: false,
    ctaEnableDelayMs: 500,
    claimRefs: ['expert'],
  },
  choice(32, 'self_discipline', ['none', 'phases', 'structured']),
  choice(33, 'need_most', ['energy', 'habits', 'focus', 'peace']),
  multi(34, 'success_30d', [
    'wake_motivated',
    'no_procrastination',
    'eat_healthier',
    'calmer',
    'morning_routine',
  ]),
  choice(35, 'biggest_motivation', ['stop_stuck', 'tired_restarting', 'long_term', 'feel_better']),
  { n: 36, id: 'summary', type: 'summary', theme: 'soft', header: false },
  {
    n: 37,
    id: 'loader',
    type: 'loader',
    theme: 'soft',
    header: false,
    bars: ['goals', 'strategies', 'saving'],
    interrupts: [
      { bar: 0, atProgress: 0.5, answerKey: 'rushed_mornings', options: ['yes', 'no'] },
      { bar: 1, atProgress: 0.58, answerKey: 'heard_habit_stacking', options: ['yes', 'no'] },
    ],
    claimRefs: ['testimonials'],
  },
  { n: 38, id: 'email', type: 'capture', field: 'email', theme: 'warm', header: true },
  { n: 39, id: 'name', type: 'capture', field: 'name', theme: 'warm', header: true },
  { n: 40, id: 'loading', type: 'loading', theme: 'white', header: false },
  { n: 41, id: 'paywall', type: 'paywall', theme: 'white', header: false },
  { n: 42, id: 'checkout', type: 'checkout', theme: 'white', header: false },
] as const satisfies readonly Step[]

/** One of the 42 configured steps, with its literal id and type. */
export type FunnelStep = (typeof STEPS)[number]

export type StepId = FunnelStep['id']

export const STEP_IDS: readonly StepId[] = STEPS.map((step) => step.id)

const BY_ID = new Map<string, FunnelStep>(STEPS.map((step) => [step.id, step]))

export function isStepId(value: string): value is StepId {
  return BY_ID.has(value)
}

export function getStep(id: StepId): FunnelStep {
  // Every StepId is in the map by construction.
  return BY_ID.get(id)!
}

/** The step at position n (1 based), or undefined outside 1..42. */
export function stepAt(n: number): FunnelStep | undefined {
  return STEPS[n - 1]
}

export function nextStep(step: Step): FunnelStep | undefined {
  return stepAt(step.n + 1)
}

/**
 * Steps that hand over to the next one on their own (the plan loader, the pre-paywall loading
 * screen). Leaving them replaces their history entry, so the browser's Back never lands on a screen
 * that would immediately move forward again.
 */
export function isTransient(step: Step): boolean {
  return step.type === 'loader' || step.type === 'loading'
}

/** Questions answered by the user (the 28 of PLAN 3). */
export function isQuestion(step: Step): boolean {
  return step.type === 'single' || step.type === 'multi'
}
