'use client'

import { CLAIMS } from '@/funnel/claims'
import { copyField, interpolate, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { evidenceOutcomes } from '@/profile/evidence'
import { cx } from '@/ui/cx'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/**
 * #30 evidence (PLAN 5.6, PLAN-B 3.4): the three universities (claim C3) and a closing phrase that
 * depends on the bubbles released in the wand (PLAN-B 6.4).
 */
export function EvidenceScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const outcome = evidenceOutcomes(answers)
    .map((id) => copyField(step.id, `outcomes.${id}`) ?? '')
    .join(' and ')
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <h1 className={cx(styles.darkTitle, styles.evidenceTitle)}>
        {personalize(text.title, answers)}
      </h1>
      {text.subtitle && <p className={styles.subtitle}>{text.subtitle}</p>}
      <div className={styles.grow}>
        <ul className={styles.cards}>
          {CLAIMS.universities.map((university) => (
            <li key={university.name} className={styles.university}>
              <span className={styles.universityName}>{university.name}</span>
              <span className={styles.universityCaption}>{university.caption}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.body}>
        {personalize(interpolate(copyField(step.id, 'body') ?? '', { outcome }), answers)}
      </p>
    </InterColumn>
  )
}
