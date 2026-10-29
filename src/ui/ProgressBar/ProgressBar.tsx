import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import { clampProgress } from './clampProgress'
import styles from './ProgressBar.module.css'

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Completed fraction, 0 to 1 (clamped). */
  value: number
  /** Accessible name; the bar has no visible label. */
  label?: string
}

/** 333 x 3 bar with a white track and a lilac fill. The ARIA value is a 0 to 100 percentage. */
export function ProgressBar({ value, label = 'Progress', className, ...rest }: ProgressBarProps) {
  const fraction = clampProgress(value)
  const percent = Math.round(fraction * 100)
  return (
    <div
      {...rest}
      className={cx(styles.track, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${fraction * 100}%` }} />
    </div>
  )
}
