'use client'

import { Fragment } from 'react'
import { copyField, interpolate } from '@/funnel/copy'
import { formatClock } from '../paywall'
import { usePlan } from './context'
import { PercentSealIcon } from './icons'
import styles from './CouponSection.module.css'

/** Bolds "70% Discount" inside "Your 70% Discount Promo Code Is Applied!". */
function withEmphasis(sentence: string) {
  return sentence.split(/(\d+% Discount)/).map((part, index) =>
    /^\d+% Discount$/.test(part) ? (
      <strong key={index} className={styles.strong}>
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

/**
 * The promo-code ticket (b-11 items 2 and 3): a seal, "Your 70% Discount Promo Code Is Applied!",
 * the code (it carries the month: off_70_october) and, behind the countdown flag, a chip with the
 * same time as the header. It only exists while the discount does: before the gift is applied, and
 * after the discount ends, there is no coupon (guardrail 4).
 */
export function CouponSection() {
  const { discount, countdownEnabled, remaining } = usePlan()
  if (!discount) return null
  const counting = countdownEnabled && remaining !== null && remaining > 0
  const sentence = interpolate(copyField('plan', 'coupon.applied') ?? '', { pct: discount.pct })
  return (
    <section className={styles.ticket} aria-label={copyField('plan', 'coupon.codeLabel')}>
      <div className={styles.head}>
        <span className={styles.seal}>
          <PercentSealIcon />
        </span>
        <p className={styles.sentence}>{withEmphasis(sentence)}</p>
      </div>
      <div className={styles.codeRow}>
        <p className={styles.code} data-testid="promo-code">
          {discount.code}
        </p>
        {counting && (
          <span className={styles.timer} aria-hidden="true">
            {formatClock(remaining)}
          </span>
        )}
      </div>
    </section>
  )
}
