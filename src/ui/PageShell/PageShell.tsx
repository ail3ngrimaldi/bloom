import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import styles from './PageShell.module.css'

export type PageTheme = 'lilac' | 'soft' | 'dark' | 'warm' | 'white'

export interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  theme?: PageTheme
  /** Vertical placement of the child: the card and full-height columns want 'start'. */
  align?: 'start' | 'center'
}

/** Full-viewport page background by theme; centres its child horizontally. */
export function PageShell({
  theme = 'lilac',
  align = 'start',
  className,
  children,
  ...rest
}: PageShellProps) {
  return (
    <div
      {...rest}
      className={cx(
        styles.shell,
        styles[theme],
        align === 'center' && styles.alignCenter,
        className,
      )}
      data-theme={theme}
    >
      {children}
    </div>
  )
}
