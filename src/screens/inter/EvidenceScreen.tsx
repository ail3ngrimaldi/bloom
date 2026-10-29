'use client'

import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { cx } from '@/ui/cx'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

const PRACTICES = ['habits', 'cbt', 'mindfulness'] as const

/**
 * #30 evidence (PLAN 5.6). The reference shows three university logos; without an agreement
 * (claims.ts, 'universities') the same three white cards name the practices the plan uses.
 */
export function EvidenceScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={cx(styles.darkTitle, styles.evidenceTitle)}>
        {personalize(text.title, answers)}
      </h1>
      {text.subtitle && <p className={styles.subtitle}>{text.subtitle}</p>}
      <div className={styles.grow}>
        <ul className={styles.cards}>
          {PRACTICES.map((practice) => (
            <li key={practice} className={styles.practice}>
              <span className={styles.practiceName}>
                {copyField(step.id, `practices.${practice}`)}
              </span>
              <span className={styles.practiceCaption}>
                {copyField(step.id, 'practiceCaption')}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.body}>{personalize(copyField(step.id, 'body') ?? '', answers)}</p>
    </InterColumn>
  )
}
