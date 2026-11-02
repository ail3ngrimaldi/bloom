'use client'

import { useId, useState } from 'react'
import { copy, interpolate } from '@/funnel/copy'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { cx } from '@/ui/cx'
import styles from './sections.module.css'

const text = copyJson.steps.plan.faq

/**
 * "People often ask" (b-13 items 5 to 7, b-14): an accordion of five questions, the first one open.
 * Each question is a button with `aria-expanded` that controls its answer. Only the first answer
 * was visible in the reference; the other four are Bloom's own wording (TODO(content)).
 */
export function FaqSection() {
  const titleId = useId()
  const base = useId()
  const [open, setOpen] = useState<number | null>(0)
  const vars = { brand: copy.brand }
  return (
    <section className={styles.block} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.sectionTitle}>
        {text.title}
      </h2>
      <div className={styles.faq}>
        {text.items.map((item, index) => {
          const expanded = open === index
          const buttonId = `${base}-q${index}`
          const panelId = `${base}-a${index}`
          return (
            <div key={item.q} className={cx(styles.faqItem, expanded && styles.faqOpen)}>
              <h3 className={styles.faqHeading}>
                <button
                  type="button"
                  id={buttonId}
                  className={styles.faqButton}
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  <span>{interpolate(item.q, vars)}</span>
                  <span className={styles.faqIcon} aria-hidden="true" />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={styles.faqPanel}
                hidden={!expanded}
              >
                <p>{interpolate(item.a, vars)}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
