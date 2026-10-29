'use client'

import { useState } from 'react'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { prefersReducedMotion } from '@/ui'
import { cx } from '@/ui/cx'
import { BrandOrb, CheckBadge, YouBubble } from '../art'
import motion from '../motion.module.css'
import { revealStyle } from '../revealStyle'
import type { ScreenProps } from '../types'
import { InterColumn } from './InterColumn'
import styles from './MatchScreen.module.css'

/**
 * Timeline of anim-05 (ms after the screen mounts): the circles slide together for about 1 s,
 * then the check and the headline, then the glow, the subtext and the CTA, which enables
 * ctaEnableDelayMs after it shows.
 */
export const MATCH_TIMELINE = { merge: 300, mergeMs: 1000, check: 1300, rest: 1800 } as const

const TITLE = revealStyle(MATCH_TIMELINE.check - 100, 700)
const REST = revealStyle(MATCH_TIMELINE.rest, 500)

/** #25 "It's a match." (PLAN 5.6): "You" and Bloom's orb merge into a Venn with a green check. */
export function MatchScreen({ step, onNext }: ScreenProps<'inter'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const [reduced] = useState(prefersReducedMotion)
  const body = personalize(copyField(step.id, 'body') ?? '', answers).split('\n')
  return (
    <InterColumn
      onNext={onNext}
      ctaEnableDelayMs={(reduced ? 0 : MATCH_TIMELINE.rest) + step.ctaEnableDelayMs}
      ctaLabel={text.cta}
      ctaClassName={motion.reveal}
      ctaStyle={REST}
    >
      <div className={styles.group}>
        <div className={styles.art}>
          <span className={cx(styles.glow, motion.reveal)} style={REST} aria-hidden="true" />
          <YouBubble className={styles.left} label={copyField(step.id, 'you') ?? 'You'} />
          <BrandOrb className={styles.right} />
          <CheckBadge className={styles.badge} />
        </div>
        <h1 className={cx(styles.title, motion.reveal)} style={TITLE}>
          {text.title}
        </h1>
        <p className={cx(styles.body, motion.reveal)} style={REST}>
          {body.map((line) => (
            <span key={line} className={styles.line}>
              {line}
            </span>
          ))}
        </p>
      </div>
    </InterColumn>
  )
}
