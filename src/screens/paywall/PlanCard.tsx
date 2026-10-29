'use client'

import type { MouseEvent } from 'react'
import { copyField, interpolate } from '@/funnel/copy'
import { formatMoney, splitMoney } from '@/pricing/plans'
import type { Plan } from '@/pricing/types'
import { useRadioGroup } from '@/ui'
import { cx } from '@/ui/cx'
import styles from './PlanCard.module.css'

/**
 * One plan of the paywall (PLAN 5.10 items 5 to 9): title, optional SAVE badge, struck original
 * and discounted price on the left; struck original per-day price and the big per-day price on
 * the right; the most popular plan wears a ribbon. A radio inside the plans RadioGroup.
 */
export function PlanCard({ plan }: { plan: Plan }) {
  const group = useRadioGroup()
  const checked = group?.value === plan.id
  const title = copyField('paywall', `plans.${plan.id}`) ?? plan.id
  const perDay = splitMoney(plan.perDay)
  const label = [
    title,
    plan.discounted
      ? interpolate(copyField('paywall', 'priceLabel') ?? '', {
          price: formatMoney(plan.price),
          original: formatMoney(plan.originalPrice),
        })
      : formatMoney(plan.price),
    interpolate(copyField('paywall', 'perDayLabel') ?? '', {
      price: formatMoney(plan.perDay),
      original: formatMoney(plan.perDayOriginal),
    }),
  ].join(', ')

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!event.defaultPrevented) group?.select(plan.id)
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      className={cx(styles.card, checked && styles.selected, plan.mostPopular && styles.popular)}
      onClick={onClick}
    >
      {plan.mostPopular && (
        <span className={styles.ribbon} aria-hidden="true">
          {copyField('paywall', 'mostPopular')}
        </span>
      )}
      <span className={styles.body} aria-hidden="true">
        <span className={styles.left}>
          <span className={styles.title}>{title}</span>
          {plan.showSavings && plan.discounted && (
            <span className={styles.badge}>
              {interpolate(copyField('paywall', 'save') ?? '', { percent: plan.savingsPercent })}
            </span>
          )}
          <span className={styles.prices}>
            {plan.discounted && <s className={styles.struck}>{formatMoney(plan.originalPrice)}</s>}
            <span className={styles.price}>{formatMoney(plan.price)}</span>
          </span>
        </span>
        <span className={styles.right}>
          <span className={styles.perDayLabel}>{copyField('paywall', 'perDay')}</span>
          <span className={styles.perDay}>
            {plan.discounted && (
              <s className={styles.struckRed}>{formatMoney(plan.perDayOriginal)}</s>
            )}
            <span className={styles.money}>
              <span className={styles.symbol}>{perDay.symbol}</span>
              <span className={styles.whole}>{perDay.whole}</span>
              <span className={styles.fraction}>{perDay.fraction}</span>
            </span>
          </span>
        </span>
      </span>
    </button>
  )
}
