import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QuizLayout } from './QuizLayout'

describe('QuizLayout', () => {
  it('renders header, body and footer in that order', () => {
    render(
      <QuizLayout header={<header>head</header>} footer={<button type="button">cta</button>}>
        <p>body</p>
      </QuizLayout>,
    )
    const head = screen.getByText('head')
    const body = screen.getByText('body')
    const cta = screen.getByRole('button', { name: 'cta' })
    expect(head.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(body.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('omits the footer wrapper when there is no footer', () => {
    const { container } = render(
      <QuizLayout>
        <p>body</p>
      </QuizLayout>,
    )
    expect(container.firstElementChild?.children).toHaveLength(1)
  })

  it('marks layouts that have a header so the title lands at +124', () => {
    const { container, rerender } = render(
      <QuizLayout header={<header>head</header>}>
        <p>body</p>
      </QuizLayout>,
    )
    expect(container.firstElementChild).toHaveAttribute('data-has-header')
    rerender(
      <QuizLayout>
        <p>body</p>
      </QuizLayout>,
    )
    expect(container.firstElementChild).not.toHaveAttribute('data-has-header')
  })
})
