'use client'

import { claimsProven } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { DottedMap } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/**
 * #17 "The Science of a Better You" (PLAN 5.6). The press logos and the user count need evidence
 * (claims.ts): without it the press block is left out and the headline speaks to the audience
 * instead of counting users.
 */
export function ScienceScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const withUsers = claimsProven(['users'])
  const headline = copyField(step.id, withUsers ? 'headlineClaim' : 'headline') ?? ''
  const body = copyField(step.id, withUsers ? 'bodyClaim' : 'body') ?? ''
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={styles.title}>{text.title}</h1>
      <div className={styles.grow}>
        <div className={styles.map}>
          <DottedMap />
        </div>
      </div>
      <p className={styles.headline}>{personalize(headline, answers)}</p>
      <p className={styles.body}>{personalize(body, answers)}</p>
    </InterColumn>
  )
}
