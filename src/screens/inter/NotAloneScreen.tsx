'use client'

import { claimsProven } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { Orbits } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/** #26 "You are not alone" (PLAN 5.6): the user count only with evidence (claims.ts). */
export function NotAloneScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const body = copyField(step.id, claimsProven(['users']) ? 'bodyClaim' : 'body') ?? ''
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={styles.title}>{text.title}</h1>
      <div className={styles.grow}>
        <div className={styles.orbits}>
          <Orbits />
        </div>
      </div>
      <p className={styles.body}>{personalize(body, answers)}</p>
    </InterColumn>
  )
}
