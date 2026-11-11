import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { LoaderScreen } from '@/screens/loader'
import { MultiSelectScreen } from '@/screens/multi'
import { SingleSelectScreen } from '@/screens/single'
import type { ScreenStep } from '@/screens/types'
import { WandScreen } from '@/screens/wand'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'
import { fakeSound } from '../helpers/sound'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

/**
 * Where the click of an answer sounds. A single choice clicks when the option is tapped; a multiple
 * choice stays silent while boxes are ticked and clicks when Continue sends the answer in (the wand
 * is one: its bubbles are silent and Continue clicks); the questions of the loader click like a
 * single choice. Nothing else makes the click: the engine behind it is tested in services/sound.
 */

const single = getStep('drained') as ScreenStep<'single'>
const multi = getStep('sacrifice') as ScreenStep<'multi'>
const wand = getStep('wand') as ScreenStep<'wand'>
const loader = getStep('loader') as ScreenStep<'loader'>

beforeEach(() => {
  resetNextNavigation()
})

describe('a single choice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('clicks once when an option is chosen, and not for a second tap while it leaves', () => {
    const { sound } = fakeSound()
    renderFunnel(<SingleSelectScreen step={single} onNext={() => {}} />, { sound })
    expect(sound.tap).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('radio', { name: 'Often' }))
    expect(sound.tap).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('radio', { name: 'Rarely' }))
    expect(sound.tap).toHaveBeenCalledTimes(1)
  })

  it('does not click for an answer that is only shown again after Back', () => {
    const { sound } = fakeSound()
    renderFunnel(<SingleSelectScreen step={single} onNext={() => {}} />, {
      sound,
      state: { answers: { drained: 'sometimes' }, furthest: 5 },
    })
    expect(screen.getByRole('radio', { name: 'Sometimes' })).toHaveAttribute('aria-checked', 'true')
    expect(sound.tap).not.toHaveBeenCalled()
  })
})

describe('a multiple choice', () => {
  it('is silent while boxes are ticked and clicks once on Continue', () => {
    const { sound } = fakeSound()
    const onNext = vi.fn()
    renderFunnel(<MultiSelectScreen step={multi} onNext={onNext} />, { sound })

    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Nutrition' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    expect(sound.tap).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(sound.tap).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('does not click for a Continue that is disabled', () => {
    const { sound } = fakeSound()
    renderFunnel(<MultiSelectScreen step={multi} onNext={() => {}} />, { sound })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(sound.tap).not.toHaveBeenCalled()
  })
})

describe('the wand', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is silent while bubbles are released and clicks once on Continue', () => {
    const { sound } = fakeSound()
    const onNext = vi.fn()
    renderFunnel(<WandScreen step={wand} onNext={onNext} />, { sound, state: { furthest: 8 } })

    for (const name of ['Self-doubt', 'Anxiety', 'Lack of motivation'])
      fireEvent.click(screen.getByRole('button', { name: `Release ${name}` }))
    expect(sound.tap).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(sound.tap).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})

describe('the loader', () => {
  beforeEach(() => {
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

  it('clicks when one of its questions is answered, and not before', () => {
    const { sound } = fakeSound()
    renderFunnel(<LoaderScreen step={loader} onNext={() => {}} />, {
      sound,
      state: { answers: {}, furthest: 37 },
    })
    // Advances frame by frame, so requestAnimationFrame keeps ticking.
    for (let elapsed = 0; elapsed < 4500; elapsed += 16) act(() => void vi.advanceTimersByTime(16))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(sound.tap).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(sound.tap).toHaveBeenCalledTimes(1)
  })
})
