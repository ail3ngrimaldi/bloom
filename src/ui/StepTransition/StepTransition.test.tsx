import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StepTransition } from './StepTransition'
import { STEP_GAP_MS, STEP_IN_MS, STEP_OUT_MS, getStepTiming } from './timing'

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
// Each phase schedules the next one after React has re-rendered, so phases are advanced one by one.
const advancePhases = (...durations: number[]) => durations.forEach(advance)
const phase = () => document.querySelector('[data-phase]')?.getAttribute('data-phase')

function renderStep(key: string, onEntered?: (key: string | number) => void, appear = false) {
  const ui = (stepKey: string) => (
    <StepTransition stepKey={stepKey} onEntered={onEntered} appear={appear}>
      <p>content {stepKey}</p>
    </StepTransition>
  )
  const view = render(ui(key))
  return { ...view, goTo: (next: string) => view.rerender(ui(next)) }
}

describe('StepTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('exports the observed durations: 400 out, 150 gap, 300 in', () => {
    expect([STEP_OUT_MS, STEP_GAP_MS, STEP_IN_MS]).toEqual([400, 150, 300])
    expect(getStepTiming(false)).toEqual({ out: 400, gap: 150, in: 300 })
  })

  it('shows the first step immediately and reports it as entered', () => {
    const onEntered = vi.fn()
    renderStep('a', onEntered)
    expect(screen.getByText('content a')).toBeInTheDocument()
    expect(phase()).toBe('idle')
    expect(onEntered).toHaveBeenCalledTimes(1)
    expect(onEntered).toHaveBeenCalledWith('a')
  })

  it('fades the old step out for 400 ms, shows nothing for 150 ms, then fades the new one in for 300 ms', () => {
    const onEntered = vi.fn()
    const { goTo } = renderStep('a', onEntered)
    onEntered.mockClear()

    goTo('b')
    expect(phase()).toBe('out')
    expect(screen.getByText('content a')).toBeInTheDocument()
    expect(screen.queryByText('content b')).not.toBeInTheDocument()

    advance(STEP_OUT_MS - 1)
    expect(phase()).toBe('out')
    expect(screen.getByText('content a')).toBeInTheDocument()

    advance(1)
    expect(phase()).toBe('gap')
    expect(screen.queryByText('content a')).not.toBeInTheDocument()
    expect(screen.queryByText('content b')).not.toBeInTheDocument()

    advance(STEP_GAP_MS - 1)
    expect(phase()).toBe('gap')
    expect(screen.queryByText('content b')).not.toBeInTheDocument()

    advance(1)
    expect(phase()).toBe('in')
    expect(screen.getByText('content b')).toBeInTheDocument()
    expect(onEntered).not.toHaveBeenCalled()

    advance(STEP_IN_MS - 1)
    expect(phase()).toBe('in')
    expect(onEntered).not.toHaveBeenCalled()

    advance(1)
    expect(phase()).toBe('idle')
    expect(onEntered).toHaveBeenCalledTimes(1)
    expect(onEntered).toHaveBeenCalledWith('b')
  })

  it('takes 850 ms in total', () => {
    const onEntered = vi.fn()
    const { goTo } = renderStep('a', onEntered)
    onEntered.mockClear()
    goTo('b')
    advancePhases(STEP_OUT_MS, STEP_GAP_MS, STEP_IN_MS - 1)
    expect(onEntered).not.toHaveBeenCalled()
    advance(1)
    expect(onEntered).toHaveBeenCalledTimes(1)
  })

  it('makes the leaving content inert so it cannot be clicked mid-fade', () => {
    const { goTo } = renderStep('a')
    expect(document.querySelector('[data-phase]')).not.toHaveAttribute('inert')
    goTo('b')
    expect(document.querySelector('[data-phase]')).toHaveAttribute('inert')
    advancePhases(STEP_OUT_MS, STEP_GAP_MS)
    expect(document.querySelector('[data-phase]')).not.toHaveAttribute('inert')
  })

  it('ends on the latest step when the key changes mid-transition, skipping the one in between', () => {
    const onEntered = vi.fn()
    const { goTo } = renderStep('a', onEntered)
    onEntered.mockClear()

    goTo('b')
    advance(100)
    goTo('c')
    advancePhases(STEP_OUT_MS, STEP_GAP_MS)

    expect(screen.getByText('content c')).toBeInTheDocument()
    expect(screen.queryByText('content b')).not.toBeInTheDocument()
    advance(STEP_IN_MS)
    expect(onEntered).toHaveBeenCalledTimes(1)
    expect(onEntered).toHaveBeenCalledWith('c')
  })

  it('starts a new exit when the key changes while the new step is still fading in', () => {
    const { goTo } = renderStep('a')
    goTo('b')
    advancePhases(STEP_OUT_MS, STEP_GAP_MS, 100)
    expect(phase()).toBe('in')

    goTo('c')
    expect(phase()).toBe('out')
    expect(screen.getByText('content b')).toBeInTheDocument()
    advancePhases(STEP_OUT_MS, STEP_GAP_MS, STEP_IN_MS)
    expect(screen.getByText('content c')).toBeInTheDocument()
    expect(phase()).toBe('idle')
  })

  it('updates the content live when only the children change, with no transition', () => {
    const { rerender } = render(
      <StepTransition stepKey="a">
        <p>version 1</p>
      </StepTransition>,
    )
    rerender(
      <StepTransition stepKey="a">
        <p>version 2</p>
      </StepTransition>,
    )
    expect(phase()).toBe('idle')
    expect(screen.getByText('version 2')).toBeInTheDocument()
  })

  it('fades the old content out in its latest state', () => {
    const view = (label: string, key: string) => (
      <StepTransition stepKey={key}>
        <p>{label}</p>
      </StepTransition>
    )
    const { rerender } = render(view('selected: none', 'a'))
    rerender(view('selected: often', 'a'))
    rerender(view('next step', 'b'))
    expect(screen.getByText('selected: often')).toBeInTheDocument()
  })

  it('can fade the very first content in', () => {
    const onEntered = vi.fn()
    renderStep('a', onEntered, true)
    expect(phase()).toBe('in')
    expect(onEntered).not.toHaveBeenCalled()
    advance(STEP_IN_MS)
    expect(phase()).toBe('idle')
    expect(onEntered).toHaveBeenCalledWith('a')
  })

  it('clears its timers on unmount', () => {
    const onEntered = vi.fn()
    const { goTo, unmount } = renderStep('a', onEntered)
    onEntered.mockClear()
    goTo('b')
    unmount()
    advance(5000)
    expect(onEntered).not.toHaveBeenCalled()
  })

  describe('with prefers-reduced-motion', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
        })),
      )
    })
    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it('uses fades of at most 100 ms and no gap', () => {
      expect(getStepTiming()).toEqual({ out: 100, gap: 0, in: 100 })

      const onEntered = vi.fn()
      const { goTo } = renderStep('a', onEntered)
      onEntered.mockClear()
      goTo('b')
      advance(100)
      expect(phase()).toBe('gap')
      advance(0)
      expect(screen.getByText('content b')).toBeInTheDocument()
      advance(99)
      expect(onEntered).not.toHaveBeenCalled()
      advance(1)
      expect(onEntered).toHaveBeenCalledWith('b')
    })
  })
})
