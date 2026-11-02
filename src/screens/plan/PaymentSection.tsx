'use client'

import { useEffect, useId, useState } from 'react'
import type { Ref } from 'react'
import { copyField, interpolate } from '@/funnel/copy'
import { useCheckoutProvider, useFunnelState } from '@/funnel/FunnelProvider'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { formatLongDate } from '@/pricing/closing'
import { formatMoney } from '@/pricing/plans'
import type { CheckoutResult, PaymentMethod } from '@/services/checkout/types'
import { isValidEmail } from '@/services/lead/validate'
import { cx } from '@/ui/cx'
import { CardFields } from './CardFields'
import { usePlan } from './context'
import { ShieldIcon } from './icons'
import styles from './PaymentSection.module.css'

const STRIP = ['PayPal', 'Apple Pay', 'VISA', 'Mastercard', 'G Pay', 'AMEX']

export interface PaymentSectionProps {
  ref?: Ref<HTMLElement>
  /** The email of step #38, prefilled. */
  email: string
}

/**
 * "Payment Options" (b-12, PLAN-B 4.6): the email, the express buttons (PayPal and Google Pay,
 * which the provider mounts a moment after the sheet), the card fields, the renewal reminder, START
 * MEMBERSHIP (enabled only with a complete card) and, right under it, a summary of the charge:
 * today's amount, what follows, when, how often and how to cancel (guardrail 4). The provider is a
 * mock by default: nothing is charged, and the result says so.
 */
export function PaymentSection({ ref, email: initialEmail }: PaymentSectionProps) {
  const { quote } = usePlan()
  const { reminderOptIn } = useFunnelState()
  const actions = useFunnelActions()
  const provider = useCheckoutProvider()
  const titleId = useId()
  const emailId = useId()
  const emailErrorId = useId()
  const reminderId = useId()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState(initialEmail)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [cardValid, setCardValid] = useState(false)
  const [busy, setBusy] = useState<PaymentMethod | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)

  useEffect(() => {
    let live = true
    provider.load().then(() => {
      if (live) setReady(true)
    })
    return () => {
      live = false
    }
  }, [provider])

  /** The email is checked, and kept in the funnel, before any payment starts. */
  const takeEmail = (): string | null => {
    if (!isValidEmail(email)) {
      setEmailInvalid(true)
      document.getElementById(emailId)?.focus()
      return null
    }
    actions.setLead({ email: email.trim() })
    return email.trim()
  }

  const settle = (outcome: CheckoutResult) => {
    setBusy(null)
    setResult(outcome)
    if (outcome.status === 'success') actions.track({ name: 'purchase_success' })
  }

  const payExpress = async (method: Exclude<PaymentMethod, 'card'>) => {
    if (busy) return
    actions.track({ name: 'payment_method_click', method })
    const address = takeEmail()
    if (address === null) return
    setBusy(method)
    setResult(null)
    settle(await provider.pay(method, { email: address, trialAmount: quote.trialAmount }))
  }

  const startMembership = async () => {
    if (busy) return
    actions.track({ name: 'start_membership_click' })
    actions.track({ name: 'payment_method_click', method: 'card' })
    const address = takeEmail()
    if (address === null) return
    setBusy('card')
    setResult(null)
    settle(await provider.payCard({ email: address, trialAmount: quote.trialAmount }))
  }

  const summary = interpolate(copyField('plan', 'payment.chargeSummary') ?? '', {
    trialPrice: formatMoney(quote.trialAmount),
    renewalPrice: formatMoney(quote.renewalPrice),
    trialEndDate: formatLongDate(quote.trialEndDate),
  })

  return (
    <section ref={ref} className={styles.payment} aria-labelledby={titleId} tabIndex={-1}>
      <h2 id={titleId} className={styles.title}>
        {copyField('plan', 'payment.title')}
      </h2>

      <div className={styles.emailField}>
        <label htmlFor={emailId} className={styles.srOnly}>
          {copyField('plan', 'payment.emailLabel')}
        </label>
        <input
          id={emailId}
          className={cx(styles.email, emailInvalid && styles.emailBad)}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={copyField('plan', 'payment.emailLabel')}
          value={email}
          aria-invalid={emailInvalid || undefined}
          aria-describedby={emailInvalid ? emailErrorId : undefined}
          onChange={(event) => {
            setEmail(event.target.value)
            if (emailInvalid) setEmailInvalid(!isValidEmail(event.target.value))
          }}
        />
        {emailInvalid && (
          <p id={emailErrorId} className={styles.error} role="alert">
            {copyField('plan', 'payment.emailError')}
          </p>
        )}
      </div>

      <div className={styles.express} aria-busy={!ready || undefined}>
        <h3 className={styles.expressTitle}>{copyField('plan', 'payment.expressTitle')}</h3>
        <p className={styles.expressSub}>{copyField('plan', 'payment.expressSub')}</p>
        {ready ? (
          <>
            <button
              type="button"
              className={cx(styles.method, styles.paypal)}
              aria-label={copyField('plan', 'payment.paypal')}
              disabled={busy !== null}
              onClick={() => payExpress('paypal')}
            >
              <span className={styles.paypalMark} aria-hidden="true">
                <span>Pay</span>
                <span>Pal</span>
              </span>
            </button>
            <button
              type="button"
              className={cx(styles.method, styles.gpay)}
              aria-label={copyField('plan', 'payment.googlePay')}
              disabled={busy !== null}
              onClick={() => payExpress('google_pay')}
            >
              <span className={styles.gpayMark} aria-hidden="true">
                <span className={styles.g}>G</span> Pay
              </span>
            </button>
          </>
        ) : (
          <div className={styles.methodsLoading}>
            <span className={styles.spinner} />
            <span className={styles.srOnly}>{copyField('plan', 'payment.loadingMethods')}</span>
          </div>
        )}
      </div>

      <p className={styles.or} aria-hidden="true">
        {copyField('plan', 'payment.or')}
      </p>

      <div className={styles.cardBlock}>
        <div className={styles.cardHeader}>
          <span>{copyField('plan', 'payment.cardHeader')}</span>
          <span className={styles.brands} aria-label={copyField('plan', 'payment.cardBrands')}>
            <span className={styles.visa}>VISA</span>
            <span className={styles.amex}>AMEX</span>
            <span className={styles.mc} aria-hidden="true">
              <span />
              <span />
            </span>
          </span>
        </div>
        <CardFields onValidChange={setCardValid} />

        <div className={styles.reminder}>
          <span className={styles.bell} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 3a6 6 0 0 0-6 6v3.600c0 .7-.3 1.300-.8 1.800L4 15.700c-.6.600-.2 1.700.7 1.700h14.600c.9 0 1.300-1.100.7-1.700l-1.200-1.300a2.500 2.500 0 0 1-.8-1.800V9a6 6 0 0 0-6-6ZM9.500 19a2.500 2.500 0 0 0 5 0Z" />
            </svg>
          </span>
          <label className={styles.reminderRow} htmlFor={reminderId}>
            {/* The real checkbox covers a 44 px target; the box drawn over it is 22 px. */}
            <span className={styles.checkWrap}>
              <input
                id={reminderId}
                type="checkbox"
                className={styles.checkInput}
                checked={reminderOptIn}
                onChange={(event) => actions.setReminder(event.target.checked)}
              />
              <span className={styles.checkBox} aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M4.500 10.500 8.500 14.500 15.500 6" />
                </svg>
              </span>
            </span>
            <span>{copyField('plan', 'payment.reminder')}</span>
          </label>
        </div>

        <button
          type="button"
          className={styles.start}
          disabled={!cardValid || busy !== null}
          onClick={startMembership}
        >
          {busy === 'card'
            ? copyField('plan', 'payment.processing')
            : copyField('plan', 'payment.startMembership')}
        </button>
        <p className={styles.noCommit}>{copyField('plan', 'payment.noCommitments')}</p>
        <p className={styles.charge} data-testid="charge-summary">
          {summary}
        </p>
        <p className={styles.status} role="status">
          {busy
            ? copyField('plan', 'payment.processing')
            : result?.status === 'demo'
              ? copyField('plan', 'payment.demoResult')
              : ''}
        </p>
        <p className={styles.demoCard}>{copyField('plan', 'payment.demoCard')}</p>

        <p className={styles.safe}>
          <ShieldIcon />
          {copyField('plan', 'payment.safe')}
        </p>
        <ul className={styles.strip} aria-label={copyField('plan', 'payment.methodsLabel')}>
          {STRIP.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
