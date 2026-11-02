import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLAIMS } from '@/funnel/claims'
import { getStep } from '@/funnel/steps'
import type { StepId } from '@/funnel/steps'
import type { Answers } from '@/funnel/types'
import { InterstitialScreen, MATCH_TIMELINE } from '@/screens/inter'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const inter = (id: StepId) => getStep(id) as ScreenStep<'inter'>

function renderInter(id: StepId, gender?: string, extra: Answers = {}) {
  const onNext = vi.fn()
  const answers = { ...(gender ? { gender } : {}), ...extra }
  const view = renderFunnel(<InterstitialScreen step={inter(id)} onNext={onNext} />, {
    state: { answers, furthest: inter(id).n },
  })
  return { ...view, onNext }
}

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
    '%s leaves no placeholder and has one heading',
    (id) => {
      const { container } = renderInter(id, 'male')
      expect(container.textContent).not.toMatch(/\{\{/)
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    },
  )

  it('#17 shows the user count and the press of the reference (claims C1 and C2)', () => {
    renderInter('science', 'male')
    expect(screen.getByRole('heading', { name: 'The Science of a Better You' })).toBeInTheDocument()
    expect(screen.getByText(`Join over ${CLAIMS.users.value} men`)).toBeInTheDocument()
    expect(
      screen.getByText(/^Who transformed their lives using science-backed/),
    ).toBeInTheDocument()
    const press = screen.getByRole('list', { name: 'As featured on:' })
    expect(
      within(press)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(CLAIMS.press.quiz)
  })

  it('#17 speaks to people without a gender answer', () => {
    renderInter('science')
    expect(screen.getByText('Join over 30 million people')).toBeInTheDocument()
  })

  it('#26 shows the user count with the audience and the brand (claim C1)', () => {
    renderInter('not_alone', 'female')
    expect(screen.getByRole('heading', { name: 'You are not alone' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'Bloom has guided more than 30 million women towards a happier healthier life using simple behavioral science techniques.',
      ),
    ).toBeInTheDocument()
  })

  it('#30 lists the three universities of the reference (claim C3)', () => {
    renderInter('evidence')
    expect(
      screen.getByRole('heading', {
        name: 'Bloom was developed using evidence-based psychological practices',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Your plan is based on decades of research')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'STANFORDUNIVERSITY',
      'DUKEUNIVERSITY',
      'HARVARDUNIVERSITY',
    ])
  })

  it('#30 closes with a phrase that depends on the bubbles released in the wand', () => {
    const burnout = renderInter('evidence', undefined, {
      wand: ['self_doubt', 'burnout', 'anxiety'],
    })
    expect(
      screen.getByText('Your habit building plan will also help you overcome burnout.'),
    ).toBeInTheDocument()
    burnout.unmount()

    renderInter('evidence', undefined, { wand: ['self_doubt', 'anxiety', 'lack_of_motivation'] })
    expect(
      screen.getByText(
        'Your habit building plan will also help you overcome anxiety and neutralize your procrastination tendencies.',
      ),
    ).toBeInTheDocument()
  })

  it('#31 shows the expert, the quote and the reviewer card (claim C4)', () => {
    renderInter('expert')
    expect(
      screen.getByRole('heading', { name: 'Your plan will be reviewed by an expert' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        '"Bloom carefully uses a proven approach to provide personalized guidance and resources that support emotional resilience."',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Content reviewed by an expert')).toBeInTheDocument()
    expect(screen.getByText(CLAIMS.expert.quiz.name)).toBeInTheDocument()
    expect(screen.getByText(CLAIMS.expert.quiz.role)).toBeInTheDocument()
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
