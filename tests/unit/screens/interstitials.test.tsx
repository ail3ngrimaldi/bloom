import { act, fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import type { StepId } from '@/funnel/steps'
import { InterstitialScreen, MATCH_TIMELINE } from '@/screens/inter'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const inter = (id: StepId) => getStep(id) as ScreenStep<'inter'>

function renderInter(id: StepId, gender?: string) {
  const onNext = vi.fn()
  const view = renderFunnel(<InterstitialScreen step={inter(id)} onNext={onNext} />, {
    state: { answers: gender ? { gender } : {}, furthest: inter(id).n },
  })
  return { ...view, onNext }
}

// Wording of the reference's claims that Bloom has no evidence for (PLAN 2, guardrails 1 to 3).
const REFERENCE_CLAIMS =
  /million|as featured|new york times|wired|forbes|girlboss|healthline|stanford|duke|harvard|jazmin|reviewed by|psych one/i

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('interstitials', () => {
  it.each(['science', 'not_alone', 'evidence', 'expert'] as const)(
    '%s keeps its CTA disabled for 0.5 s, then it continues',
    (id) => {
      const { onNext } = renderInter(id)
      const cta = screen.getByRole('button', { name: 'Continue' })
      expect(cta).toBeDisabled()
      act(() => void vi.advanceTimersByTime(499))
      expect(cta).toBeDisabled()
      act(() => void vi.advanceTimersByTime(1))
      expect(cta).toBeEnabled()
      fireEvent.click(cta)
      expect(onNext).toHaveBeenCalledTimes(1)
    },
  )

  it.each(['science', 'match', 'not_alone', 'evidence', 'expert'] as const)(
    '%s shows none of the reference claims and one heading',
    (id) => {
      const { container } = renderInter(id, 'male')
      expect(container.textContent).not.toMatch(REFERENCE_CLAIMS)
      expect(container.textContent).not.toMatch(/\{\{/)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    },
  )

  it('#17 speaks to the audience of the gender answer', () => {
    renderInter('science', 'male')
    expect(screen.getByRole('heading', { name: 'The Science of a Better You' })).toBeInTheDocument()
    expect(screen.getByText('Made for men like you')).toBeInTheDocument()
  })

  it('#17 falls back to "people" without a gender answer', () => {
    renderInter('science')
    expect(screen.getByText('Made for people like you')).toBeInTheDocument()
  })

  it('#26 personalises its text with the audience and the brand', () => {
    renderInter('not_alone', 'female')
    expect(screen.getByRole('heading', { name: 'You are not alone' })).toBeInTheDocument()
    expect(screen.getByText(/Many women feel just like you\. Bloom guides you/)).toBeInTheDocument()
  })

  it('#30 lists three practices instead of university logos', () => {
    renderInter('evidence')
    expect(
      screen.getByRole('heading', {
        name: 'Bloom is built on evidence-based psychological practices',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Habit formationPRACTICE',
      'Cognitive reframingPRACTICE',
      'MindfulnessPRACTICE',
    ])
  })

  it('#31 describes the approach and shows the three chips, with no reviewer', () => {
    renderInter('expert')
    expect(
      screen.getByRole('heading', { name: 'Your plan is shaped by how you think, feel and act' }),
    ).toBeInTheDocument()
    for (const chip of ['Thoughts', 'Feelings', 'Behavior'])
      expect(screen.getByText(chip)).toBeInTheDocument()
  })

  it('#25 enables its CTA once the match animation has shown it', () => {
    const { onNext } = renderInter('match')
    expect(screen.getByRole('heading', { name: "It's a match." })).toBeInTheDocument()
    expect(screen.getByText('You and Bloom')).toBeInTheDocument()
    const cta = screen.getByRole('button', { name: 'Continue' })
    act(() => void vi.advanceTimersByTime(MATCH_TIMELINE.rest + 499))
    expect(cta).toBeDisabled()
    act(() => void vi.advanceTimersByTime(1))
    expect(cta).toBeEnabled()
    fireEvent.click(cta)
    expect(onNext).toHaveBeenCalledTimes(1)
  })
})
