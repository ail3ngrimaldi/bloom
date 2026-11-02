'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { copyField, interpolate } from '@/funnel/copy'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Modal } from '@/ui'
import { cx } from '@/ui/cx'
import { GiftBox } from './art'
import { Confetti } from './Confetti'
import styles from './GiftModal.module.css'

export interface GiftModalProps {
  open: boolean
  /** How many gifts are offered and what each one reveals (D11). */
  gift: { readonly count: 1 | 3; readonly outcomes: readonly number[] }
  /** The visitor accepted the discount; the sheet grants it. */
  onApply: (pct: number) => void
}

/**
 * The gift that reveals the discount (b-09, b-anim-01, PLAN-B 4.3): a dark dialog that opens by
 * itself, "Pick a gift to reveal your discount."; the gifts float at rest; picking one dims the
 * others, opens it with a golden halo, drops the confetti and brings up the coupon with "Apply my
 * discount". The dialog has no way out but to answer, like the reference. What it reveals is the
 * discount that really applies to the price after the trial: the sheet grants it for real.
 */
export function GiftModal({ open, gift, onApply }: GiftModalProps) {
  const titleId = useId()
  const actions = useFunnelActions()
  const applyRef = useRef<HTMLButtonElement>(null)
  const [picked, setPicked] = useState<number | null>(null)
  const revealed = picked !== null
  const pct = picked === null ? null : (gift.outcomes[picked] ?? gift.outcomes[0])
  const t = (path: string, extra: Record<string, string | number> = {}) =>
    interpolate(copyField('plan', `gift.${path}`) ?? '', extra)

  const pick = (index: number) => {
    if (revealed) return
    setPicked(index)
    actions.track({ name: 'gift_pick', index })
  }

  // The choice is made: focus goes to the button that finishes it.
  useEffect(() => {
    if (revealed) applyRef.current?.focus()
  }, [revealed])

  return (
    <Modal
      open={open}
      size="gift"
      labelledBy={titleId}
      closeOnEscape={false}
      closeOnBackdropClick={false}
    >
      <div className={styles.content} data-phase={revealed ? 'reveal' : 'picker'}>
        <Confetti active={revealed} />
        <p className={styles.pill}>{revealed ? t('pillUnlocked') : t('pillPicker')}</p>
        <h2 id={titleId} className={styles.title} tabIndex={-1} data-autofocus>
          {revealed && pct !== null ? t('unlockedTitle', { pct }) : t('pickerTitle')}
        </h2>
        <p className={styles.body}>{revealed ? t('unlockedBody') : t('pickerBody')}</p>
        <p className={styles.srOnly} role="status">
          {revealed && pct !== null ? t('unlockedTitle', { pct }) : ''}
        </p>

        <div className={styles.gifts} data-count={gift.count}>
          {Array.from({ length: gift.count }, (_, index) => (
            <button
              key={index}
              type="button"
              className={cx(
                styles.gift,
                revealed && (index === picked ? styles.picked : styles.dimmed),
              )}
              style={{ '--delay': `${index * -0.7}s` } as CSSProperties}
              aria-label={t('giftLabel', { n: index + 1, total: gift.count })}
              disabled={revealed}
              onClick={() => pick(index)}
            >
              <GiftBox open={revealed && index === picked} />
            </button>
          ))}
        </div>

        {revealed && pct !== null && (
          <>
            <div className={styles.coupon}>
              <p className={styles.kicker}>{t('couponKicker')}</p>
              <p className={styles.value}>
                <span className={styles.percent}>{pct}%</span>
                <span className={styles.off}> OFF</span>
              </p>
              <p className={styles.sub}>{t('couponSub')}</p>
            </div>
            <button
              ref={applyRef}
              type="button"
              className={styles.apply}
              onClick={() => onApply(pct)}
            >
              {t('apply')}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
