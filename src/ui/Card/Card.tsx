import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import styles from './Card.module.css'

export type CardProps = HTMLAttributes<HTMLDivElement>

/**
 * The quiz column: 375 wide, as tall as the viewport minus its margins, never animated (only the
 * content inside it is, see StepTransition). Below 480px it becomes full-bleed.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, ...rest },
  ref,
) {
  return <div {...rest} ref={ref} className={cx(styles.card, className)} />
})
