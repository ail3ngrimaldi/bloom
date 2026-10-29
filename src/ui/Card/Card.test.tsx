import { render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders its children in a div that takes the card class', () => {
    render(<Card data-testid="card">content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveTextContent('content')
    expect(card.tagName).toBe('DIV')
    expect(card.className).toMatch(/card/)
  })

  it('merges a custom class name and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Card ref={ref} data-testid="card" className="extra">
        x
      </Card>,
    )
    expect(ref.current).toBe(screen.getByTestId('card'))
    expect(ref.current).toHaveClass('extra')
  })

  it('has no inline sizing: width, height and radius come from tokens (see card.responsive.test.ts)', () => {
    render(<Card data-testid="card">x</Card>)
    expect(screen.getByTestId('card')).not.toHaveAttribute('style')
  })
})
