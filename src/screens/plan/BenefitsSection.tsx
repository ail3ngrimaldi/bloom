'use client'

import { useId } from 'react'
import { copy, interpolate } from '@/funnel/copy'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { BenefitIcon } from './art'
import styles from './sections.module.css'

const text = copyJson.steps.plan.benefits

/** "What you will get with Bloom" (b-13 items 2 to 4): six benefits, each with a pastel icon. */
export function BenefitsSection() {
  const titleId = useId()
  return (
    <section className={styles.block} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        {interpolate(text.title, { brand: copy.brand })}
      </h2>
      <ul className={styles.benefits}>
        {text.items.map((item) => (
          <li key={item.id} className={styles.benefit}>
            <span className={styles.benefitIcon}>
              <BenefitIcon id={item.id} />
            </span>
            <div>
              <h3 className={styles.benefitTitle}>{item.title}</h3>
              <p className={styles.benefitBody}>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
