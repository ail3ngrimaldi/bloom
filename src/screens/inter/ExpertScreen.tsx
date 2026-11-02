'use client'

import { CLAIMS } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { cx } from '@/ui/cx'
import { CheckBadge, MindDiagram } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/**
 * #31 (PLAN 5.6, PLAN-B 3.4): "Your plan will be reviewed by an expert" and the reviewer's card
 * (claim C4). The reviewer's photo is not reproduced: the card shows the verified badge only.
 */
export function ExpertScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const [before, after = ''] = (copyField(step.id, 'title') ?? '').split('{{emphasis}}')
  const reviewer = CLAIMS.expert.quiz
  return (
    <InterColumn onNext={onNext} ctaEnableDelayMs={step.ctaEnableDelayMs} ctaLabel={text.cta}>
      <div className={styles.expertGroup}>
        <div className={styles.diagram}>
          <MindDiagram
            labels={{
              thoughts: copyField(step.id, 'chips.thoughts') ?? '',
              feelings: copyField(step.id, 'chips.feelings') ?? '',
              behavior: copyField(step.id, 'chips.behavior') ?? '',
            }}
          />
        </div>
        <h1 className={cx(styles.darkTitle)}>
          {personalize(before, answers)}
          <span className={styles.emphasis}>{copyField(step.id, 'emphasis')}</span>
          {personalize(after, answers)}
        </h1>
        <p className={styles.quote}>{personalize(copyField(step.id, 'quote') ?? '', answers)}</p>
        <div className={styles.reviewer}>
          <p className={styles.reviewerLabel}>{copyField(step.id, 'reviewerLabel')}</p>
          <div className={styles.reviewerRow}>
            <CheckBadge className={styles.reviewerBadge} />
            <div className={styles.reviewerText}>
              <p className={styles.reviewerName}>{reviewer.name}</p>
              <p className={styles.reviewerRole}>{reviewer.role}</p>
            </div>
          </div>
        </div>
      </div>
    </InterColumn>
  )
}
