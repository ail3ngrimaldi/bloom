import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import type { StepId } from '@/funnel/steps'
import { CaptureScreen } from '@/screens/capture'
import { LOADING_MS, LoadingScreen } from '@/screens/loading'
import type { ScreenStep } from '@/screens/types'
import type { LeadService } from '@/services/lead/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const capture = (id: StepId) => getStep(id) as ScreenStep<'capture'>

function renderCapture(
  id: 'email' | 'name',
  { leads, lead }: { leads?: LeadService; lead?: { email: string; name: string } } = {},
) {
  const onNext = vi.fn()
  const view = renderFunnel(<CaptureScreen step={capture(id)} onNext={onNext} />, {
    state: { furthest: 39, answers: { adhd: 'diagnosed', drained: 'often' }, lead },
    leads,
  })
  return { ...view, onNext, input: screen.getByRole('textbox') }
}

beforeEach(() => {
  resetNextNavigation()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('email capture (#38)', () => {
  it('names the field by the title, shows the progress at about 95 % and a placeholder', () => {
    const { input } = renderCapture('email')
    expect(screen.getByRole('textbox', { name: 'Please enter your email' })).toBe(input)
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('autocomplete', 'email')
    expect(input).toHaveAccessibleDescription('To save your progress...')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '95')
  })

  it('reports an invalid email on submit, tied to the field, and clears it once fixed', () => {
    const { input, onNext } = renderCapture('email')
    fireEvent.change(input, { target: { value: 'nope' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onNext).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
    expect(input).toHaveAccessibleDescription(
      'To save your progress... Please enter a valid email address.',
    )
    expect(input).toHaveFocus()

    fireEvent.change(input, { target: { value: 'qa@example.com' } })
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('stores the trimmed email and moves on', () => {
    const { input, onNext, store } = renderCapture('email')
    fireEvent.change(input, { target: { value: '  qa@example.com ' } })
    fireEvent.submit(input.closest('form')!)
    expect(store.getState().lead.email).toBe('qa@example.com')
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('comes back filled in', () => {
    const { input } = renderCapture('email', { lead: { email: 'old@example.com', name: '' } })
    expect(input).toHaveValue('old@example.com')
  })
})

describe('name capture (#39)', () => {
  it('rejects an empty name', () => {
    const { input, onNext } = renderCapture('name')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.closest('form')!)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter your name (up to 40 characters).',
    )
    expect(onNext).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('maxlength', '40')
  })

  it('shows "Please wait..." while the lead is sent without health data, then moves on', async () => {
    let finish: () => void = () => {}
    const submit = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    const { input, onNext, events } = renderCapture('name', {
      leads: { submit },
      lead: { email: 'qa@example.com', name: '' },
    })
    fireEvent.change(input, { target: { value: ' Sam ' } })
    fireEvent.submit(input.closest('form')!)

    const cta = screen.getByRole('button', { name: 'Please wait...' })
    expect(cta).toHaveAttribute('aria-busy', 'true')
    expect(input).toHaveAttribute('readonly')
    expect(submit).toHaveBeenCalledTimes(1)
    const [submission] = submit.mock.calls[0] as unknown as [Parameters<LeadService['submit']>[0]]
    expect(submission.lead).toEqual({ email: 'qa@example.com', name: 'Sam' })
    expect(submission.answers).toEqual({ drained: 'often' })

    await act(async () => finish())
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(events).toContainEqual({ name: 'lead_submit' })
  })

  it('lets the user retry when sending fails', async () => {
    const submit = vi.fn(() => Promise.reject(new Error('offline')))
    const { input, onNext } = renderCapture('name', { leads: { submit } })
    fireEvent.change(input, { target: { value: 'Sam' } })
    await act(async () => void fireEvent.submit(input.closest('form')!))
    expect(onNext).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong. Please try again.')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
})

describe('loading (#40)', () => {
  it('shows the brand loader and moves on by itself within 1.5 s', () => {
    vi.useFakeTimers()
    const onNext = vi.fn()
    renderFunnel(
      <LoadingScreen step={getStep('loading') as ScreenStep<'loading'>} onNext={onNext} />,
    )
    expect(screen.getByRole('heading', { name: 'Preparing your plan...' })).toBeInTheDocument()
    act(() => void vi.advanceTimersByTime(LOADING_MS - 1))
    expect(onNext).not.toHaveBeenCalled()
    act(() => void vi.advanceTimersByTime(1))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(LOADING_MS).toBeLessThanOrEqual(1500)
  })
})
