'use client'

import { useId, useState } from 'react'
import {
  Button,
  Card,
  CheckboxGroup,
  CheckboxRow,
  PageShell,
  QuestionTitle,
  QuizLayout,
} from '@/ui'

const OPTIONS = ['Sleep', 'Nutrition', 'Alone time', 'Your own goals', 'Emotional space']

/**
 * Layout twin of reference image 06-A (multi-select question), with Bloom placeholders: no
 * header, block centred above the CTA. Screenshot it at 1280x720 and compare by proportions.
 */
export function QuizMultiDemo() {
  const titleId = useId()
  const [selected, setSelected] = useState<string[]>(['Nutrition', 'Your own goals'])

  const toggle = (option: string, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, option] : current.filter((item) => item !== option),
    )

  return (
    <PageShell theme="lilac">
      <Card>
        <QuizLayout
          align="center"
          footer={<Button variant={selected.length > 0 ? 'primary' : 'disabled'}>Continue</Button>}
        >
          <QuestionTitle
            id={titleId}
            title="Which of these do you tend to sacrifice for others?"
            subtitle="Choose all that apply"
          />
          <CheckboxGroup aria-labelledby={titleId}>
            {OPTIONS.map((option) => (
              <CheckboxRow
                key={option}
                label={option}
                checked={selected.includes(option)}
                onCheckedChange={(checked) => toggle(option, checked)}
              />
            ))}
          </CheckboxGroup>
        </QuizLayout>
      </Card>
    </PageShell>
  )
}
