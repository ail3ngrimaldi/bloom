'use client'

import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { copy, copyField, interpolate, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { audienceFor } from '@/funnel/personalize'
import { deriveProfile } from '@/profile/derive'
import { Button } from '@/ui'
import { cx } from '@/ui/cx'
import { ProfilePerson } from '../art'
import motion from '../motion.module.css'
import { revealStyle } from '../revealStyle'
import type { ScreenProps } from '../types'
import { AlertIcon, BatteryIcon, BoltIcon, CalendarIcon, ThumbDownIcon } from './icons'
import styles from './SummaryScreen.module.css'

const SEGMENTS = [1, 2, 3, 4, 5, 6] as const

function Tile({ icon, label, value }: { icon: ReactNode; label?: string; value?: string }) {
  return (
    <li className={styles.tile}>
      <span className={styles.tileIcon}>{icon}</span>
      <span className={styles.tileText}>
        <span className={styles.tileLabel}>{label}</span>
        <span className={styles.tileValue}>{value}</span>
      </span>
    </li>
  )
}

/**
 * "Summary of your Well-being Profile" (#36, PLAN 5.7): negative-effects level with a six-part
 * meter, an alert for the level and four tiles, all derived from the answers (PLAN 6.5).
 */
export function SummaryScreen({ step, onNext }: ScreenProps<'summary'>) {
  const { answers } = useFunnelState()
  const text = stepCopy(step.id)
  const profile = useMemo(() => deriveProfile(answers), [answers])
  const field = (path: string) => copyField(step.id, path)
  const levelText = field(`levels.${profile.level}`) ?? profile.level

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{text.title}</h1>

      <section className={styles.card} aria-labelledby="summary-level">
        <div className={styles.levelRow}>
          <span id="summary-level">{field('levelLabel')}</span>
          <span className={cx(styles.pill, styles[profile.level])}>{levelText}</span>
        </div>
        <div className={cx(styles.person, motion.reveal)} style={revealStyle(0, 400)}>
          <ProfilePerson audience={audienceFor(answers)} />
        </div>
        <div
          className={styles.meter}
          role="meter"
          aria-label={field('levelLabel')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(profile.score * 100)}
          aria-valuetext={interpolate(field('meterLabel') ?? '{{level}}', { level: levelText })}
          style={{ '--meter-value': `${profile.score * 100}%` } as CSSProperties}
        >
          <span className={styles.segments} aria-hidden="true">
            {SEGMENTS.map((segment) => (
              <span key={segment} className={styles.segment} data-segment={segment} />
            ))}
          </span>
          <span className={styles.knob} aria-hidden="true" />
        </div>
        <div className={cx(styles.alert, styles[profile.level])}>
          <span className={styles.alertIcon}>
            <AlertIcon />
          </span>
          <span>
            <strong className={styles.alertTitle}>{field(`alerts.${profile.level}.title`)}</strong>
            <span className={styles.alertBody}>{field(`alerts.${profile.level}.body`)}</span>
          </span>
        </div>
      </section>

      <ul className={styles.tiles}>
        <Tile
          icon={<ThumbDownIcon />}
          label={field('tiles.mainDifficulty')}
          value={field(`mainDifficulty.${profile.mainDifficulty}`)}
        />
        <Tile
          icon={<CalendarIcon />}
          label={field('tiles.challengingPeriod')}
          value={field(`challengingPeriod.${profile.challengingPeriod}`)}
        />
        <Tile
          icon={<BoltIcon />}
          label={field('tiles.trigger')}
          value={field(`trigger.${profile.trigger}`)}
        />
        <Tile
          icon={<BatteryIcon />}
          label={field('tiles.energyLevel')}
          value={field(`energyLevel.${profile.energyLevel}`)}
        />
      </ul>

      <p className={styles.disclaimer}>{field('disclaimer')}</p>

      <div className={styles.footer}>
        <Button className={styles.cta} size="quiz" onClick={onNext}>
          {text.cta ?? copy.common.continue}
        </Button>
      </div>
    </div>
  )
}
