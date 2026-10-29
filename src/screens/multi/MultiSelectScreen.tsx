'use client'

import { useId } from 'react'
import { copy, optionLabel, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { personalize } from '@/funnel/personalize'
import { toggleOption } from '@/funnel/state'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Button, CheckboxGroup, CheckboxRow, QuestionTitle, QuizLayout } from '@/ui'
import type { ScreenProps } from '../types'

/**
 * Multi-select question (PLAN 5.4): no header, the block centred above the CTA, one checkbox row
 * per option, any number of selections. Continue stays disabled until `minSelected` are chosen.
 */
export function MultiSelectScreen({ step, onNext }: ScreenProps<'multi'>) {
  const titleId = useId()
  const subtitleId = useId()
  const { answers } = useFunnelState()
  const actions = useFunnelActions()
  const text = stepCopy(step.id)
  const stored = answers[step.answerKey]
  const selected = Array.isArray(stored) ? stored : []
  const ready = selected.length >= step.minSelected

  const submit = () => {
    actions.answer(step.answerKey, selected)
    onNext()
  }

  return (
    <QuizLayout
      align="center"
      footer={
        <Button disabled={!ready} onClick={submit}>
          {text.cta ?? copy.common.continue}
        </Button>
      }
    >
      <QuestionTitle
        titleId={titleId}
        subtitleId={subtitleId}
        title={personalize(text.title, answers)}
        subtitle={text.subtitle ?? copy.common.chooseAllThatApply}
      />
      <CheckboxGroup aria-labelledby={titleId} aria-describedby={subtitleId}>
        {step.options.map((option) => (
          <CheckboxRow
            key={option}
            label={optionLabel(step.id, option)}
            checked={selected.includes(option)}
            onCheckedChange={() => actions.setAnswer(step.answerKey, toggleOption(stored, option))}
          />
        ))}
      </CheckboxGroup>
    </QuizLayout>
  )
}
