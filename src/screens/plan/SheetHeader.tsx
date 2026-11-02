'use client'

import { copyField, interpolate } from '@/funnel/copy'
import { COUNTDOWN_SECONDS } from '@/funnel/flags'
import { formatClock } from '../paywall'
import { usePlan } from './context'
import styles from './SheetHeader.module.css'

/**
 * The lavender header of the sheet (b-10, items 2 to 5): the countdown chip, its sentence and, once
 * the header has scrolled away, a thin progress line that stays pinned to the top. All of the
 * countdown is behind `paywall.countdown.enabled` and starts when the discount is granted; with
 * the flag off, or before the gift, the header just says the plan is ready (guardrail 5).
 */
export function SheetHeader() {
  const { discount, countdownEnabled, remaining, discountEnded } = usePlan()
  const counting = countdownEnabled && discount !== null && remaining !== null && remaining > 0

  const label = counting
    ? copyField('plan', 'header.reserved')
    : discountEnded
      ? copyField('plan', 'header.expired')
      : copyField('plan', 'header.ready')

  // A screen reader hears the time left once a minute, not every second: the text of this live
  // region only changes when the minute does.
  const minutes = remaining === null ? null : Math.ceil(remaining / 60)
  const announced =
    counting && minutes !== null
      ? interpolate(copyField('plan', 'header.timerAnnouncement') ?? '', {
          minutes: String(minutes),
        })
      : ''

  return (
    <>
      <header className={styles.header}>
        {counting && remaining !== null && (
          <span
            className={styles.timer}
            role="timer"
            aria-label={copyField('plan', 'header.timerLabel')}
            aria-live="off"
            data-testid="sheet-timer"
          >
            {formatClock(remaining)}
          </span>
        )}
        <p className={styles.label}>{label}</p>
        <span className={styles.srOnly} role="status" aria-live="polite">
          {announced}
        </span>
      </header>
      {counting && remaining !== null && (
        <div className={styles.line} aria-hidden="true">
          <span
            className={styles.fill}
            style={{ width: `${(1 - remaining / COUNTDOWN_SECONDS) * 100}%` }}
          />
        </div>
      )}
    </>
  )
}
