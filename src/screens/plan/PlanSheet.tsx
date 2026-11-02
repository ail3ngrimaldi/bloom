'use client'

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { copyField, interpolate, stepCopy } from '@/funnel/copy'
import { COUNTDOWN_SECONDS, paywallCountdownEnabled } from '@/funnel/flags'
import { useCountdownService, useFunnelState } from '@/funnel/FunnelProvider'
import type { Discount } from '@/funnel/state'
import { CLOSINGS } from '@/funnel/steps'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { promoCode, quotePlan } from '@/pricing/closing'
import { formatMoney } from '@/pricing/plans'
import { remainingSeconds } from '@/services/countdown/mock'
import { lockScroll } from '@/ui/Modal/scrollLock'
import { useDelayedFlag } from '../useDelayedFlag'
import { BenefitsSection } from './BenefitsSection'
import { CompareSection } from './CompareSection'
import { PlanContext } from './context'
import type { PlanContextValue } from './context'
import { CouponSection } from './CouponSection'
import { ExpertSection } from './ExpertSection'
import { FaqSection } from './FaqSection'
import { GiftModal } from './GiftModal'
import { useAfter, useNow } from './hooks'
import { CloseIcon } from './icons'
import { LegalSection } from './LegalSection'
import { LetterSection } from './LetterSection'
import { PaymentSection } from './PaymentSection'
import { PlanCard } from './PlanCard'
import { ReviewsSection } from './ReviewsSection'
import { SheetHeader } from './SheetHeader'
import { StickyBar } from './StickyBar'
import styles from './PlanSheet.module.css'

/** The sheet paints a skeleton first, then everything (the reference took about 4 s; the target is under 1.5 s). */
export const SHEET_LOAD_MS = 600
/** The gift modal opens about a second after the sheet is painted (PLAN-B 4.3). */
export const GIFT_DELAY_MS = 1000

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const noopSubscribe = () => () => {}

/**
 * #42 the plan sheet (PLAN-B 4.2 to 4.9): a column over the "pay what you want" page with a fixed
 * bar at the bottom. It loads a skeleton, opens the gift modal, and then shows the sections in the
 * order of the reference (Appendix B): the NOW vs YOUR GOAL comparison, the coupon, the plan, the
 * payment block, the legal text, the benefits, the FAQ, the reviews, the expert, the awards, the
 * press and the letter.
 *
 * The countdown only exists with `paywall.countdown.enabled`; it starts when the discount is
 * granted and the discount really ends (guardrail 5). The price after the trial, the banner, the
 * coupon and the legal text all come from the discount in force (guardrail 4).
 */
export function PlanSheet({ onClose }: { onClose: () => void }) {
  const config = CLOSINGS.pwyw[1]
  const pwyw = CLOSINGS.pwyw[0]
  const text = stepCopy('plan')
  const { trialAmount, discount, lead, answers } = useFunnelState()
  const actions = useFunnelActions()
  const countdown = useCountdownService()
  const titleId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLElement>(null)
  const [openedAt] = useState(() => performance.now())
  const [today] = useState(() => new Date())

  const ready = useDelayedFlag(SHEET_LOAD_MS)
  const countdownEnabled = useSyncExternalStore(
    noopSubscribe,
    () => paywallCountdownEnabled(window.location.search),
    () => false,
  )
  const running = countdownEnabled && discount?.expiresAt != null
  const ticked = useNow(countdown, running)
  // The clock only runs while a discount can end: right after it is granted, the last tick is
  // older than the grant, so the grant time is the earliest the countdown can read.
  const now = discount ? Math.max(ticked, discount.grantedAt) : ticked
  const active = discount !== null && (!running || now < (discount.expiresAt ?? Infinity))
  const ended = discount !== null && !active
  const remaining =
    running && discount?.expiresAt != null ? remainingSeconds(discount.expiresAt, now) : null

  const popular = pwyw.tiles.find((tile) => 'mostPopular' in tile && tile.mostPopular)
  const amount = trialAmount ?? popular?.amount ?? pwyw.tiles[0].amount
  const quote = useMemo(
    () => quotePlan({ trialAmount: amount, discountPct: active ? discount.pct : 0, today }),
    [amount, active, discount, today],
  )

  const giftDue = useAfter(ready, GIFT_DELAY_MS)
  const giftOpen = giftDue && discount === null

  // Events of PLAN-B 6.6: the sheet opening, its first complete paint and the gift modal.
  useEffect(() => {
    actions.track({ name: 'sheet_open' })
  }, [actions])
  useEffect(() => {
    if (ready) actions.track({ name: 'sheet_ready', ms: Math.round(performance.now() - openedAt) })
  }, [ready, actions, openedAt])
  useEffect(() => {
    if (giftOpen) actions.track({ name: 'gift_view' })
  }, [giftOpen, actions])
  const expiredTracked = useRef(false)
  useEffect(() => {
    if (ended && !expiredTracked.current) {
      expiredTracked.current = true
      actions.track({ name: 'countdown_expire' })
    }
  }, [ended, actions])

  // A dialog over the page: focus moves in, the page behind does not scroll, Escape closes it
  // (not while the gift is open: that modal asks for an answer first).
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const unlock = lockScroll()
    scrollRef.current?.focus({ preventScroll: true })
    return () => {
      unlock()
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])
  useEffect(() => {
    if (giftOpen) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [giftOpen, onClose])

  const trapTab = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || giftOpen) return
    const items = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    const current = document.activeElement
    if (event.shiftKey && (current === first || current === scrollRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && current === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const apply = (pct: number) => {
    const window_ = countdown.open(COUNTDOWN_SECONDS)
    const granted: Discount = {
      pct,
      code: promoCode(pct, new Date(window_.grantedAt)),
      grantedAt: window_.grantedAt,
      // Without the countdown flag the discount does not end (there is nothing to expire against).
      expiresAt: countdownEnabled ? window_.expiresAt : null,
    }
    actions.grantDiscount(granted)
    actions.track({ name: 'discount_apply', pct })
  }

  const startNow = () => {
    actions.track({ name: 'start_now_click' })
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    paymentRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    paymentRef.current?.focus({ preventScroll: true })
  }

  const context = useMemo<PlanContextValue>(
    () => ({
      quote,
      discount: active ? discount : null,
      countdownEnabled,
      remaining,
      discountEnded: ended,
      today,
      domain: window.location.host,
    }),
    [quote, active, discount, countdownEnabled, remaining, ended, today],
  )

  const sticky = interpolate(copyField('plan', 'sticky.label') ?? '', {
    trialDays: quote.trialDays,
    trialPrice: formatMoney(quote.trialAmount),
  })

  return createPortal(
    <PlanContext.Provider value={context}>
      <div className={styles.layer}>
        <div
          ref={sheetRef}
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-busy={!ready || undefined}
          onKeyDown={trapTab}
        >
          <h1 id={titleId} className={styles.srOnly}>
            {text.title}
          </h1>
          <button
            type="button"
            className={styles.close}
            aria-label={copyField('plan', 'close')}
            onClick={onClose}
          >
            <CloseIcon />
          </button>

          <div ref={scrollRef} className={styles.scroll} tabIndex={-1} data-testid="sheet-scroll">
            {ready ? (
              <>
                <SheetHeader />
                <div className={styles.body}>
                  <CompareSection answers={answers} />
                  <CouponSection />
                  <PlanCard />
                  <PaymentSection ref={paymentRef} email={lead.email} />
                  <LegalSection />
                  <BenefitsSection />
                  <FaqSection />
                  <ReviewsSection />
                  <ExpertSection />
                  <LetterSection name={lead.name} />
                </div>
              </>
            ) : (
              <SheetSkeleton label={copyField('plan', 'loading') ?? ''} />
            )}
          </div>

          <StickyBar label={sticky} disabled={!ready} onStart={startNow} />
        </div>
      </div>

      <GiftModal open={giftOpen} gift={config.gift} onApply={apply} />
    </PlanContext.Provider>,
    document.body,
  )
}

/** What the sheet shows while it loads: the frame of the header and the tinted placeholders of the avatars. */
function SheetSkeleton({ label }: { label: string }) {
  return (
    <div className={styles.skeleton} role="status">
      <span className={styles.srOnly}>{label}</span>
      <div className={styles.skHeader}>
        <span className={styles.skBar} style={{ width: 110, height: 30 }} />
        <span className={styles.skBar} style={{ width: 240, height: 16 }} />
      </div>
      <div className={styles.skPills}>
        <span className={styles.skBar} style={{ width: 90, height: 28 }} />
        <span className={styles.skBar} style={{ width: 130, height: 28 }} />
      </div>
      <div className={styles.skAvatars}>
        <span className={styles.skCircle} />
        <span className={styles.skCircle} />
      </div>
      <div className={styles.skTiles}>
        {Array.from({ length: 6 }, (_, index) => (
          <span key={index} className={styles.skBar} style={{ height: 84 }} />
        ))}
      </div>
    </div>
  )
}
