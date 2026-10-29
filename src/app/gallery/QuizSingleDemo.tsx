import { useState } from 'react'
import { Card, Header, OptionCard, PageShell, QuestionTitle, QuizLayout, RadioGroup } from '@/ui'

const OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely']

/**
 * Layout twin of reference image 03 (single-select question), with Bloom placeholders.
 * Screenshot it at 1280x720 and compare by proportions.
 */
export function QuizSingleDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <PageShell theme="lilac">
      <Card>
        <QuizLayout header={<Header progress={1 / 39} />}>
          {/* Inter is narrower than the reference face, so the break the reference gets from its
              wider glyphs is explicit here to keep the same two-line shape. */}
          <QuestionTitle
            title={
              <>
                How often do you feel <br />
                mentally or physically drained?
              </>
            }
          />
          <RadioGroup aria-label="Answer" value={value} onValueChange={setValue}>
            {OPTIONS.map((option) => (
              <OptionCard key={option} value={option} label={option} />
            ))}
          </RadioGroup>
        </QuizLayout>
      </Card>
    </PageShell>
  )
}
