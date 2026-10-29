'use client'

import { copy, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { progressFor } from '@/funnel/progress'
import { nextStep } from '@/funnel/steps'
import { Button, Header } from '@/ui'
import type { ScreenProps } from '../types'
import styles from './PendingScreen.module.css'

type PendingType = 'paywall' | 'checkout'

/**
 * Stand-in for a screen type that is not built yet: its title and a Continue button, so the whole
 * funnel can be walked from start to end while the real screens land phase by phase.
 */
export function PendingScreen({ step, onNext }: ScreenProps<PendingType>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  return (
    <div className={styles.screen} data-pending={step.type}>
      {step.header && <Header progress={progressFor(step)} />}
      <div className={styles.body}>
        <h1 className={styles.title}>{personalize(text.title, answers)}</h1>
        <p className={styles.note}>This screen is being built.</p>
      </div>
      {nextStep(step) && (
        <div className={styles.footer}>
          <Button onClick={onNext}>{text.cta ?? copy.common.continue}</Button>
        </div>
      )}
    </div>
  )
}
