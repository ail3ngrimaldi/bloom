import type { HTMLAttributes } from 'react'
import { cx } from '../cx'
import styles from './Logo.module.css'

export interface LogoProps extends HTMLAttributes<HTMLSpanElement> {
  /** Product name shown as the wordmark. */
  name?: string
}

// Centres of five petals on a circle of radius 8 around (16, 16), 72 degrees apart.
const PETALS = [
  [16, 8],
  [23.61, 13.53],
  [20.7, 22.47],
  [11.3, 22.47],
  [8.39, 13.53],
] as const

/**
 * Bloom wordmark with a simple five-petal glyph.
 * TODO(content): placeholder artwork, replace with the real Bloom logo.
 */
export function Logo({ name = 'Bloom', className, ...rest }: LogoProps) {
  return (
    <span {...rest} className={cx(styles.logo, className)}>
      <svg className={styles.glyph} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        {PETALS.map(([x, y]) => (
          <circle key={`${x}-${y}`} className={styles.petal} cx={x} cy={y} r={5.6} />
        ))}
        <circle className={styles.core} cx={16} cy={16} r={3} />
      </svg>
      <span className={styles.wordmark}>{name}</span>
    </span>
  )
}
