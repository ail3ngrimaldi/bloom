'use client'

import { useId, useMemo } from 'react'
import copyJson from '@/funnel/copy.variant-b.en.json'
import type { Answers } from '@/funnel/types'
import { deriveSheetProfile, ENERGY_FLAMES, GOAL_SEGMENTS } from '@/profile/sheet'
import { cx } from '@/ui/cx'
import { SheetAvatar } from './art'
import { BrainIcon, FlameIcon, TargetIcon } from './icons'
import styles from './CompareSection.module.css'

const text = copyJson.steps.plan.compare

type Levels = keyof typeof text.levels

interface Stat {
  label: string
  value: string
  /** Lit flames out of 5, or filled segments out of 3. */
  filled: number
  kind: 'flames' | 'segments'
}

function Meter({ stat, side }: { stat: Stat; side: 'now' | 'goal' }) {
  return (
    <div className={cx(styles.tile, styles[side])}>
      <p className={styles.label}>{stat.label}</p>
      <p className={styles.value}>{stat.value}</p>
      {stat.kind === 'flames' ? (
        <span className={styles.flames} aria-hidden="true">
          {Array.from({ length: ENERGY_FLAMES }, (_, index) => (
            <FlameIcon key={index} on={index < stat.filled} />
          ))}
        </span>
      ) : (
        <span className={styles.segments} aria-hidden="true">
          {Array.from({ length: GOAL_SEGMENTS }, (_, index) => (
            <span
              key={index}
              className={styles.segment}
              data-on={index < stat.filled || undefined}
            />
          ))}
        </span>
      )}
    </div>
  )
}

/**
 * NOW vs YOUR GOAL (b-10 items 6 to 8) and the Difficulty / Goal row (b-11 item 1). The values
 * come from the visitor's answers by rules that are Bloom's own and inferred (profile/sheet.ts):
 * the reference shows the results of one visitor, not the rules.
 */
export function CompareSection({ answers }: { answers: Answers }) {
  const profile = useMemo(() => deriveSheetProfile(answers), [answers])
  const nowId = useId()
  const goalId = useId()
  const level = (id: Levels) => text.levels[id]

  const now: Stat[] = [
    {
      label: text.energy,
      value: level(profile.energy.level),
      filled: profile.energy.flames,
      kind: 'flames',
    },
    {
      label: text.wellbeing,
      value: level(profile.wellbeing.level),
      filled: profile.wellbeing.segments,
      kind: 'segments',
    },
    {
      label: text.selfEsteem,
      value: level(profile.selfEsteem.level),
      filled: profile.selfEsteem.segments,
      kind: 'segments',
    },
  ]
  const goal: Stat[] = [
    { label: text.energy, value: level('high'), filled: ENERGY_FLAMES, kind: 'flames' },
    { label: text.wellbeing, value: level('strong'), filled: GOAL_SEGMENTS, kind: 'segments' },
    { label: text.selfEsteem, value: level('high'), filled: GOAL_SEGMENTS, kind: 'segments' },
  ]

  return (
    <section className={styles.section} aria-label={`${text.now} / ${text.goal}`}>
      <div className={styles.columns}>
        <div className={styles.column} role="group" aria-labelledby={nowId}>
          <span id={nowId} className={cx(styles.pill, styles.pillNow)}>
            {text.now}
          </span>
          <span
            className={cx(styles.avatar, styles.avatarNow)}
            role="img"
            aria-label={text.avatarNow}
          >
            <SheetAvatar tone="now" />
          </span>
          {now.map((stat) => (
            <Meter key={stat.label} stat={stat} side="now" />
          ))}
        </div>
        <div className={styles.column} role="group" aria-labelledby={goalId}>
          <span id={goalId} className={cx(styles.pill, styles.pillGoal)}>
            {text.goal}
          </span>
          <span
            className={cx(styles.avatar, styles.avatarGoal)}
            role="img"
            aria-label={text.avatarGoal}
          >
            <SheetAvatar tone="goal" />
          </span>
          {goal.map((stat) => (
            <Meter key={stat.label} stat={stat} side="goal" />
          ))}
        </div>
      </div>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <span className={cx(styles.factIcon, styles.factNow)}>
            <BrainIcon />
          </span>
          <div>
            <p className={styles.factLabel}>{text.difficulty}</p>
            <p className={cx(styles.factValue, styles.factValueNow)}>
              {text.difficulties[profile.difficulty]}
            </p>
          </div>
        </div>
        <div className={styles.fact}>
          <span className={cx(styles.factIcon, styles.factGoal)}>
            <TargetIcon />
          </span>
          <div>
            <p className={styles.factLabel}>{text.goalRow}</p>
            <p className={cx(styles.factValue, styles.factValueGoal)}>{text.goals[profile.goal]}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
