'use client'

import { useEffect, useId, useRef } from 'react'
import { CLAIMS } from '@/funnel/claims'
import { copyField, interpolate, stepCopy } from '@/funnel/copy'
import { DEMO_PRICES } from '@/funnel/flags'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { CLOSINGS } from '@/funnel/steps'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { formatMoney } from '@/pricing/plans'
import { Logo, RadioGroup } from '@/ui'
import { PlanSheet } from '../plan'
import type { ScreenProps } from '../types'
import { OrangeTree } from './OrangeTree'
import { TrialTile } from './TrialTile'
import styles from './PwywScreen.module.css'

const GENERIC_AVATAR = (
  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
    <circle cx="16" cy="16" r="16" fill="var(--pwyw-tile-1)" />
    <circle cx="16" cy="13" r="5.5" fill="var(--pwyw-tile-1-ink)" />
    <path
      d="M5.5 27c1.6-5.6 5.6-8 10.5-8s8.9 2.4 10.5 8a16 16 0 0 1-21 0Z"
      fill="var(--pwyw-tile-1-ink)"
    />
  </svg>
)

/**
 * #41 "Pay what you want" (PLAN-B 4.1) and, on top of it, the plan sheet (#42): a header with the
 * logo and the visitor's name, the title, two paragraphs (the second one is the company's cost,
 * claim C8), three amounts to choose from and "See my plan". The amount chosen is what the plan
 * sheet, its fixed bar, the payment block, the legal text and the charge all show (guardrail 4).
 */
export function PwywScreen({ step, onNext }: ScreenProps<'pwyw' | 'plan_sheet'>) {
  const config = CLOSINGS.pwyw[0]
  const text = stepCopy('pwyw')
  const { trialAmount, lead } = useFunnelState()
  const actions = useFunnelActions()
  const titleId = useId()
  const pushedSheet = useRef(false)
  const ctaRef = useRef<HTMLButtonElement>(null)
  const sheetWasOpen = useRef(false)
  const sheetOpen = step.type === 'plan_sheet'

  const popular = config.tiles.find((tile) => 'mostPopular' in tile && tile.mostPopular)
  const selected =
    config.tiles.find((tile) => tile.amount === trialAmount) ?? popular ?? config.tiles[0]

  useEffect(() => {
    actions.track({ name: 'pwyw_view' })
  }, [actions])

  // The page behind the sheet is inert, which drops the focus; when the sheet closes (the × button,
  // Escape or the browser's Back) it returns to the button that opened it.
  useEffect(() => {
    if (sheetWasOpen.current && !sheetOpen) ctaRef.current?.focus({ preventScroll: true })
    sheetWasOpen.current = sheetOpen
  }, [sheetOpen])

  const choose = (id: string) => {
    const tile = config.tiles.find((candidate) => candidate.id === id)
    if (!tile) return
    actions.chooseTrial(tile.amount)
    actions.track({ name: 'pwyw_select', amount: tile.amount })
  }

  const seePlan = () => {
    // The preselected tile counts as chosen even if the visitor never touched the group.
    actions.chooseTrial(selected.amount)
    pushedSheet.current = true
    onNext()
  }

  const closeSheet = () => {
    // Back to this page when this visit pushed the sheet; else (a deep link, a reload) replace.
    if (pushedSheet.current) {
      pushedSheet.current = false
      actions.back()
    } else {
      actions.goTo('pwyw', { replace: true })
    }
  }

  const name = lead.name.trim()
  return (
    <div className={styles.page}>
      <div className={styles.content} inert={sheetOpen || undefined}>
        <header className={styles.header}>
          <Logo />
          <span className={styles.user}>
            <span className={styles.userAvatar}>{GENERIC_AVATAR}</span>
            <span className={styles.userName}>
              {name
                ? interpolate(copyField('pwyw', 'userChip') ?? '', { name })
                : copyField('pwyw', 'userChipFallback')}
            </span>
          </span>
        </header>

        <main className={styles.main}>
          <h1 id={titleId} className={styles.title}>
            {text.title}
          </h1>
          <p className={styles.body}>{copyField('pwyw', 'body')}</p>
          <p className={styles.note}>
            {interpolate(copyField('pwyw', 'note') ?? '', {
              companyCost: formatMoney(CLAIMS.companyCost),
            })}
          </p>

          <RadioGroup
            className={styles.tiles}
            aria-label={copyField('pwyw', 'tilesLabel')}
            orientation="horizontal"
            value={selected.id}
            onValueChange={choose}
          >
            {config.tiles.map((tile, index) => (
              <TrialTile
                key={tile.id}
                id={tile.id}
                amount={tile.amount}
                tone={index + 1}
                ribbon={
                  'mostPopular' in tile && tile.mostPopular
                    ? copyField('pwyw', 'ribbon')
                    : undefined
                }
              />
            ))}
          </RadioGroup>

          <button ref={ctaRef} type="button" className={styles.cta} onClick={seePlan}>
            {copyField('pwyw', 'cta')}
          </button>
          {DEMO_PRICES && <p className={styles.demo}>{copyField('pwyw', 'demoNotice')}</p>}
        </main>

        <div className={styles.trees} aria-hidden="true">
          <span className={styles.treeLeft}>
            <OrangeTree />
          </span>
          <span className={styles.treeRight}>
            <OrangeTree flip />
          </span>
        </div>
      </div>

      {sheetOpen && <PlanSheet onClose={closeSheet} />}
    </div>
  )
}
