'use client'

import { copyField } from '@/funnel/copy'
import styles from './StickyBar.module.css'

export interface StickyBarProps {
  /** "14 Day Trial - $2.00": the amount comes from the quote, like every other place it appears. */
  label: string
  disabled: boolean
  onStart: () => void
}

/**
 * The bar fixed to the bottom of the sheet during the whole scroll (b-10 item 9, Appendix B item
 * 13): the trial and its price on the left, "Start Now" on the right, which takes the visitor back
 * to the payment block.
 */
export function StickyBar({ label, disabled, onStart }: StickyBarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.text}>
        <p className={styles.label} data-testid="sticky-label">
          {label}
        </p>
        <p className={styles.sub}>{copyField('plan', 'sticky.sub')}</p>
      </div>
      <button type="button" className={styles.start} disabled={disabled} onClick={onStart}>
        {copyField('plan', 'sticky.cta')}
      </button>
    </div>
  )
}
