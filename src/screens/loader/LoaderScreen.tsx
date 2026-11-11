'use client'

import { useId, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { CLAIMS } from '@/funnel/claims'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState, useSound } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Modal } from '@/ui'
import { cx } from '@/ui/cx'
import type { ScreenProps } from '../types'
import { MountainFlagIcon, QuillInkIcon } from './icons'
import { loaderScript } from './script'
import { useLoaderRun } from './useLoaderRun'
import styles from './LoaderScreen.module.css'

const QUESTION_ICONS: Record<string, ComponentType> = {
  rushed_mornings: MountainFlagIcon,
  heard_habit_stacking: QuillInkIcon,
}

/**
 * "Creating your Personalized Plan" (#37, PLAN 5.8): three bars fill one after the other with an
 * eased curve; two questions stop the first and the second bar until they are answered; a check
 * in the bar's colour marks each finished bar; then the funnel moves on by itself.
 *
 * Under the bars sit the three testimonials of the reference (claim C6, guardrail 3), with the
 * product's name in place of the reference's.
 */
export function LoaderScreen({ step, onNext }: ScreenProps<'loader'>) {
  const { answers } = useFunnelState()
  const actions = useFunnelActions()
  const { tap } = useSound()
  const questionId = useId()
  const text = stepCopy(step.id)
  // The script is fixed for the visit; questions answered before (reload, Back) are not asked.
  const [moves] = useState(() =>
    loaderScript(step.bars.length, step.interrupts, (key) => typeof answers[key] === 'string'),
  )
  const { values, asking, resume } = useLoaderRun(moves, step.bars.length, onNext)
  const interrupt = asking === null ? null : step.interrupts[asking]
  const Icon = interrupt ? QUESTION_ICONS[interrupt.answerKey] : null

  const answer = (value: string) => {
    if (!interrupt) return
    tap()
    actions.setAnswer(interrupt.answerKey, value)
    actions.track({ name: 'loader_modal_answer', id: interrupt.answerKey, value })
    resume()
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>{text.title}</h1>

      <div className={styles.bars}>
        {step.bars.map((bar, index) => {
          const value = values[index] ?? 0
          const percent = Math.round(value * 100)
          const shown = percent === 0 && value > 0 ? 1 : percent
          const label = copyField(step.id, `bars.${bar}`)
          return (
            <div
              key={bar}
              className={styles.bar}
              role="progressbar"
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={shown}
              style={
                { '--step': `var(--step-${index + 1})`, '--p': `${value * 100}%` } as CSSProperties
              }
            >
              <span className={styles.fill} />
              <span className={styles.text} aria-hidden="true">
                <span>{label}</span>
                <span>{shown}%</span>
              </span>
              <span className={cx(styles.text, styles.onFill)} aria-hidden="true">
                <span>{label}</span>
                <span>{shown}%</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className={styles.checks} aria-hidden="true">
        {step.bars.map((bar, index) => (
          <span
            key={bar}
            className={cx(styles.check, (values[index] ?? 0) >= 1 && styles.done)}
            style={{ '--step': `var(--step-${index + 1})` } as CSSProperties}
          >
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M4 10.5 8 14.5 16 5.5" />
            </svg>
          </span>
        ))}
      </div>

      <section className={styles.testimonials} aria-label={copyField(step.id, 'testimonialsLabel')}>
        {CLAIMS.testimonials.map((testimonial) => (
          <article key={testimonial.author} className={styles.testimonial}>
            <p
              className={styles.stars}
              role="img"
              aria-label={`${testimonial.stars} out of 5 stars`}
            >
              {'★'.repeat(testimonial.stars)}
            </p>
            <h2 className={styles.testimonialTitle}>
              {personalize(testimonial.title, answers)} - {testimonial.author}
            </h2>
            <p className={styles.testimonialBody}>{personalize(testimonial.body, answers)}</p>
          </article>
        ))}
      </section>

      <Modal
        open={interrupt !== null}
        size="sheet"
        labelledBy={questionId}
        closeOnEscape={false}
        closeOnBackdropClick={false}
        className={styles.sheet}
      >
        {interrupt && (
          <div className={styles.sheetBody}>
            <span className={styles.sheetIcon}>{Icon && <Icon />}</span>
            <h2 id={questionId} className={styles.question}>
              {copyField(step.id, `questions.${interrupt.answerKey}`)}
            </h2>
            <div className={styles.answers}>
              {interrupt.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={styles.answer}
                  onClick={() => answer(option)}
                >
                  {copyField(step.id, `options.${option}`) ?? option}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
