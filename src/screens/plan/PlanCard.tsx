'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { copy, copyField, interpolate } from '@/funnel/copy'
import { DEMO_PRICES } from '@/funnel/flags'
import { formatMoney } from '@/pricing/plans'
import { usePlan } from './context'
import { BellIcon, CheckIcon, DottedCircleIcon, SendIcon } from './icons'
import styles from './PlanCard.module.css'

function Milestone({
  icon,
  tone,
  children,
}: {
  icon: ReactNode
  tone: 'check' | 'send' | 'bell' | 'dotted'
  children: ReactNode
}) {
  return (
    <li className={styles.milestone}>
      <span className={`${styles.icon} ${styles[tone]}`}>{icon}</span>
      <div className={styles.milestoneBody}>{children}</div>
    </li>
  )
}

/**
 * The plan card (b-11 items 4 to 8): the "pct% OFF YOUR PLAN" banner (only while the discount is in
 * force), the title and a four-step timeline: the trial and what it costs today, the promise, the
 * reminder two days before the trial ends and the price after it. The struck per-day price comes
 * from the list price (a real previous price) and appears only with a discount; the figures and the
 * date come from the quote, so they match the payment block and the legal text (guardrail 4).
 */
export function PlanCard() {
  const { quote, discount } = usePlan()
  const titleId = useId()
  const vars = {
    trialDays: quote.trialDays,
    brand: copy.brand,
    day: quote.reminderDay,
    pct: quote.discountPct,
  }
  const money = (value: number) => formatMoney(value)
  const f = (path: string, extra: Record<string, string | number> = {}) =>
    interpolate(copyField('plan', path) ?? '', { ...vars, ...extra })

  return (
    <section className={styles.wrap} aria-labelledby={titleId}>
      {discount && (
        <p className={styles.banner} data-testid="discount-banner">
          {f('coupon.banner')}
        </p>
      )}
      <div className={styles.card}>
        <h2 id={titleId} className={styles.title}>
          {f('planCard.title')}
        </h2>
        <ol className={styles.timeline}>
          <Milestone tone="check" icon={<CheckIcon />}>
            <p className={styles.row}>
              <span className={styles.milestoneTitle}>{f('planCard.trial')}</span>
              <span className={styles.amount} data-testid="plan-trial-amount">
                {money(quote.trialAmount)}
              </span>
            </p>
            <p className={styles.text}>{f('planCard.trialBody')}</p>
          </Milestone>
          <Milestone tone="send" icon={<SendIcon />}>
            <p className={styles.milestoneTitle}>{f('planCard.unlock')}</p>
            <p className={styles.text}>{f('planCard.unlockBody')}</p>
          </Milestone>
          <Milestone tone="bell" icon={<BellIcon />}>
            <p className={styles.milestoneTitle}>{f('planCard.day')}</p>
            <p className={styles.text}>{f('planCard.dayBody')}</p>
          </Milestone>
          <Milestone tone="dotted" icon={<DottedCircleIcon />}>
            <div className={styles.row}>
              <div className={styles.afterLeft}>
                <span className={styles.milestoneTitle}>{f('planCard.afterTrial')}</span>
                {quote.perDayStruck !== null && (
                  <span className={styles.save}>{f('planCard.save')}</span>
                )}
              </div>
              <p className={styles.perDay} data-testid="plan-per-day">
                {quote.perDayStruck !== null && (
                  <>
                    <s className={styles.struck} aria-hidden="true">
                      {f('planCard.perDay', { price: money(quote.perDayStruck) })}
                    </s>
                    <span className={styles.srOnly}>
                      {f('planCard.perDayStruckLabel', { price: money(quote.perDayStruck) })}
                    </span>{' '}
                  </>
                )}
                <strong className={styles.perDayNow}>
                  {f('planCard.perDay', { price: money(quote.perDay) })}
                </strong>
              </p>
            </div>
            <p className={styles.billed} data-testid="plan-billed">
              {f('planCard.billed', { price: money(quote.renewalPrice) })}
            </p>
          </Milestone>
        </ol>
        {DEMO_PRICES && <p className={styles.demo}>{f('planCard.demoNotice')}</p>}
      </div>
    </section>
  )
}
