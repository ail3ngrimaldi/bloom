'use client'

import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react'
import { copy, copyField, interpolate, stepCopy } from '@/funnel/copy'
import { COUNTDOWN_SECONDS, DEMO_PRICES, paywallCountdownEnabled } from '@/funnel/flags'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { formatMoney, plansFor, selectedPlan } from '@/pricing/plans'
import type { PlanId } from '@/pricing/types'
import { RadioGroup } from '@/ui'
import type { ScreenProps } from '../types'
import { useDelayedFlag } from '../useDelayedFlag'
import { CheckoutModal } from './CheckoutModal'
import { LegalLink, LegalText } from './Legal'
import { PlanCard } from './PlanCard'
import { formatClock, useCountdown } from './useCountdown'
import styles from './PaywallScreen.module.css'

const noopSubscribe = () => () => {}

/** The CTA shows disabled for a moment when the paywall appears (PLAN 5.10). */
const CTA_DELAY_MS = 500

function TimerRing({ fraction }: { fraction: number }) {
  const circumference = 2 * Math.PI * 15
  return (
    <svg className={styles.ring} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <circle cx="18" cy="18" r="15" className={styles.ringTrack} />
      <circle
        cx="18"
        cy="18"
        r="15"
        className={styles.ringArc}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
      />
    </svg>
  )
}

/**
 * Paywall (#41, PLAN 5.10) and, on top of it, the checkout modal (#42): a sticky header, three
 * plans (1 month by default), a gradient Continue and the legal text built from the chosen plan.
 * The countdown only runs behind its flag (D7); otherwise the header just says the plan is ready.
 * Prices are demo data and are labelled as such.
 */
export function PaywallScreen({ step, onNext }: ScreenProps<'paywall' | 'checkout'>) {
  const { selectedPlanId, paywallStartedAt, lead } = useFunnelState()
  const actions = useFunnelActions()
  const text = stepCopy('paywall')
  const plansId = useId()
  const plansRef = useRef<HTMLDivElement>(null)
  const pushedCheckout = useRef(false)
  const ctaReady = useDelayedFlag(CTA_DELAY_MS)
  const checkoutOpen = step.type === 'checkout'

  const countdown = useSyncExternalStore(
    noopSubscribe,
    () => paywallCountdownEnabled(window.location.search),
    () => false,
  )
  const remaining = useCountdown(paywallStartedAt, COUNTDOWN_SECONDS, countdown)
  const discounted = !countdown || remaining > 0
  const plans = useMemo(() => plansFor(discounted), [discounted])
  const plan = selectedPlan(plans, selectedPlanId)

  useEffect(() => {
    actions.startPaywall()
    actions.track({ name: 'paywall_view' })
  }, [actions])

  useEffect(() => {
    if (checkoutOpen) actions.track({ name: 'checkout_open' })
  }, [checkoutOpen, actions])

  const scrollToPlans = () => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    plansRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    plansRef.current
      ?.querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus({ preventScroll: true })
  }

  const openCheckout = () => {
    pushedCheckout.current = true
    onNext()
  }

  const closeCheckout = () => {
    // Back to the paywall entry when this visit pushed the checkout; else (a deep link) replace.
    if (pushedCheckout.current) {
      pushedCheckout.current = false
      actions.back()
    } else {
      actions.goTo('paywall', { replace: true })
    }
  }

  const period = copyField('paywall', `periods.${plan.renewal}`) ?? ''
  const headerLabel = countdown
    ? remaining > 0
      ? copyField('paywall', 'countdownLabel')
      : copyField('paywall', 'countdownEnded')
    : lead.name
      ? interpolate(copyField('paywall', 'readyName') ?? '', { name: lead.name })
      : copyField('paywall', 'readyLabel')

  return (
    <div className={styles.page} inert={checkoutOpen || undefined}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.status} role={countdown ? 'timer' : undefined}>
            {countdown ? (
              <TimerRing fraction={remaining / COUNTDOWN_SECONDS} />
            ) : (
              <span className={styles.readyIcon} aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M5 10.4 8.4 13.6 15 6.8" />
                </svg>
              </span>
            )}
            <span className={styles.statusText}>
              <span className={styles.statusLabel}>{headerLabel}</span>
              {countdown && remaining > 0 && (
                <span className={styles.clock}>{formatClock(remaining)}</span>
              )}
            </span>
          </div>
          <button type="button" className={styles.getPlan} onClick={scrollToPlans}>
            {copyField('paywall', 'getPlan')}
          </button>
          <button
            type="button"
            className={styles.close}
            aria-label={copyField('paywall', 'close')}
            onClick={() => actions.back()}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title} id={plansId}>
          {text.title}
        </h1>
        <div ref={plansRef}>
          <RadioGroup
            className={styles.plans}
            aria-labelledby={plansId}
            value={plan.id}
            onValueChange={(id) => actions.selectPlan(id as PlanId)}
          >
            {plans.map((item) => (
              <PlanCard key={item.id} plan={item} />
            ))}
          </RadioGroup>
        </div>

        <button type="button" className={styles.cta} disabled={!ctaReady} onClick={openCheckout}>
          {text.cta}
        </button>

        <LegalText
          className={styles.legal}
          template={copyField('paywall', 'legal') ?? ''}
          values={{
            terms: <LegalLink href="/legal/terms">{copy.common.termsAndConditions}</LegalLink>,
            privacy: <LegalLink href="/legal/privacy">{copy.common.privacyPolicy}</LegalLink>,
            price: <strong>{formatMoney(plan.price)}</strong>,
            renewal: <strong>{formatMoney(plan.originalPrice)}</strong>,
            period,
          }}
        />
        {DEMO_PRICES && <p className={styles.demo}>{copyField('paywall', 'demoNotice')}</p>}
      </main>

      <CheckoutModal open={checkoutOpen} plan={plan} period={period} onClose={closeCheckout} />
    </div>
  )
}
