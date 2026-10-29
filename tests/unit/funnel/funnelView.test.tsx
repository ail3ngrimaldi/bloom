import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FunnelView, frameFor } from '@/funnel/FunnelView'
import { getStep } from '@/funnel/steps'
import StepPage, { generateStaticParams } from '@/app/s/[stepId]/page'
import { renderFunnel } from '../helpers/funnel'
import { NotFoundSignal, resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const frame = () => document.querySelector('[data-frame-step]')

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('FunnelView', () => {
  it('renders the step of the URL in its frame and tracks the view', () => {
    const { events } = renderFunnel(<FunnelView />, { path: '/s/drained', state: { furthest: 2 } })
    expect(
      screen.getByRole('heading', {
        name: 'How often do you feel mentally or physically drained?',
      }),
    ).toBeInTheDocument()
    expect(frame()).toHaveAttribute('data-frame-step', 'drained')
    expect(frame()).toHaveAttribute('data-variant', 'card')
    expect(events).toEqual([{ name: 'step_view', n: 2, id: 'drained' }])
  })

  it('tracks the funnel start on the intro, which has no card', () => {
    const { events } = renderFunnel(<FunnelView />, { path: '/s/intro' })
    expect(events.map((event) => event.name)).toEqual(['funnel_start', 'step_view'])
    expect(frame()).toHaveAttribute('data-variant', 'bare')
  })

  it('sends a visitor past the furthest step back there, replacing the history entry', () => {
    const { navigator } = renderFunnel(<FunnelView />, {
      path: '/s/paywall',
      state: { furthest: 3 },
    })
    expect(navigator.replace).toHaveBeenCalledWith('/s/overthink')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('lets ?qa through the guard while the dev tools are on', () => {
    const { navigator } = renderFunnel(<FunnelView />, { path: '/s/age?qa' })
    expect(navigator.replace).not.toHaveBeenCalled()
    expect(screen.getByRole('heading', { name: 'What is your age?' })).toBeInTheDocument()
  })

  it('advances to the next step after an answer and records how far the visitor got', () => {
    const { navigator, store, rerenderFunnel } = renderFunnel(<FunnelView />, {
      path: '/s/drained',
      state: { furthest: 2 },
    })
    fireEvent.click(screen.getByRole('radio', { name: 'Often' }))
    act(() => void vi.advanceTimersByTime(150))
    expect(navigator.push).toHaveBeenCalledWith('/s/overthink')
    expect(store.getState().furthest).toBe(3)

    rerenderFunnel(<FunnelView />)
    // Old content fades out for 400 ms, then the frame swaps and the new step fades in.
    act(() => void vi.advanceTimersByTime(400))
    act(() => void vi.advanceTimersByTime(150))
    expect(screen.getByRole('heading', { name: 'Do you overthink?' })).toBeInTheDocument()
  })

  it('moves focus to the new heading after a step change', () => {
    const { rerenderFunnel } = renderFunnel(<FunnelView />, {
      path: '/s/drained',
      state: { furthest: 3 },
    })
    act(() => void vi.advanceTimersByTime(300))
    fireEvent.click(screen.getByRole('radio', { name: 'Often' }))
    act(() => void vi.advanceTimersByTime(150))
    rerenderFunnel(<FunnelView />)
    for (const ms of [400, 150, 300]) act(() => void vi.advanceTimersByTime(ms))
    expect(screen.getByRole('heading', { name: 'Do you overthink?' })).toHaveFocus()
  })

  it('swaps the frame only once the old step has faded out', () => {
    const { rerenderFunnel } = renderFunnel(<FunnelView />, {
      path: '/s/juggling',
      state: { furthest: 7 },
    })
    act(() => void vi.advanceTimersByTime(300))
    fireEvent.click(screen.getByRole('radio', { name: 'Yes' }))
    act(() => void vi.advanceTimersByTime(150))
    rerenderFunnel(<FunnelView />)
    expect(frame()).toHaveAttribute('data-frame-step', 'juggling')
    act(() => void vi.advanceTimersByTime(399))
    expect(frame()).toHaveAttribute('data-variant', 'card')
    act(() => void vi.advanceTimersByTime(1))
    expect(frame()).toHaveAttribute('data-frame-step', 'wand')
    expect(frame()).toHaveAttribute('data-variant', 'bare')
  })
})

describe('frameFor', () => {
  it('puts questions and capture on the card and everything else on the page', () => {
    expect(frameFor(getStep('drained'))).toBe('card')
    expect(frameFor(getStep('sacrifice'))).toBe('card')
    expect(frameFor(getStep('email'))).toBe('card')
    for (const id of ['intro', 'wand', 'science', 'summary', 'loader', 'paywall'] as const)
      expect(frameFor(getStep(id)), id).toBe('bare')
  })
})

describe('/s/[stepId] page', () => {
  it('prerenders every step and nothing else', () => {
    expect(generateStaticParams()).toHaveLength(42)
    expect(generateStaticParams()[0]).toEqual({ stepId: 'intro' })
  })

  it('404s an unknown step', async () => {
    const props = { params: Promise.resolve({ stepId: 'nope' }), searchParams: Promise.resolve({}) }
    await expect(StepPage(props)).rejects.toThrow(NotFoundSignal)
  })
})
