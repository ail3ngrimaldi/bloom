import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { ADVANCE_DELAY_MS } from '@/funnel/timing'
import { SingleSelectScreen } from '@/screens/single'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const single = (id: Parameters<typeof getStep>[0]) => getStep(id) as ScreenStep<'single'>

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('SingleSelectScreen', () => {
  it('shows the header with the step progress, the title and one radio per option', () => {
    renderFunnel(<SingleSelectScreen step={single('drained')} onNext={() => {}} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
    const group = screen.getByRole('radiogroup', {
      name: 'How often do you feel mentally or physically drained?',
    })
    expect(
      within(group)
        .getAllByRole('radio')
        .map((r) => r.textContent),
    ).toEqual(['Always', 'Often', 'Sometimes', 'Rarely'])
  })

  it('stores the answer, shows it selected at once and moves on 150 ms later, once', () => {
    const onNext = vi.fn()
    const { store, events } = renderFunnel(
      <SingleSelectScreen step={single('drained')} onNext={onNext} />,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'Often' }))
    expect(screen.getByRole('radio', { name: 'Often' })).toHaveAttribute('aria-checked', 'true')
    expect(store.getState().answers.drained).toBe('often')
    expect(events).toEqual([{ name: 'answer', id: 'drained', value: 'often' }])

    // A second click while leaving changes nothing.
    fireEvent.click(screen.getByRole('radio', { name: 'Rarely' }))
    expect(store.getState().answers.drained).toBe('often')

    act(() => void vi.advanceTimersByTime(ADVANCE_DELAY_MS - 1))
    expect(onNext).not.toHaveBeenCalled()
    act(() => void vi.advanceTimersByTime(1))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('shows the previous answer as selected when the user comes back', () => {
    renderFunnel(<SingleSelectScreen step={single('drained')} onNext={() => {}} />, {
      state: { answers: { drained: 'sometimes' }, furthest: 5 },
    })
    expect(screen.getByRole('radio', { name: 'Sometimes' })).toHaveAttribute('aria-checked', 'true')
  })

  it('fills the brand into the copy', () => {
    renderFunnel(<SingleSelectScreen step={single('expert_referral')} onNext={() => {}} />)
    expect(
      screen.getByRole('heading', { name: 'Did you hear about Bloom from an expert?' }),
    ).toBeInTheDocument()
  })

  it('adds the privacy notice and an opt-out to the health question only', () => {
    renderFunnel(<SingleSelectScreen step={single('adhd')} onNext={() => {}} />)
    expect(screen.getByRole('radio', { name: "I'd rather not say" })).toBeInTheDocument()
    expect(screen.getByText(/not a medical assessment/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute(
      'href',
      '/legal/privacy',
    )
  })

  it('has no privacy notice elsewhere', () => {
    renderFunnel(<SingleSelectScreen step={single('drained')} onNext={() => {}} />)
    expect(screen.queryByRole('link', { name: 'Privacy Policy' })).not.toBeInTheDocument()
  })
})
