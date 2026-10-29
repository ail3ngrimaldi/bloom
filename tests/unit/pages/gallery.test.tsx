import { render, screen, within } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GalleryPage from '@/app/gallery/page'
import QuizMultiPage from '@/app/gallery/quiz-multi/page'
import QuizSinglePage from '@/app/gallery/quiz-single/page'
import { NotFoundSignal, resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const PAGES: Array<[path: string, Page: () => ReactElement]> = [
  ['/__gallery', GalleryPage],
  ['/__gallery/quiz-single', QuizSinglePage],
  ['/__gallery/quiz-multi', QuizMultiPage],
]

beforeEach(() => {
  resetNextNavigation()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('gallery pages (dev tools on)', () => {
  it('renders every section of the gallery', () => {
    render(<GalleryPage />)
    expect(screen.getByRole('heading', { name: 'Bloom UI gallery' })).toBeInTheDocument()
    for (const name of [
      'Themes',
      'Header',
      'Button',
      'OptionCard',
      'CheckboxRow',
      'Modal',
      'StepTransition',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    }
  })

  it('links to the twins through the /__gallery URLs', () => {
    render(<GalleryPage />)
    expect(screen.getByRole('link', { name: 'quiz-single' })).toHaveAttribute(
      'href',
      '/__gallery/quiz-single',
    )
    expect(screen.getByRole('link', { name: 'quiz-multi' })).toHaveAttribute(
      'href',
      '/__gallery/quiz-multi',
    )
  })

  it('shows every button variant', () => {
    render(<GalleryPage />)
    expect(screen.getAllByRole('button', { name: 'Continue' }).length).toBeGreaterThanOrEqual(5)
    expect(screen.getByRole('button', { name: 'Please wait...' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    expect(
      screen
        .getAllByRole('button', { name: 'Continue' })
        .some((b) => (b as HTMLButtonElement).disabled),
    ).toBe(true)
  })

  it('shows header progress at 0, 20, 50 and 95 percent', () => {
    render(<GalleryPage />)
    const values = screen
      .getAllByRole('progressbar')
      .map((bar) => bar.getAttribute('aria-valuenow'))
    expect(values).toEqual(['0', '20', '50', '95'])
  })

  it('reproduces the single-select layout of reference image 03', () => {
    render(<QuizSinglePage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'How often do you feel mentally or physically drained?',
    )
    const group = screen.getByRole('radiogroup')
    expect(
      within(group)
        .getAllByRole('radio')
        .map((o) => o.textContent),
    ).toEqual(['Always', 'Often', 'Sometimes', 'Rarely'])
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
  })

  it('reproduces the multi-select layout of reference image 06 with two rows selected', () => {
    render(<QuizMultiPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Which of these do you tend to sacrifice for others?',
    )
    expect(screen.getByText('Choose all that apply')).toBeInTheDocument()
    const rows = screen.getAllByRole('checkbox')
    expect(rows.map((r) => r.textContent)).toEqual([
      'Sleep',
      'Nutrition',
      'Alone time',
      'Your own goals',
      'Emotional space',
    ])
    expect(rows.filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})

describe('gallery pages in production', () => {
  it.each(PAGES)('%s is a 404 in a production build', (_path, Page) => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEV_TOOLS', '')
    expect(() => Page()).toThrow(NotFoundSignal)
  })

  it.each(PAGES)('%s stays a 404 on production even with the switch set', (_path, Page) => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEV_TOOLS', '1')
    expect(() => Page()).toThrow(NotFoundSignal)
  })

  it.each(PAGES)('%s is a 404 on a preview deployment without the switch', (_path, Page) => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEV_TOOLS', '')
    expect(() => Page()).toThrow(NotFoundSignal)
  })

  it.each(PAGES)('%s renders on a preview deployment with the switch on', (_path, Page) => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview')
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEV_TOOLS', '1')
    expect(() => render(<Page />)).not.toThrow()
    expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
  })
})
