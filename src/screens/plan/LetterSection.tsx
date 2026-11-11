'use client'

import { copy, interpolate } from '@/funnel/copy'
import copyJson from '@/funnel/copy.variant-b.en.json'
import { SunsetScene } from './art'
import { usePlan } from './context'
import styles from './sections.module.css'

const text = copyJson.steps.plan.letter
const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

/**
 * The letter from "future you" (b-15 B): a tilted picture overlapping the card, a greeting with the
 * visitor's name, four paragraphs and a signature. The year and the long date are today's; without
 * a name the greeting and the signature are generic (PLAN-B 4.8).
 */
export function LetterSection({ name }: { name: string }) {
  const { today } = usePlan()
  const firstName = name.trim().split(/\s+/)[0] ?? ''
  const vars = {
    firstName,
    brand: copy.brand,
    nextYear: today.getFullYear() + 1,
    todayLong: longDate.format(today),
  }
  const paragraphs = firstName ? text.paragraphs : text.paragraphsFallback
  const [datePhrase, ...rest] = paragraphs.slice(1)
  return (
    <section className={styles.letterWrap} aria-label="A letter from future you">
      <div className={styles.letterPicture} role="img" aria-label={text.illustration}>
        <SunsetScene />
      </div>
      <article className={styles.letter}>
        <h2 className={styles.letterGreeting}>
          {interpolate(firstName ? text.greeting : text.greetingFallback, vars)}
        </h2>
        <p>{interpolate(paragraphs[0], vars)}</p>
        <p>
          <strong className={styles.letterStrong}>{interpolate(datePhrase, vars)}</strong>
        </p>
        {rest.map((paragraph) => (
          <p key={paragraph}>{interpolate(paragraph, vars)}</p>
        ))}
        <p className={styles.letterSign}>
          {text.signOff}
          <br />
          <strong>{interpolate(firstName ? text.signature : text.signatureFallback, vars)}</strong>
        </p>
      </article>
    </section>
  )
}
