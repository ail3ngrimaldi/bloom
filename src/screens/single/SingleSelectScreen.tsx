'use client'

import { useEffect, useId, useState } from 'react'
import { copyField, optionLabel, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { progressFor } from '@/funnel/progress'
import { ADVANCE_DELAY_MS } from '@/funnel/timing'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Header, OptionCard, QuestionTitle, QuizLayout, RadioGroup } from '@/ui'
import type { ScreenProps } from '../types'
import { PrivacyNote } from './PrivacyNote'

/**
 * Single-select question (PLAN 5.3): header with progress, title, one option per row. Choosing
 * stores the answer, shows it selected and moves on ADVANCE_DELAY_MS later; there is no Next or
 * Back button. The previous answer, if the user comes back, shows as selected.
 */
export function SingleSelectScreen({ step, onNext }: ScreenProps<'single'>) {
  const titleId = useId()
  const { answers } = useFunnelState()
  const actions = useFunnelActions()
  const [picked, setPicked] = useState<string | null>(null)
  const text = stepCopy(step.id)
  const stored = answers[step.answerKey]
  const optionSet = 'optionSet' in step ? step.optionSet : undefined

  useEffect(() => {
    if (picked === null) return
    const timer = setTimeout(onNext, ADVANCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [picked, onNext])

  const choose = (value: string) => {
    // One answer per visit: a second click while leaving would answer twice.
    if (picked !== null) return
    setPicked(value)
    actions.answer(step.answerKey, value)
  }

  return (
    <QuizLayout header={<Header progress={progressFor(step)} />}>
      <QuestionTitle
        id={titleId}
        title={personalize(text.title, answers)}
        subtitle={text.subtitle && personalize(text.subtitle, answers)}
      />
      <RadioGroup
        aria-labelledby={titleId}
        value={picked ?? (typeof stored === 'string' ? stored : null)}
        onValueChange={choose}
      >
        {step.options.map((option) => (
          <OptionCard key={option} value={option} label={optionLabel(step.id, option, optionSet)} />
        ))}
      </RadioGroup>
      {'sensitive' in step && <PrivacyNote text={copyField(step.id, 'privacy')} />}
    </QuizLayout>
  )
}
