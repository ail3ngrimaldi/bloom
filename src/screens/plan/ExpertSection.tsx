'use client'

import { useId } from 'react'
import { CLAIMS } from '@/funnel/claims'
import { copy, interpolate } from '@/funnel/copy'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { PressWordmarks } from '../art'
import { AwardIcon, VerifiedSeal } from './icons'
import { ReviewerAvatar } from './art'
import styles from './sections.module.css'

const text = copyJson.steps.plan.expert
const AWARD_ICONS = ['play', 'store', 'design'] as const

/**
 * The expert, the awards and the press (b-15 A, b-19 items 4 to 8): an orange banner "Content
 * reviewed by an expert", the reviewer's name, role and quote (claim C4), "{{brand}} awards" with
 * three awards (claim C5) and "As featured in" with the press in one orange ink (claim C2).
 * The reviewer's photo is not reproduced: a generic avatar stands in for it.
 */
export function ExpertSection() {
  const awardsId = useId()
  const pressId = useId()
  const reviewer = CLAIMS.expert.sheet
  return (
    <section className={styles.expert}>
      <p className={styles.expertBanner}>
        <VerifiedSeal className={styles.expertSeal} check="var(--expert-accent)" />
        {text.banner}
      </p>
      <div className={styles.expertBody}>
        <div className={styles.reviewer}>
          <span className={styles.reviewerAvatar}>
            <ReviewerAvatar />
          </span>
          <div>
            <p className={styles.reviewerName}>{reviewer.name}</p>
            <p className={styles.reviewerRole}>{reviewer.role}</p>
          </div>
        </div>
        <p className={styles.expertQuote}>{reviewer.quote}</p>

        <hr className={styles.rule} />
        <h2 id={awardsId} className={styles.expertTitle}>
          {interpolate(text.awardsTitle, { brand: copy.brand })}
        </h2>
        <ul className={styles.awards} aria-labelledby={awardsId}>
          {CLAIMS.awards.map((award, index) => (
            <li key={award.title} className={styles.award}>
              <AwardIcon
                kind={AWARD_ICONS[index % AWARD_ICONS.length]}
                className={styles.awardIcon}
              />
              <div>
                <p className={styles.awardTitle}>{award.title}</p>
                <p className={styles.awardSource}>{award.source}</p>
              </div>
            </li>
          ))}
        </ul>

        <hr className={styles.rule} />
        <h2 id={pressId} className={styles.expertTitle}>
          {text.pressLabel}
        </h2>
        <PressWordmarks items={CLAIMS.press.sheet} labelledBy={pressId} tone="accent" rowSize={3} />
      </div>
    </section>
  )
}
