import type { LoaderInterrupt } from '@/funnel/types'

/**
 * The plan loader as a script of moves (PLAN 5.8, anim-06): each bar fills with an eased curve;
 * a question can stop a bar partway (the progress waits for the answer); short pauses separate
 * the bars. About 12.5 s of activity, without the time spent answering.
 */
export type Move =
  | { kind: 'fill'; bar: number; from: number; to: number; ms: number; ease: 'out' | 'inOut' }
  | { kind: 'ask'; interrupt: number }
  | { kind: 'wait'; ms: number }

export interface BarTiming {
  /** Up to the question, eased out so it slows down near the stop (about 4 s to 50 %). */
  beforeMs: number
  /** From the question to 100 % once answered. */
  afterMs: number
}

/** Observed: bar 1 to 49 % in about 3 s, then 2.3 s to 100 %; bar 2 to 57 % in about 2 s, then 1 s;
 *  bar 3 to 95 % in about 1 s (rounded up so it reads). */
export const LOADER_TIMING = {
  bars: [
    { beforeMs: 4000, afterMs: 2300 },
    { beforeMs: 2000, afterMs: 1000 },
    { beforeMs: 2000, afterMs: 0 },
  ] satisfies BarTiming[],
  gapMs: 300,
  endMs: 600,
} as const

export function loaderScript(
  barCount: number,
  interrupts: readonly LoaderInterrupt[],
  answered: (answerKey: string) => boolean,
): Move[] {
  const moves: Move[] = []
  for (let bar = 0; bar < barCount; bar++) {
    const timing = LOADER_TIMING.bars[bar] ?? { beforeMs: 2000, afterMs: 0 }
    const index = interrupts.findIndex((interrupt) => interrupt.bar === bar)
    const interrupt = interrupts[index]
    if (interrupt && !answered(interrupt.answerKey)) {
      moves.push({
        kind: 'fill',
        bar,
        from: 0,
        to: interrupt.atProgress,
        ms: timing.beforeMs,
        ease: 'out',
      })
      moves.push({ kind: 'ask', interrupt: index })
      moves.push({
        kind: 'fill',
        bar,
        from: interrupt.atProgress,
        to: 1,
        ms: timing.afterMs,
        ease: 'inOut',
      })
    } else {
      moves.push({
        kind: 'fill',
        bar,
        from: 0,
        to: 1,
        ms: timing.beforeMs + timing.afterMs,
        ease: 'out',
      })
    }
    moves.push({ kind: 'wait', ms: bar < barCount - 1 ? LOADER_TIMING.gapMs : LOADER_TIMING.endMs })
  }
  return moves
}

export function ease(kind: 'out' | 'inOut', t: number): number {
  const x = Math.min(1, Math.max(0, t))
  if (kind === 'out') return 1 - (1 - x) ** 3
  return x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2
}

/** Total time of the script without the questions, in ms. */
export function activeDuration(moves: readonly Move[]): number {
  return moves.reduce((sum, move) => sum + (move.kind === 'ask' ? 0 : move.ms), 0)
}
