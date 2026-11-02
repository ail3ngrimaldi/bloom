import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { LoaderScreen } from '@/screens/loader'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const loader = getStep('loader') as ScreenStep<'loader'>

const values = () =>
  screen.getAllByRole('progressbar').map((bar) => Number(bar.getAttribute('aria-valuenow')))

/** Advances the fake clock frame by frame, so requestAnimationFrame keeps ticking. */
function play(ms: number) {
  for (let elapsed = 0; elapsed < ms; elapsed += 16) act(() => void vi.advanceTimersByTime(16))
}

function renderLoader(answers = {}) {
  const onNext = vi.fn()
  const view = renderFunnel(<LoaderScreen step={loader} onNext={onNext} />, {
    state: { answers, furthest: 37 },
  })
  return { ...view, onNext }
}

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers({
    toFake: [
      'setTimeout',
      'clearTimeout',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
    ],
  })
})
afterEach(() => {
  vi.useRealTimers()
})

describe('LoaderScreen', () => {
  it('fills the bars in order, waits on each question and moves on by itself at the end', () => {
    const { onNext, store, events } = renderLoader()
    expect(
      screen.getByRole('heading', { name: 'Creating your Personalized Plan' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar').map((bar) => bar.getAttribute('aria-label'))).toEqual(
      ['Setting goals', 'Selecting strategies', 'Saving plan'],
    )

    play(2000)
    const [first] = values()
    expect(first).toBeGreaterThan(20)
    expect(first).toBeLessThan(50)

    play(2500)
    const question = screen.getByRole('dialog', {
      name: 'Are you generally rushed in the mornings?',
    })
    expect(values()).toEqual([50, 0, 0])

    // Nothing moves while the question is open.
    play(3000)
    expect(values()).toEqual([50, 0, 0])
    expect(onNext).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(question).not.toBeInTheDocument()
    expect(store.getState().answers.rushed_mornings).toBe('yes')
    expect(events).toContainEqual({
      name: 'loader_modal_answer',
      id: 'rushed_mornings',
      value: 'yes',
    })

    play(2300 + 300 + 2100)
    expect(
      screen.getByRole('dialog', { name: 'Have you heard of habit stacking?' }),
    ).toBeInTheDocument()
    expect(values()).toEqual([100, 58, 0])
    fireEvent.click(screen.getByRole('button', { name: 'No' }))

    play(1000 + 300 + 2000 + 700)
    expect(values()).toEqual([100, 100, 100])
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(store.getState().answers.heard_habit_stacking).toBe('no')
  })

  it('does not ask again questions answered before', () => {
    const { onNext } = renderLoader({ rushed_mornings: 'no', heard_habit_stacking: 'yes' })
    play(13_000)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('shows the three testimonials of the reference under the bars (guardrail 3)', () => {
    renderLoader()
    const region = screen.getByRole('region', { name: 'What members say' })
    const articles = within(region).getAllByRole('article')
    expect(articles).toHaveLength(3)
    expect(articles.map((article) => within(article).getByRole('heading').textContent)).toEqual([
      'This app is truly amazing! - Alice L.',
      'This app literally changed my life - Tara M.',
      'Bloom is an absolute amazing tool to have & apply in your life! - Remi L.',
    ])
    expect(
      within(articles[0]).getByText(/^I love it because it keeps me very motivated/),
    ).toBeInTheDocument()
    expect(
      within(articles[1]).getByText(
        'I had found myself at the deep end. You pulled me out, I am sincerely grateful.',
      ),
    ).toBeInTheDocument()
    expect(
      within(articles[2]).getByText(/^I've been using Bloom for at least 5 years\./),
    ).toBeInTheDocument()
    for (const article of articles)
      expect(within(article).getByRole('img', { name: '5 out of 5 stars' })).toBeInTheDocument()
  })

  it('names the product of the reference nowhere in the testimonials', () => {
    const { container } = renderLoader()
    expect(container.textContent).not.toMatch(/fabulous/i)
  })
})
