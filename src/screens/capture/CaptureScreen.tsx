'use client'

import { useId, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { copy, copyField, stepCopy } from '@/funnel/copy'
import { useFunnelState } from '@/funnel/FunnelProvider'
import { progressFor } from '@/funnel/progress'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  isValidEmail,
  isValidName,
  normalizeName,
} from '@/services/lead/validate'
import { Button, Header, QuestionTitle, QuizLayout } from '@/ui'
import type { ScreenProps } from '../types'
import styles from './CaptureScreen.module.css'

/**
 * Email (#38) and name (#39) capture (PLAN 5.9): header at about 95 %, title, subtitle and one
 * field centred above the CTA. The value is checked on submit (then live while it is wrong), with
 * an inline error tied to the field. Submitting the name hands the lead to the lead service while
 * the CTA reads "Please wait...".
 */
export function CaptureScreen({ step, onNext }: ScreenProps<'capture'>) {
  const titleId = useId()
  const subtitleId = useId()
  const errorId = useId()
  const { lead } = useFunnelState()
  const actions = useFunnelActions()
  const text = stepCopy(step.id)
  const isEmail = step.field === 'email'
  const validate = isEmail ? isValidEmail : isValidName
  const inputRef = useRef<HTMLInputElement>(null)

  const [value, setValue] = useState(() => lead[step.field])
  const [attempted, setAttempted] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const invalid = attempted && !validate(value)

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    setFailed(false)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending) return
    setAttempted(true)
    if (!validate(value)) {
      inputRef.current?.focus()
      return
    }
    actions.setLead({ [step.field]: isEmail ? value.trim() : normalizeName(value) })
    if (isEmail) {
      onNext()
      return
    }
    setSending(true)
    try {
      await actions.submitLead()
      onNext()
    } catch {
      setSending(false)
      setFailed(true)
    }
  }

  const describedBy = [subtitleId, invalid || failed ? errorId : null].filter(Boolean).join(' ')

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <QuizLayout
        align="center"
        header={<Header progress={progressFor(step)} />}
        footer={
          <Button type="submit" loading={sending} arrow>
            {text.cta ?? copy.common.continue}
          </Button>
        }
      >
        <div className={styles.block}>
          <QuestionTitle
            titleId={titleId}
            subtitleId={subtitleId}
            title={text.title}
            subtitle={text.subtitle}
          />
          <input
            ref={inputRef}
            className={styles.input}
            type={isEmail ? 'email' : 'text'}
            name={step.field}
            inputMode={isEmail ? 'email' : 'text'}
            autoComplete={isEmail ? 'email' : 'given-name'}
            autoCapitalize={isEmail ? 'none' : 'words'}
            spellCheck={false}
            maxLength={isEmail ? EMAIL_MAX_LENGTH : NAME_MAX_LENGTH}
            placeholder={copyField(step.id, 'placeholder')}
            aria-labelledby={titleId}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            value={value}
            onChange={onChange}
            readOnly={sending}
            data-autofocus
          />
          {(invalid || failed) && (
            <p id={errorId} className={styles.error} role="alert">
              {failed ? copyField(step.id, 'submitError') : copyField(step.id, 'error')}
            </p>
          )}
        </div>
      </QuizLayout>
    </form>
  )
}
