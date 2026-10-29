'use client'

import { useId, useState } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import { copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Modal } from '@/ui'
import { cx } from '@/ui/cx'
import type { ScreenProps } from '../types'
import { MountainFlagIcon, QuillInkIcon } from './icons'
import { loaderScript } from './script'
import { useLoaderRun } from './useLoaderRun'
import styles from './LoaderScreen.module.css'

const TIPS = ['small', 'you', 'restart'] as const
const QUESTION_ICONS: Record<string, ComponentType> = {
  rushed_mornings: MountainFlagIcon,
  heard_habit_stacking: QuillInkIcon,
}

/**
 * "Creating your Personalized Plan" (#37, PLAN 5.8): three bars fill one after the other with an
 * eased curve; two questions stop the first and the second bar until they are answered; a check
 * in the bar's colour marks each finished bar; then the funnel moves on by itself.
 *
 * The reference shows three testimonials under the bars. Bloom has none yet (claims.ts,
 * 'testimonials'), so the same place holds three short notes about the plan.
 */
export function LoaderScreen({ step, onNext }: ScreenProps<'loader'>) {
  const { answers } = useFunnelState()
  const actions = useFunnelActions()
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

      <section className={styles.tips} aria-label={copyField(step.id, 'tipsLabel')}>
        {TIPS.map((tip) => (
          <div key={tip} className={styles.tip}>
            <h2 className={styles.tipTitle}>{copyField(step.id, `tips.${tip}.title`)}</h2>
            <p className={styles.tipBody}>{copyField(step.id, `tips.${tip}.body`)}</p>
          </div>
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
