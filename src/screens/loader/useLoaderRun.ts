'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ease } from './script'
import type { Move } from './script'

export interface LoaderRun {
  /** Progress of each bar, 0 to 1 (re-rendered once per whole percent). */
  values: readonly number[]
  /** Index of the question on screen, or null. */
  asking: number | null
  /** Closes the question and resumes the progress right away. */
  resume: () => void
}

/**
 * Plays a loader script on requestAnimationFrame. A question stops the clock: nothing moves until
 * resume() is called. `onDone` runs once, after the last move.
 */
export function useLoaderRun(
  moves: readonly Move[],
  barCount: number,
  onDone: () => void,
): LoaderRun {
  const [values, setValues] = useState<readonly number[]>(() => Array(barCount).fill(0))
  const [asking, setAsking] = useState<number | null>(null)
  const run = useRef({ index: 0, start: -1, paused: false, done: false })
  const latest = useRef({ onDone })
  useEffect(() => {
    latest.current = { onDone }
  })

  useEffect(() => {
    let frame = 0
    const current = [...Array(barCount).fill(0)] as number[]
    let shown = current.map(() => 0)

    const publish = () => {
      const next = current.map((value) => Math.round(value * 100))
      if (next.some((percent, bar) => percent !== shown[bar])) {
        shown = next
        setValues([...current])
      }
    }

    const tick = (now: number) => {
      const state = run.current
      if (state.done) return
      if (state.paused) {
        frame = requestAnimationFrame(tick)
        return
      }
      const move = moves[state.index]
      if (!move) {
        state.done = true
        latest.current.onDone()
        return
      }
      if (state.start < 0) state.start = now
      if (move.kind === 'ask') {
        state.paused = true
        setAsking(move.interrupt)
        frame = requestAnimationFrame(tick)
        return
      }
      const t = move.ms > 0 ? (now - state.start) / move.ms : 1
      if (move.kind === 'fill') {
        current[move.bar] = move.from + (move.to - move.from) * ease(move.ease, t)
        // Bars before the active one are complete (after a reload mid-run they start full).
        for (let bar = 0; bar < move.bar; bar++) current[bar] = 1
        publish()
      }
      if (t >= 1) {
        state.index += 1
        state.start = now
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [moves, barCount])

  const resume = useCallback(() => {
    const state = run.current
    if (!state.paused) return
    state.paused = false
    state.index += 1
    state.start = -1
    setAsking(null)
  }, [])

  return { values, asking, resume }
}
