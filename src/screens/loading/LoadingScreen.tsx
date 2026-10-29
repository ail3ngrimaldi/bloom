'use client'

import { useEffect } from 'react'
import { stepCopy } from '@/funnel/copy'
import { Logo } from '@/ui'
import type { ScreenProps } from '../types'
import styles from './LoadingScreen.module.css'

/** How long the brand loader stays (PLAN 5.9: at most 1.5 s instead of the reference's blank 4 s). */
export const LOADING_MS = 1000

/**
 * #40: a short brand loader between the name and the paywall. The paywall ships in the same
 * bundle, so it is ready; this only gives the transition a beat, then moves on by itself.
 */
export function LoadingScreen({ step, onNext }: ScreenProps<'loading'>) {
  useEffect(() => {
    const timer = setTimeout(onNext, LOADING_MS)
    return () => clearTimeout(timer)
  }, [onNext])

  return (
    <div className={styles.screen}>
      <Logo className={styles.logo} />
      <h1 className={styles.text}>{stepCopy(step.id).title}</h1>
      <span className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  )
}
