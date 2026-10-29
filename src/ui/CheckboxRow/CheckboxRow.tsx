'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { cx } from '../cx'
import styles from './CheckboxRow.module.css'

export interface CheckboxRowProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'role' | 'value' | 'children'
> {
  label: ReactNode
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Multi-select row, 325 x 56 (grows for two-line labels) with a 24px box. Space toggles, like a
 * native checkbox; Enter is left alone so it can still submit or advance the question.
 * `data-state="pressed"` forces the pressed look for QA.
 */
export const CheckboxRow = forwardRef<HTMLButtonElement, CheckboxRowProps>(function CheckboxRow(
  { label, checked, onCheckedChange, className, onClick, onKeyDown, type = 'button', ...rest },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) onCheckedChange?.(!checked)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    // A button would click on Enter; a checkbox does not.
    if (event.key === 'Enter') event.preventDefault()
  }

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      role="checkbox"
      aria-checked={checked}
      className={cx(styles.row, className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.box} aria-hidden="true">
        <svg className={styles.check} viewBox="0 0 14 14" focusable="false">
          <path d="M2.5 7.4 5.7 10.4 11.5 3.8" />
        </svg>
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  )
})
