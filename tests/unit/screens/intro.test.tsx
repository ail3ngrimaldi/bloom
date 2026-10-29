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

describe('IntroScreen', () => {
  it('shows the logo, an empty progress bar, the headline, the subtitle and the CTA', () => {
    const onNext = vi.fn()
    renderFunnel(<IntroScreen step={getStep('intro') as ScreenStep<'intro'>} onNext={onNext} />)
    expect(screen.getByText('Bloom')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(
      screen.getByRole('heading', { level: 1, name: "You're not lazy, you might be burning out." }),
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
})
