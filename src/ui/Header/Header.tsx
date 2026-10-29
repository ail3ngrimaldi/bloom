import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import { Logo } from '../Logo'
import { ProgressBar } from '../ProgressBar'
import styles from './Header.module.css'

export interface HeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Completed fraction 0 to 1. Leave undefined to show the logo alone. */
  progress?: number
  /** Product name for the wordmark. */
  brandName?: string
}

/** Centred logo (offset +42, 26 tall) over a progress bar (offset +75, 3 tall). */
export function Header({ progress, brandName, className, ...rest }: HeaderProps) {
  return (
    <header {...rest} className={cx(styles.header, className)}>
      <div className={styles.logo}>
        <Logo name={brandName} />
      </div>
      {progress !== undefined && (
        <div className={styles.progress}>
          <ProgressBar value={progress} />
        </div>
      )}
    </header>
  )
}
