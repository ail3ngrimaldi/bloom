import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('shows the Bloom wordmark by default', () => {
    render(<Header />)
    expect(screen.getByText('Bloom')).toBeInTheDocument()
  })

  it('accepts another product name', () => {
    render(<Header brandName="Acme" />)
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.queryByText('Bloom')).not.toBeInTheDocument()
  })

  it('has no progress bar unless a value is given', () => {
    render(<Header />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders the progress bar with the value, including zero', () => {
    const { rerender } = render(<Header progress={0} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    rerender(<Header progress={0.95} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '95')
  })

  it('is a banner-free header element so it can sit inside the card', () => {
    const { container } = render(<Header progress={0.5} />)
    expect(container.querySelector('header')).not.toBeNull()
  })
})
