import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import type { Answers } from '@/funnel/types'
import { SummaryScreen } from '@/screens/summary'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const summary = getStep('summary') as ScreenStep<'summary'>

const HARD: Answers = {
  drained: 'often',
  overthink: 'often',
  sleep: 'often',
  selfcare: 'often',
  phone: 'often',
  juggling: 'yes',
  procrastinate: 'always',
  concentration: 'always',
  others_needs: 'often',
  others_expect: 'often',
  say_no: 'often',
  adhd: 'diagnosed',
  control_life: 'few_weeks',
  wand: ['self_doubt', 'anxiety', 'lack_of_motivation'],
  gender: 'male',
}

function renderSummary(answers: Answers) {
  const onNext = vi.fn()
  renderFunnel(<SummaryScreen step={summary} onNext={onNext} />, {
    state: { answers, furthest: 36 },
  })
  return onNext
}

const tile = (label: string) => screen.getByText(label).parentElement!.lastElementChild!.textContent

beforeEach(() => {
  resetNextNavigation()
})

describe('SummaryScreen', () => {
  it('shows the level, the meter, the alert and the four tiles of the recorded walkthrough', () => {
    const onNext = renderSummary(HARD)
    expect(
      screen.getByRole('heading', { name: 'Summary of your Well-being Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
    const meter = screen.getByRole('meter', { name: 'Negative effects level' })
    expect(Number(meter.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(66)
    expect(meter).toHaveAttribute('aria-valuetext', 'Negative effects level: High')
    expect(screen.getByText('HIGH level')).toBeInTheDocument()
    expect(tile('Main difficulty:')).toBe('Manage ADHD')
    expect(tile('Challenging period:')).toBe('Few weeks')
    expect(tile('Trigger:')).toBe('Anxiety')
    expect(tile('Energy level:')).toBe('Low')
    expect(screen.getByText(/Not a medical assessment/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('adapts the level and its alert to calmer answers', () => {
    renderSummary({ drained: 'rarely', overthink: 'rarely', sleep: 'sometimes', adhd: 'no' })
    expect(screen.getByText('Low')).toBeInTheDocument()
    expect(screen.getByText('LOW level')).toBeInTheDocument()
    expect(tile('Energy level:')).toBe('Good')
  })

  it('does not turn a suspected ADHD into a diagnosis', () => {
    renderSummary({ ...HARD, adhd: 'suspect' })
    expect(tile('Main difficulty:')).toBe('Focus and attention')
  })
})
