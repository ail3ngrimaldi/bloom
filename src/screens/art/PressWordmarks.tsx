import { Fragment } from 'react'
import { cx } from '@/ui/cx'
import styles from './press.module.css'

/** Typographic approximation of each outlet's masthead: Bloom's own lettering, not their logos. */
const MARK: Readonly<Record<string, string>> = {
  'The New York Times': 'nyt',
  WIRED: 'wired',
  Forbes: 'forbes',
  girlboss: 'girlboss',
  healthline: 'healthline',
  SELF: 'self',
}

export interface PressWordmarksProps {
  /** Outlet names in display order. */
  items: readonly string[]
  /** Accessible name of the list; or `labelledBy`, the id of the visible label ("As featured on:"). */
  label?: string
  labelledBy?: string
  /** 'ink' is black on the quiz; 'accent' is one orange ink on the plan sheet. */
  tone?: 'ink' | 'accent'
  /** Starts a new row after this many outlets. */
  rowSize?: number
  className?: string
}

/**
 * The press the product was featured in (claim C2): the outlets' names set in a typeface of their
 * own, in rows. Text, not images, so it scales and reads the same everywhere (guardrail 6).
 */
export function PressWordmarks({
  items,
  label,
  labelledBy,
  tone = 'ink',
  rowSize,
  className,
}: PressWordmarksProps) {
  return (
    <ul
      className={cx(styles.list, styles[tone], className)}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
    >
      {items.map((name, index) => (
        <Fragment key={name}>
          <li className={cx(styles.mark, styles[MARK[name] ?? 'plain'])}>{name}</li>
          {rowSize && (index + 1) % rowSize === 0 && index < items.length - 1 && (
            <li className={styles.break} aria-hidden="true" />
          )}
        </Fragment>
      ))}
    </ul>
  )
}
