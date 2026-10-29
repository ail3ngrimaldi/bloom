import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuestionTitle } from './QuestionTitle'

describe('QuestionTitle', () => {
  it('renders the title as the level 1 heading', () => {
    render(<QuestionTitle title="Do you overthink?" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Do you overthink?' })).toBeInTheDocument()
  })

  it('renders the subtitle only when given', () => {
    const { rerender } = render(<QuestionTitle title="What is your gender?" />)
    expect(screen.queryByText('We will use this to personalize your plan')).not.toBeInTheDocument()
    rerender(
      <QuestionTitle
        title="What is your gender?"
        subtitle="We will use this to personalize your plan"
      />,
    )
    expect(screen.getByText('We will use this to personalize your plan')).toBeInTheDocument()
  })

  it('passes an id through so a group can be labelled by it', () => {
    render(<QuestionTitle id="q-title" title="Question" />)
    expect(document.getElementById('q-title')).toContainElement(
      screen.getByRole('heading', { name: 'Question' }),
    )
  })
})
