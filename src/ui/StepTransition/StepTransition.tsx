'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../cx'
import { getStepTiming } from './timing'
import styles from './StepTransition.module.css'

type Phase = 'idle' | 'out' | 'gap' | 'in'

export interface StepTransitionProps {
  /** Identifies the step. Changing it starts the exit, gap and entrance sequence. */
  stepKey: string | number
  children: ReactNode
  /** Called with the step key once its content has fully faded in (or mounted, without `appear`). */
  onEntered?: (stepKey: string | number) => void
  /**
   * Called with the key whose content is about to fade in: when the old content has faded out
   * (the gap starts), and again when the gap ends in case the target changed meanwhile. The moment
   * to swap what surrounds the stage for the next step (page background, frame) unseen.
   */
  onSwap?: (stepKey: string | number) => void
  /** Fade the very first content in instead of showing it immediately. */
  appear?: boolean
  className?: string
}

/**
 * Cross-step fade for the content inside the card (the card itself never animates): the old
 * content fades out (400 ms), nothing shows for 150 ms, then the new content fades in (300 ms).
 * The old content is kept alive until it has gone, so callers just pass the current step.
 * If the key changes mid-transition, the sequence ends on the latest step.
 */
export function StepTransition({
  stepKey,
  children,
  onEntered,
  onSwap,
  appear = false,
  className,
}: StepTransitionProps) {
  const [phase, setPhase] = useState<Phase>(appear ? 'in' : 'idle')
  const [shownKey, setShownKey] = useState(stepKey)
  // Children last rendered for `shownKey`: what to fade out when the next step arrives.
  const [snapshot, setSnapshot] = useState<ReactNode>(children)
  const [leaving, setLeaving] = useState<ReactNode>(null)

  if (stepKey !== shownKey && (phase === 'idle' || phase === 'in')) {
    setLeaving(snapshot)
    setPhase('out')
  } else if (stepKey === shownKey && snapshot !== children) {
    setSnapshot(children)
  }

  const latest = useRef({ stepKey, children, onEntered, onSwap })
  useEffect(() => {
    latest.current = { stepKey, children, onEntered, onSwap }
  })

  useEffect(() => {
    if (phase === 'idle') return
    const timing = getStepTiming()
    const delay = phase === 'out' ? timing.out : phase === 'gap' ? timing.gap : timing.in
    const id = setTimeout(() => {
      if (phase === 'out') {
        setLeaving(null)
        setPhase('gap')
        latest.current.onSwap?.(latest.current.stepKey)
      } else if (phase === 'gap') {
        const next = latest.current.stepKey
        setShownKey(next)
        setSnapshot(latest.current.children)
        setPhase('in')
        latest.current.onSwap?.(next)
      } else {
        setPhase('idle')
        latest.current.onEntered?.(shownKey)
      }
    }, delay)
    return () => clearTimeout(id)
  }, [phase, shownKey])

  const announced = useRef(false)
  useEffect(() => {
    if (announced.current) return
    announced.current = true
    if (!appear) latest.current.onEntered?.(shownKey)
  }, [appear, shownKey])

  return (
    <div
      className={cx(
        styles.stage,
        phase === 'out' && styles.leaving,
        phase === 'in' && styles.entering,
        className,
      )}
      data-phase={phase}
      inert={phase === 'out' ? true : undefined}
    >
      {phase === 'out' ? leaving : phase === 'gap' ? null : children}
    </div>
  )
}
