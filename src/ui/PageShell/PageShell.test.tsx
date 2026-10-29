import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageShell } from './PageShell'
import type { PageTheme } from './PageShell'

const THEMES: PageTheme[] = ['lilac', 'soft', 'dark', 'warm', 'white']

describe('PageShell', () => {
  it('renders its child and defaults to the lilac theme', () => {
    render(
      <PageShell data-testid="shell">
        <p>child</p>
      </PageShell>,
    )
    expect(screen.getByText('child')).toBeInTheDocument()
    expect(screen.getByTestId('shell')).toHaveAttribute('data-theme', 'lilac')
  })

  it('gives each of the five themes its own class and data-theme', () => {
    const classes = THEMES.map((theme) => {
      const { unmount } = render(<PageShell theme={theme} data-testid="shell" />)
      const element = screen.getByTestId('shell')
      expect(element).toHaveAttribute('data-theme', theme)
      const className = element.className
      unmount()
      return className
    })
    expect(new Set(classes).size).toBe(THEMES.length)
  })

  it('merges a custom class name', () => {
    render(<PageShell data-testid="shell" className="extra" />)
    expect(screen.getByTestId('shell')).toHaveClass('extra')
  })
})
