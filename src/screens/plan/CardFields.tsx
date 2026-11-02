'use client'

import { useId, useState } from 'react'
import type { ChangeEvent } from 'react'
import { copyField } from '@/funnel/copy'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import {
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from '@/services/checkout/card'
import { cx } from '@/ui/cx'
import { CardIcon, HelpIcon } from './icons'
import styles from './CardFields.module.css'

export interface CardFieldsProps {
  /** Reports whether the three fields hold a complete, plausible card. Never the values. */
  onValidChange: (valid: boolean) => void
}

type FieldName = 'number' | 'expiry' | 'cvv'

/**
 * The card fields of the payment block (b-12, items 7 and 8): number, MM / YY and CVV. In a real
 * integration the provider hosts these fields and the app never sees them; this mock keeps what is
 * typed in this component's memory only, tells its parent just whether the card looks complete, and
 * drops it when the sheet closes. Nothing is stored, logged or sent.
 */
export function CardFields({ onValidChange }: CardFieldsProps) {
  const actions = useFunnelActions()
  const numberId = useId()
  const expiryId = useId()
  const cvvId = useId()
  const cvvHelpId = useId()
  const [values, setValues] = useState<Record<FieldName, string>>({
    number: '',
    expiry: '',
    cvv: '',
  })
  const [touched, setTouched] = useState<Record<FieldName, boolean>>({
    number: false,
    expiry: false,
    cvv: false,
  })
  const [focused, setFocused] = useState<Record<FieldName, boolean>>({
    number: false,
    expiry: false,
    cvv: false,
  })

  const valid = (next: Record<FieldName, string>) =>
    isValidCardNumber(next.number) && isValidExpiry(next.expiry) && isValidCvv(next.cvv)

  const change =
    (field: FieldName, format: (raw: string) => string) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [field]: format(event.target.value) }
      setValues(next)
      onValidChange(valid(next))
    }

  const focus = (field: FieldName) => () => {
    // One event per field, never the value: only that the visitor started on the card.
    if (!focused[field]) {
      setFocused((previous) => ({ ...previous, [field]: true }))
      actions.track({ name: 'card_field_focus', field })
    }
  }
  const blur = (field: FieldName) => () =>
    setTouched((previous) => ({ ...previous, [field]: true }))

  const numberBad = touched.number && !isValidCardNumber(values.number)
  const expiryBad = touched.expiry && !isValidExpiry(values.expiry)
  const cvvBad = touched.cvv && !isValidCvv(values.cvv)

  return (
    <div className={styles.fields}>
      <div className={cx(styles.field, numberBad && styles.bad)}>
        <label htmlFor={numberId} className={styles.srOnly}>
          {copyField('plan', 'payment.cardNumber')}
        </label>
        <input
          id={numberId}
          className={styles.input}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder={copyField('plan', 'payment.cardNumber')}
          value={values.number}
          aria-invalid={numberBad || undefined}
          aria-describedby={numberBad ? `${numberId}-error` : undefined}
          onChange={change('number', formatCardNumber)}
          onFocus={focus('number')}
          onBlur={blur('number')}
        />
        <CardIcon className={styles.icon} />
      </div>
      {numberBad && (
        <p id={`${numberId}-error`} className={styles.error} role="alert">
          {copyField('plan', 'payment.cardNumberError')}
        </p>
      )}

      <div className={styles.pair}>
        <div className={cx(styles.field, expiryBad && styles.bad)}>
          <label htmlFor={expiryId} className={styles.srOnly}>
            {copyField('plan', 'payment.expiry')}
          </label>
          <input
            id={expiryId}
            className={styles.input}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder={copyField('plan', 'payment.expiry')}
            value={values.expiry}
            aria-invalid={expiryBad || undefined}
            aria-describedby={expiryBad ? `${expiryId}-error` : undefined}
            onChange={change('expiry', formatExpiry)}
            onFocus={focus('expiry')}
            onBlur={blur('expiry')}
          />
        </div>
        <div className={cx(styles.field, cvvBad && styles.bad)}>
          <label htmlFor={cvvId} className={styles.srOnly}>
            {copyField('plan', 'payment.cvv')}
          </label>
          <input
            id={cvvId}
            className={styles.input}
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            placeholder={copyField('plan', 'payment.cvv')}
            value={values.cvv}
            aria-invalid={cvvBad || undefined}
            aria-describedby={`${cvvHelpId}${cvvBad ? ` ${cvvId}-error` : ''}`}
            onChange={change('cvv', (raw) => raw.replace(/\D/g, '').slice(0, 4))}
            onFocus={focus('cvv')}
            onBlur={blur('cvv')}
          />
          <HelpIcon className={styles.help} />
          <span id={cvvHelpId} className={styles.srOnly}>
            {copyField('plan', 'payment.cvvHelp')}
          </span>
        </div>
      </div>
      {expiryBad && (
        <p id={`${expiryId}-error`} className={styles.error} role="alert">
          {copyField('plan', 'payment.expiryError')}
        </p>
      )}
      {cvvBad && (
        <p id={`${cvvId}-error`} className={styles.error} role="alert">
          {copyField('plan', 'payment.cvvError')}
        </p>
      )}
    </div>
  )
}
