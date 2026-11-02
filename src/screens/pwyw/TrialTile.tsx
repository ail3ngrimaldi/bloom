'use client'

import type { MouseEvent } from 'react'
import { formatMoney } from '@/pricing/plans'
import { useRadioGroup } from '@/ui'
import { cx } from '@/ui/cx'
import styles from './TrialTile.module.css'

export interface TrialTileProps {
  id: string
  /** What the visitor would pay today, in USD. */
  amount: number
  /** 1, 2 or 3: which of the three tints the tile wears. */
  tone: number
  /** "MOST POPULAR" on the tile that carries the ribbon. */
  ribbon?: string
}

/**
 * One amount of "Pay what you want": a radio inside the tiles group. The chosen tile has an
 * explicit state (a 2 px border and a check), which the reference did not show (PLAN-B 4.1).
 */
export function TrialTile({ id, amount, tone, ribbon }: TrialTileProps) {
  const group = useRadioGroup()
  const checked = group?.value === id
  const money = formatMoney(amount)

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!event.defaultPrevented) group?.select(id)
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ribbon ? `${money}, ${ribbon.toLowerCase()}` : money}
      className={cx(styles.tile, styles[`tone${tone}`], checked && styles.checked)}
      onClick={onClick}
    >
      {ribbon && (
        <span className={styles.ribbon} aria-hidden="true">
          {ribbon}
        </span>
      )}
      <span className={styles.amount} aria-hidden="true">
        {money}
      </span>
      <span className={styles.check} aria-hidden="true">
        <svg viewBox="0 0 20 20" focusable="false">
          <path d="M5 10.4 8.4 13.6 15 6.8" />
        </svg>
      </span>
    </button>
  )
}
