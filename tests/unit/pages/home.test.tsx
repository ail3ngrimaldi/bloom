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

  it('links to the gallery and both question layouts while the gallery is on', () => {
    render(<HomePage />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/__gallery', '/__gallery/quiz-single', '/__gallery/quiz-multi'])
    expect(screen.getByRole('link', { name: 'Open the UI gallery' })).toBeInTheDocument()
  })

  it('hides the links in a production build without the gallery switch', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SHOW_GALLERY', '')
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: 'Bloom' })).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows the links in a production build with NEXT_PUBLIC_SHOW_GALLERY=1', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SHOW_GALLERY', '1')
    render(<HomePage />)
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })
})
