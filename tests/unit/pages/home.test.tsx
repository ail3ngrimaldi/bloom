import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomePage from '@/app/page'

describe('home page (/)', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('renders the product name', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: 'Bloom' })).toBeInTheDocument()
  })

  it('links to the gallery while dev tools are on', () => {
    render(<HomePage />)
    expect(screen.getByRole('link', { name: 'Open the UI gallery' })).toHaveAttribute(
      'href',
      '/__gallery',
    )
  })

  it('hides the gallery link in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: 'Bloom' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
