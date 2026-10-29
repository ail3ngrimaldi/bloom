'use client'

import type { CSSProperties, ReactNode } from 'react'
import { copy } from '@/funnel/copy'
import { Button } from '@/ui'
import { cx } from '@/ui/cx'
import { useDelayedFlag } from '../useDelayedFlag'
import styles from './inter.module.css'

export interface InterColumnProps {
  children: ReactNode
  onNext: () => void
  /** The CTA is disabled this long after the screen mounts (PLAN 4.4, about 0.5 s). */
  ctaEnableDelayMs: number
  ctaLabel?: string
  /** Extra class and inline style for the CTA row (entrance animations). */
  ctaClassName?: string
  ctaStyle?: CSSProperties
  className?: string
}

/**
 * Shared frame of the interstitials (PLAN 5.6): a 325px column with no card, the content on top
 * and the CTA anchored at the bottom, at the same place as on the quiz card.
 */
export function InterColumn({
  children,
  onNext,
  ctaEnableDelayMs,
  ctaLabel = copy.common.continue,
  ctaClassName,
  ctaStyle,
  className,
}: InterColumnProps) {
  const ready = useDelayedFlag(ctaEnableDelayMs)
  return (
    <div className={cx(styles.column, className)}>
      <div className={styles.content}>{children}</div>
      <div className={cx(styles.footer, ctaClassName)} style={ctaStyle}>
        <Button size="interstitial" disabled={!ready} onClick={onNext}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
