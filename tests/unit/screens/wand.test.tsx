import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import type { ScreenStep } from '@/screens/types'
import { WandScreen } from '@/screens/wand'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const wand = getStep('wand') as ScreenStep<'wand'>

function renderWand() {
  const onNext = vi.fn()
  const view = renderFunnel(<WandScreen step={wand} onNext={onNext} />, { state: { furthest: 8 } })
  return { ...view, onNext }
}

const bubble = (name: string) => screen.getByRole('button', { name: `Release ${name}` })
const live = () => document.querySelector('[aria-live="polite"]')

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('WandScreen', () => {
  it('starts with the title, the five bubbles as buttons and an empty counter', () => {
    renderWand()
    expect(screen.getByRole('heading', { name: 'If you had a magic wand...' })).toBeInTheDocument()
    expect(screen.getByText("Tap 3 things you'd make vanish")).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Release / }).map((b) => b.textContent)).toEqual([
      'Anxiety',
      'Self-doubt',
      'Burnout',
      'Loneliness',
      'Lack of motivation',
    ])
    expect(screen.getByText('0 / 3 released')).toBeInTheDocument()
    expect(live()).toHaveTextContent('')
  })

  it('counts each release at once, announces it and removes the bubble', () => {
    const { events } = renderWand()
    fireEvent.click(bubble('Self-doubt'))
    expect(screen.getByText('1 / 3 released')).toBeInTheDocument()
    expect(live()).toHaveTextContent('1 of 3 released')
    expect(screen.queryByRole('button', { name: 'Release Self-doubt' })).not.toBeInTheDocument()
    expect(document.querySelector('[data-burst="self_doubt"]')).toBeInTheDocument()
    expect(events).toEqual([{ name: 'wand_release', label: 'self_doubt', count: 1 }])
  })

  it('finishes after three: stores them in tap order, swaps the title and shows a white Continue', () => {
    const { store, onNext } = renderWand()
    fireEvent.click(bubble('Self-doubt'))
    fireEvent.click(bubble('Anxiety'))
    expect(store.getState().answers.wand).toBeUndefined()
    fireEvent.click(bubble('Lack of motivation'))

    expect(store.getState().answers.wand).toEqual(['self_doubt', 'anxiety', 'lack_of_motivation'])
    expect(screen.getByRole('heading', { name: 'Feel that lightness' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText("and know it's possible")).toBeInTheDocument()
    expect(live()).toHaveTextContent('3 of 3 released')

    const cta = screen.getByRole('button', { name: 'Continue' })
    fireEvent.click(cta)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('takes no more than three releases', () => {
    const { events } = renderWand()
    for (const name of ['Anxiety', 'Burnout', 'Loneliness']) fireEvent.click(bubble(name))
    // The two left are inert now, and a click on them changes nothing.
    fireEvent.click(bubble('Self-doubt'))
    expect(events.filter((event) => event.name === 'wand_release')).toHaveLength(3)
    expect(document.querySelector('[inert]')).toBeInTheDocument()
  })

  it('keeps keyboard focus in the cluster, then moves it to Continue', () => {
    renderWand()
    bubble('Anxiety').focus()
    // A click fired from the keyboard has detail 0.
    fireEvent.click(bubble('Anxiety'), { detail: 0 })
    expect(bubble('Self-doubt')).toHaveFocus()
    fireEvent.click(bubble('Self-doubt'), { detail: 0 })
    fireEvent.click(bubble('Burnout'), { detail: 0 })
    act(() => void vi.advanceTimersByTime(0))
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus()
  })
})
