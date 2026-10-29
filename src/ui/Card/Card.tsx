import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 'card' (default) is the quiz card. 'bare' keeps the element but drops the card look: full
   * width, at least the viewport tall, transparent, growing with its content.
   */
  variant?: 'card' | 'bare'
}

/**
 * The quiz column: 375 wide, as tall as the viewport minus its margins, never animated (only the
 * content inside it is, see StepTransition). Below 480px it becomes full-bleed.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'card', className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx(styles.card, variant === 'bare' && styles.bare, className)}
      data-variant={variant}
    />
  )
})
