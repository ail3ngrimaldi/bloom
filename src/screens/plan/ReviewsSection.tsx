'use client'

import { useId } from 'react'
import { CLAIMS } from '@/funnel/claims'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { Stars } from './icons'
import styles from './sections.module.css'

/**
 * "Members love our plans" (b-14, b-19 items 1 to 3): the two member reviews of the reference
 * (claim C7, guardrail 2), five stars each, the quote and the author in bold italics. The first
 * one thanks another product by name, exactly as in the reference (PLAN-B 2.4).
 */
export function ReviewsSection() {
  const titleId = useId()
  return (
    <section className={styles.block} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        {copyJson.steps.plan.reviews.title}
      </h2>
      <div className={styles.reviews}>
        {CLAIMS.reviews.map((review) => (
          <figure key={review.author} className={styles.review}>
            <Stars count={review.stars} className={styles.stars} />
            <blockquote className={styles.reviewText}>{review.text}</blockquote>
            <figcaption className={styles.reviewAuthor}>{review.author}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
