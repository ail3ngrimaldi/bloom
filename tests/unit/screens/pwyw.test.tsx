import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { PwywScreen } from '@/screens/pwyw'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const pwyw = getStep('pwyw') as ScreenStep<'pwyw'>

function renderPwyw(state: Parameters<typeof renderFunnel>[1] = {}) {
  const onNext = vi.fn()
  const view = renderFunnel(<PwywScreen step={pwyw} onNext={onNext} />, {
    path: '/s/pwyw',
    ...state,
    state: { furthest: 41, lead: { email: 'qa@example.com', name: 'Sam' }, ...state.state },
  })
  return { ...view, onNext }
}

const tiles = () => within(screen.getByRole('radiogroup')).getAllByRole('radio')

beforeEach(() => {
  resetNextNavigation()
})

describe('PwywScreen (#41, PLAN-B 4.1)', () => {
  it('shows the title, the two paragraphs and the company cost (claim C8)', () => {
    renderPwyw()
    expect(screen.getByRole('heading', { level: 1, name: 'Pay what you want' })).toBeInTheDocument()
    expect(
      screen.getByText(
        "Money shouldn't stay in the way of finding a plan that finally works. Choose an amount that you think is reasonable to try us out for two weeks.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'It costs us $16.41 to compensate our employees for the trial, but please choose the amount you are comfortable with.',
      ),
    ).toBeInTheDocument()
  })

  it('offers $2.00, $10.00 and $16.41 as a radio group, the last one most popular and chosen', () => {
    renderPwyw()
    expect(
      screen.getByRole('radiogroup', { name: 'Choose what you pay today for the trial' }),
    ).toBeInTheDocument()
    expect(tiles().map((tile) => tile.getAttribute('aria-label'))).toEqual([
      '$2.00',
      '$10.00',
      '$16.41, most popular',
    ])
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument()
    expect(tiles().map((tile) => tile.getAttribute('aria-checked'))).toEqual([
      'false',
      'false',
      'true',
    ])
  })

  it('marks the chosen amount, keeps it for the plan sheet and tracks the choice', () => {
    const { store, events } = renderPwyw()
    fireEvent.click(tiles()[0])
    expect(tiles().map((tile) => tile.getAttribute('aria-checked'))).toEqual([
      'true',
      'false',
      'false',
    ])
    expect(store.getState().trialAmount).toBe(2)
    expect(events).toContainEqual({ name: 'pwyw_select', amount: 2 })
    fireEvent.click(tiles()[1])
    expect(store.getState().trialAmount).toBe(10)
  })

  it('restores the amount chosen before a reload', () => {
    renderPwyw({ state: { trialAmount: 10 } })
    expect(tiles().map((tile) => tile.getAttribute('aria-checked'))).toEqual([
      'false',
      'true',
      'false',
    ])
  })

  it('takes the preselected amount to the sheet even if the visitor never touched the tiles', () => {
    const { store, onNext } = renderPwyw()
    fireEvent.click(screen.getByRole('button', { name: 'See my plan' }))
    expect(store.getState().trialAmount).toBe(16.41)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('shows the visitor’s name in the header, or a generic label without one', () => {
    renderPwyw()
    expect(screen.getByText('Sam')).toBeInTheDocument()
    renderPwyw({ state: { lead: { email: '', name: '' } } })
    expect(screen.getByText('My account')).toBeInTheDocument()
  })

  it('does not reproduce the debug tooltip of the reference and labels its prices as demo data', () => {
    const { container } = renderPwyw()
    expect(container.textContent).not.toMatch(/pwyw ?pwywPage/i)
    expect(screen.getByText(/Demo prices/)).toBeInTheDocument()
  })

  it('tracks the view of the page', () => {
    const { events } = renderPwyw()
    expect(events).toContainEqual({ name: 'pwyw_view' })
  })
})
