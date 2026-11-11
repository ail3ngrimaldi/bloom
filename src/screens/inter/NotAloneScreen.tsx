'use client'

import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { Orbits } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/** #26 "You are not alone" (PLAN 5.6): the user count (claim C1) over the orbits of people. */
export function NotAloneScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={styles.title}>{text.title}</h1>
      <div className={styles.grow}>
        <div className={styles.orbits}>
          <Orbits />
        </div>
      </div>
      <p className={styles.body}>{personalize(copyField(step.id, 'body') ?? '', answers)}</p>
    </InterColumn>
  )
}
