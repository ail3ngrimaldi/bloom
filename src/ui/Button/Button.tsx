import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { cx } from '../cx'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'disabled' | 'loading' | 'white'
export type ButtonSize = 'quiz' | 'interstitial'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Visual variant. 'disabled' and 'loading' can also be requested with the boolean props. */
  variant?: ButtonVariant
  /** 'quiz' is 325 x 52; 'interstitial' is about 50 tall. The white variant is always 40 tall. */
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  loadingLabel?: string
  /** Trailing arrow that stretches on hover, focus and press. Defaults to on for primary. */
  arrow?: boolean
}

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      <span className={styles.arrowLine} />
      <span className={styles.arrowHead} />
    </span>
  )
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'quiz',
    disabled = false,
    loading = false,
    loadingLabel = 'Please wait...',
    arrow,
    type = 'button',
    className,
    children,
    onClick,
    ...rest
  },
  ref,
) {
  const isLoading = loading || variant === 'loading'
  const isDisabled = !isLoading && (disabled || variant === 'disabled')
  const isWhite = variant === 'white'
  const showArrow = !isLoading && (arrow ?? !isWhite)

  // A loading button stays focusable (focus must not vanish mid-submit) but ignores activation.
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      className={cx(
        styles.button,
        isWhite ? styles.white : styles.primary,
        size === 'interstitial' && !isWhite && styles.interstitial,
        isLoading && styles.loading,
        isDisabled && styles.disabled,
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled || isLoading ? true : undefined}
      aria-busy={isLoading ? true : undefined}
      onClick={handleClick}
    >
      <span className={styles.label}>{isLoading ? loadingLabel : children}</span>
      {showArrow && <Arrow />}
    </button>
  )
})
