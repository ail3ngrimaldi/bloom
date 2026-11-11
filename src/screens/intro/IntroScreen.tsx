'use client'

import { copy, copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { progressFor } from '@/funnel/progress'
import { useClosing } from '@/funnel/useClosing'
import { Button, Logo, ProgressBar } from '@/ui'
import { cx } from '@/ui/cx'
import { BrandOrb, YouBubble } from '../art'
import artStyles from '../art/art.module.css'
import motion from '../motion.module.css'
import { revealStyle } from '../revealStyle'
import type { ScreenProps } from '../types'
import styles from './IntroScreen.module.css'

/** Staggered reveal of about one second (PLAN 5.2): circles, headline and CTA, then the rest. */
const FIRST = revealStyle(200, 500)
const SECOND = revealStyle(700, 400)

/**
 * Intro (#01): no card, logo and an empty progress bar on top, "You" and Bloom's orb with a "?"
 * between them, a serif headline, a subtitle and the CTA anchored at the bottom. The headline
 * depends on the funnel variant (PLAN-B 3.2): "pay what you want" is the B funnel.
 */
export function IntroScreen({ step, onNext }: ScreenProps<'intro'>) {
  const { answers } = useFunnelState()
  const closing = useClosing()
  const text = stepCopy(step.id)
  const title = (closing === 'pwyw' && copyField(step.id, 'titlePwyw')) || text.title
  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <Logo />
        <ProgressBar
          className={styles.progress}
          value={progressFor(step)}
          label={copy.common.progressLabel}
        />
      </header>
      <div className={styles.body}>
        <div className={cx(styles.art, motion.reveal)} style={FIRST}>
          <YouBubble label={copyField(step.id, 'you') ?? 'You'} />
          <span className={cx(artStyles.chip, motion.reveal)} style={SECOND} aria-hidden="true">
            ?
          </span>
          <BrandOrb />
        </div>
        <h1 className={cx(styles.title, motion.reveal)} style={FIRST}>
          {title}
        </h1>
        {text.subtitle && (
          <p className={cx(styles.subtitle, motion.reveal)} style={SECOND}>
            {personalize(text.subtitle, answers)}
          </p>
        )}
      </div>
      <div className={cx(styles.footer, motion.reveal)} style={FIRST}>
        <Button size="interstitial" onClick={onNext}>
          {text.cta ?? copy.common.continue}
        </Button>
      </div>
    </div>
  )
}
