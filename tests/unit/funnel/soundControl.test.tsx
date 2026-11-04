import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SoundControl } from '@/funnel/SoundControl'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'
import { fakeSound } from '../helpers/sound'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

beforeEach(() => {
  resetNextNavigation()
})

const toggle = () => screen.getByRole('button', { name: 'Sound' })

describe('SoundControl', () => {
  it('starts the funnel sound when it mounts and stops it when it goes', () => {
    const { sound, stop } = fakeSound()
    const { unmount } = renderFunnel(<SoundControl />, { sound })
    expect(sound.start).toHaveBeenCalledTimes(1)
    expect(stop).not.toHaveBeenCalled()
    unmount()
    expect(stop).toHaveBeenCalledTimes(1)
  })

  it('shows one switch named Sound, pressed while the sound is on', () => {
    const { sound } = fakeSound()
    renderFunnel(<SoundControl />, { sound })
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('turns the sound off and on again, and shows which', () => {
    const { sound } = fakeSound()
    renderFunnel(<SoundControl />, { sound })
    fireEvent.click(toggle())
    expect(sound.setMuted).toHaveBeenLastCalledWith(true)
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(toggle())
    expect(sound.setMuted).toHaveBeenLastCalledWith(false)
    expect(toggle()).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the choice the visitor made on an earlier visit', () => {
    const { sound } = fakeSound({ muted: true })
    renderFunnel(<SoundControl />, { sound })
    expect(toggle()).toHaveAttribute('aria-pressed', 'false')
  })

  it('draws a speaker with waves while on and with a cross while off', () => {
    const { sound } = fakeSound()
    renderFunnel(<SoundControl />, { sound })
    const paths = () =>
      Array.from(toggle().querySelectorAll('path')).map((p) => p.getAttribute('d'))
    const on = paths()
    expect(on).toHaveLength(2)
    fireEvent.click(toggle())
    const off = paths()
    expect(off).toHaveLength(2)
    expect(off[0]).toBe(on[0])
    expect(off[1]).not.toBe(on[1])
  })

  it('shows nothing where the browser cannot play sound', () => {
    const { sound } = fakeSound({ supported: false })
    renderFunnel(<SoundControl />, { sound })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('is named for assistive technology and keeps its drawing out of the way', () => {
    const { sound } = fakeSound()
    renderFunnel(<SoundControl />, { sound })
    expect(toggle()).toHaveTextContent('')
    expect(toggle().querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('SoundControl corner', () => {
  it.each([
    ['/s/intro', null],
    ['/s/drained', null],
    ['/s/sacrifice', null],
    ['/s/wand', null],
    ['/s/email', null],
    ['/s/paywall', 'top-left'],
    ['/s/checkout', 'top-left'],
    ['/s/pwyw', 'bottom-right'],
    ['/s/plan', 'bottom-right'],
    ['/s/loading', 'bottom-right'],
    ['/s/summary', 'bottom-right'],
  ])('on %s it sits in the %s corner (the top right when null)', (path, corner) => {
    const { sound } = fakeSound()
    renderFunnel(<SoundControl />, { sound, path })
    if (corner) expect(toggle()).toHaveAttribute('data-corner', corner)
    else expect(toggle()).not.toHaveAttribute('data-corner')
  })
})
