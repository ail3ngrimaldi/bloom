'use client'

import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { copy, copyField } from '@/funnel/copy'
import { useCheckoutProvider, useFunnelState } from '@/funnel/FunnelProvider'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { formatMoney } from '@/pricing/plans'
import type { Plan } from '@/pricing/types'
import type { CheckoutResult, PaymentMethod } from '@/services/checkout/types'
import { isValidEmail } from '@/services/lead/validate'
import { Modal } from '@/ui'
import { cx } from '@/ui/cx'
import { LegalLink, LegalText } from './Legal'
import styles from './CheckoutModal.module.css'

const STRIP = [
  'PayPal',
  'Apple Pay',
  'VISA',
  'Mastercard',
  'Maestro',
  'UnionPay',
  'Discover',
  'AMEX',
]

export interface CheckoutModalProps {
  open: boolean
  plan: Plan
  /** "month" or "3 months", for the legal text. */
  period: string
  onClose: () => void
}

/**
 * Checkout (#42, PLAN 5.11): "Your plan is ready. Let's make it real.", the total of the chosen
 * plan (never another one: the reference showed the trial's total with the month plan chosen),
 * the email from #38, express buttons that appear once the provider has loaded, a card row, the
 * safety pill, the accepted methods and the legal text. The default provider is a mock: paying
 * only says that nothing was charged. A card form is not faked (no payment details are taken).
 */
export function CheckoutModal({ open, plan, period, onClose }: CheckoutModalProps) {
  const titleId = useId()
  const emailId = useId()
  const emailErrorId = useId()
  const cardId = useId()
  const provider = useCheckoutProvider()
  const actions = useFunnelActions()
  const { lead } = useFunnelState()
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState(lead.email)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [busy, setBusy] = useState<PaymentMethod | null>(null)
  const [result, setResult] = useState<CheckoutResult | null>(null)
  const [cardOpen, setCardOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    let live = true
    provider.load().then(() => {
      if (live) setReady(true)
    })
    return () => {
      live = false
    }
  }, [open, provider])

  const pay = async (method: Exclude<PaymentMethod, 'card'>) => {
    if (busy) return
    actions.track({ name: 'payment_method_click', method })
    if (!isValidEmail(email)) {
      setEmailInvalid(true)
      document.getElementById(emailId)?.focus()
      return
    }
    actions.setLead({ email: email.trim() })
    setBusy(method)
    setResult(null)
    const outcome = await provider.pay(method, { planId: plan.id, email: email.trim() })
    setBusy(null)
    setResult(outcome)
    if (outcome.status === 'success') actions.track({ name: 'purchase_success' })
  }

  const onEmailSubmit = (event: FormEvent) => event.preventDefault()

  return (
    <Modal open={open} onClose={onClose} size="checkout" labelledBy={titleId}>
      <div className={styles.content}>
        <button
          type="button"
          className={styles.close}
          aria-label={copyField('checkout', 'close')}
          onClick={onClose}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        </button>

        <h2 id={titleId} className={styles.title}>
          <span className={styles.emphasis}>{copyField('checkout', 'titleEmphasis')}</span>{' '}
          {copyField('checkout', 'titleRest')}
        </h2>
        <p className={styles.subtitle}>{copyField('checkout', 'subtitle')}</p>

        <div className={styles.total} data-testid="checkout-total">
          <span>{copyField('checkout', 'total')}</span>
          <span>
            {plan.discounted && <s className={styles.struck}>{formatMoney(plan.originalPrice)}</s>}{' '}
            <strong>{formatMoney(plan.price)}</strong>
          </span>
        </div>

        <form className={styles.emailField} onSubmit={onEmailSubmit} noValidate>
          <label className={styles.emailLabel} htmlFor={emailId}>
            {copyField('checkout', 'emailLabel')}
          </label>
          <input
            id={emailId}
            className={styles.email}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? emailErrorId : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              if (emailInvalid) setEmailInvalid(!isValidEmail(event.target.value))
            }}
          />
          {emailInvalid && (
            <span id={emailErrorId} className={styles.error} role="alert">
              {copyField('checkout', 'emailError')}
            </span>
          )}
        </form>

        <div className={styles.methods} aria-busy={!ready || undefined}>
          {ready ? (
            <>
              <button
                type="button"
                className={cx(styles.method, styles.paypal)}
                aria-label={copyField('checkout', 'paypal')}
                disabled={busy !== null}
                onClick={() => pay('paypal')}
              >
                <span className={styles.paypalMark} aria-hidden="true">
                  <span>Pay</span>
                  <span>Pal</span>
                </span>
              </button>
              <button
                type="button"
                className={cx(styles.method, styles.gpay)}
                aria-label={copyField('checkout', 'googlePay')}
                disabled={busy !== null}
                onClick={() => pay('google_pay')}
              >
                <span className={styles.gpayMark} aria-hidden="true">
                  <span className={styles.g}>G</span> Pay
                </span>
              </button>
            </>
          ) : (
            <>
              <span className={cx(styles.method, styles.paypalLoading)} aria-hidden="true">
                <span className={styles.paypalMark}>
                  <span>Pay</span>
                  <span>Pal</span>
                </span>
              </span>
              <span className={styles.spinnerSlot}>
                <span className={styles.spinner} />
                <span className={styles.srOnly}>{copyField('checkout', 'loadingMethods')}</span>
              </span>
            </>
          )}

          <div className={styles.cardBlock}>
            <button
              type="button"
              className={cx(styles.method, styles.card)}
              aria-expanded={cardOpen}
              aria-controls={cardId}
              onClick={() => {
                setCardOpen((value) => !value)
                if (!cardOpen) actions.track({ name: 'payment_method_click', method: 'card' })
              }}
            >
              <span>{copyField('checkout', 'card')}</span>
              <span className={styles.brands} aria-label={copyField('checkout', 'cardBrands')}>
                <span className={styles.visa}>VISA</span>
                <span className={styles.amex}>AMEX</span>
                <span className={styles.mc} aria-hidden="true">
                  <span />
                  <span />
                </span>
              </span>
            </button>
            <p id={cardId} className={styles.cardNote} hidden={!cardOpen}>
              {copyField('checkout', 'cardUnavailable')}
            </p>
          </div>
        </div>

        <p className={styles.status} role="status">
          {busy
            ? copyField('checkout', 'processing')
            : result?.status === 'demo'
              ? copyField('checkout', 'demoResult')
              : ''}
        </p>

        <p className={styles.safe}>
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M10 2.5 3.5 5v4.6c0 4 2.8 7 6.5 8 3.7-1 6.5-4 6.5-8V5L10 2.5Z" />
          </svg>
          {copyField('checkout', 'safe')}
        </p>

        <ul className={styles.strip} aria-label={copyField('checkout', 'methodsLabel')}>
          {STRIP.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>

        <LegalText
          className={styles.legal}
          template={copyField('checkout', 'legal') ?? ''}
          values={{
            price: <strong>{formatMoney(plan.price)}</strong>,
            renewal: <strong>{formatMoney(plan.originalPrice)}</strong>,
            period,
            policy: (
              <LegalLink href="/legal/subscription">{copy.common.subscriptionPolicy}</LegalLink>
            ),
          }}
        />
      </div>
    </Modal>
  )
}
