'use client'

import { useId } from 'react'
import { CLAIMS } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { DottedMap, PressWordmarks } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/**
 * #17 "The Science of a Better You" (PLAN 5.6, PLAN-B 3.4): the dotted map, the press the product
 * was featured in (claim C2) and the user count (claim C1). Nothing is gated (guardrail 2).
 */
export function ScienceScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const featuredId = useId()
  const text = stepCopy(step.id)
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={styles.title}>{text.title}</h1>
      <div className={styles.growTop}>
        <div className={styles.map}>
          <DottedMap />
        </div>
        <div className={styles.featured}>
          <p id={featuredId} className={styles.featuredLabel}>
            {copyField(step.id, 'featuredLabel')}
          </p>
          <PressWordmarks items={CLAIMS.press.quiz} labelledBy={featuredId} rowSize={3} />
        </div>
      </div>
      <p className={styles.headline}>
        {personalize(copyField(step.id, 'headline') ?? '', answers)}
      </p>
      <p className={styles.body}>{personalize(copyField(step.id, 'body') ?? '', answers)}</p>
    </InterColumn>
  )
}
