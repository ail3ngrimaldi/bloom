'use client'

import { claimsProven } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { cx } from '@/ui/cx'
import { MindDiagram } from '../art'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './inter.module.css'

/**
 * #31 (PLAN 5.6). "Reviewed by an expert" and the reviewer card need a real, consenting reviewer
 * (claims.ts, 'expert'); until then the title describes the approach and the card is left out.
 */
export function ExpertScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const claim = claimsProven(['expert'])
  const title = copyField(step.id, claim ? 'titleClaim' : 'title') ?? ''
  const emphasis = copyField(step.id, claim ? 'emphasisClaim' : 'emphasis') ?? ''
  const [before, after = ''] = title.split('{{emphasis}}')
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
          <span className={styles.emphasis}>{emphasis}</span>
          {personalize(after, answers)}
        </h1>
        <p className={styles.quote}>{personalize(copyField(step.id, 'quote') ?? '', answers)}</p>
      </div>
    </InterColumn>
  )
}
