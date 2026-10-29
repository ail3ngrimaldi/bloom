'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { cx } from '../cx'
import { useRadioGroup } from '../RadioGroup'
import styles from './OptionCard.module.css'

export interface OptionCardProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'role' | 'value' | 'children'
> {
  /** Identifies the option inside a RadioGroup. */
  value: string
  label: ReactNode
  /** Decorative slot shown before the label. Empty in the reference (D5). */
  icon?: ReactNode
  /** Overrides the selection the enclosing RadioGroup reports. */
  selected?: boolean
}

/**
 * 333 x 72 white card with the label at the bottom left (see --option-label-align).
 * States: rest, hover, pressed, selected. For QA, `data-state="hover" | "pressed"` forces the
 * visual state without a pointer.
 */
export const OptionCard = forwardRef<HTMLButtonElement, OptionCardProps>(function OptionCard(
  { value, label, icon, selected, className, onClick, type = 'button', ...rest },
  ref,
) {
  const group = useRadioGroup()
  const checked = selected ?? (group ? group.value === value : false)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) group?.select(value)
  }

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      role="radio"
      aria-checked={checked}
      className={cx(styles.option, className)}
      onClick={handleClick}
    >
      {icon !== undefined && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </button>
  )
})
