import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { IntroScreen } from '@/screens/intro'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

beforeEach(() => {
  resetNextNavigation()
})

const intro = () => getStep('intro') as ScreenStep<'intro'>

describe('IntroScreen', () => {
  it('shows the logo, an empty progress bar, the headline, the subtitle and the CTA', () => {
    const onNext = vi.fn()
    renderFunnel(<IntroScreen step={intro()} onNext={onNext} />)
    expect(screen.getByText('Bloom')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(
      screen.getByRole('heading', { level: 1, name: "Let's see if we're a match." }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('The next questions reveal whether Bloom is the right app for you.'),
    ).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()

    const cta = screen.getByRole('button', { name: 'Continue' })
    expect(cta).toBeEnabled()
    fireEvent.click(cta)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('has the headline of each funnel variant (PLAN-B 3.2): pay what you want is the B funnel', () => {
    renderFunnel(<IntroScreen step={intro()} onNext={vi.fn()} />, {
      path: '/s/intro?closing=paywall',
    })
    expect(
      screen.getByRole('heading', { level: 1, name: "You're not lazy, you might be burning out." }),
    ).toBeInTheDocument()
  })

  it('follows the funnel slug the visitor arrived through', () => {
    renderFunnel(<IntroScreen step={intro()} onNext={vi.fn()} />, {
      state: { attribution: { slug: 'bloom-initial-paywall' } },
    })
    expect(
      screen.getByRole('heading', { level: 1, name: "You're not lazy, you might be burning out." }),
    ).toBeInTheDocument()
  })
})
