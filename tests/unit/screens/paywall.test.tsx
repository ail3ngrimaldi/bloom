import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { PaywallScreen, formatClock } from '@/screens/paywall'
import type { ScreenStep } from '@/screens/types'
import type { CheckoutProvider } from '@/services/checkout/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const paywall = getStep('paywall') as ScreenStep<'paywall'>
const checkout = getStep('checkout') as ScreenStep<'checkout'>

function renderPaywall(
  step: ScreenStep<'paywall' | 'checkout'> = paywall,
  { provider, path }: { provider?: CheckoutProvider; path?: string } = {},
) {
  const onNext = vi.fn()
  const view = renderFunnel(<PaywallScreen step={step} onNext={onNext} />, {
    path: path ?? `/s/${step.id}`,
    state: { furthest: 42, lead: { email: 'qa@example.com', name: 'Sam' } },
    checkout: provider,
  })
  return { ...view, onNext }
}

const legal = () => screen.getByText(/By clicking "Continue,"/).textContent

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('PaywallScreen (#41)', () => {
  it('offers three plans with the 1 month plan chosen and the legal text of that plan', () => {
    const { store, events } = renderPaywall()
    expect(screen.getByRole('heading', { name: 'Choose your plan' })).toBeInTheDocument()
    const plans = within(screen.getByRole('radiogroup', { name: 'Choose your plan' })).getAllByRole(
      'radio',
    )
    expect(plans.map((plan) => plan.getAttribute('aria-label'))).toEqual([
      '1 week trial, $5.19 instead of $39.99, $0.74 per day, instead of $1.33',
      '1 month plan, $8.99 instead of $39.99, $0.30 per day, instead of $1.33',
      '3 month plan, $16.99 instead of $59.99, $0.19 per day, instead of $0.67',
    ])
    expect(plans[1]).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument()
    expect(screen.getByText('SAVE 78%')).toBeInTheDocument()
    expect(screen.getByText('SAVE 72%')).toBeInTheDocument()
    expect(legal()).toContain('The $8.99 applies to your first subscription')
    expect(legal()).toContain('full price of $39.99 every month until you cancel')
    expect(screen.getByText(/Demo prices/)).toBeInTheDocument()
    expect(store.getState().paywallStartedAt).not.toBeNull()
    expect(events).toContainEqual({ name: 'paywall_view' })
  })

  it('switches plan, and the legal text follows', () => {
    const { store } = renderPaywall()
    fireEvent.click(screen.getByRole('radio', { name: /^3 month plan/ }))
    expect(store.getState().selectedPlanId).toBe('month_3')
    expect(screen.getByRole('radio', { name: /^3 month plan/ })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(legal()).toContain('The $16.99 applies')
    expect(legal()).toContain('$59.99 every 3 months')
  })

  it('says the plan is ready by name when the countdown is off (the default)', () => {
    renderPaywall()
    expect(screen.getByText('Sam, your plan is ready')).toBeInTheDocument()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
  })

  it('enables Continue after a moment and opens the checkout', () => {
    const { onNext } = renderPaywall()
    const cta = screen.getByRole('button', { name: 'Continue' })
    expect(cta).toBeDisabled()
    act(() => void vi.advanceTimersByTime(500))
    fireEvent.click(cta)
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('runs the countdown from the first view, behind its flag, and ends the discount at 0', () => {
    const start = Date.now()
    renderPaywall(paywall, { path: '/s/paywall?qa&countdown' })
    act(() => void vi.advanceTimersByTime(1000))
    const timer = screen.getByRole('timer')
    expect(timer).toHaveTextContent('Discount reserved for:')
    expect(timer.textContent).toMatch(/14:5\d|15:00/)
    act(() => void vi.setSystemTime(start + 15 * 60 * 1000 + 1000))
    act(() => void vi.advanceTimersByTime(1000))
    expect(screen.getByText('Your discount has ended')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /^1 month plan/ })).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/^1 month plan, \$39\.99,/),
    )
    expect(screen.queryByText('SAVE 78%')).not.toBeInTheDocument()
  })

  it('formats the clock as mm:ss', () => {
    expect(formatClock(900)).toBe('15:00')
    expect(formatClock(897)).toBe('14:57')
    expect(formatClock(5)).toBe('00:05')
  })
})

describe('checkout modal (#42)', () => {
  function controllableProvider() {
    let loaded: () => void = () => {}
    const provider: CheckoutProvider = {
      load: vi.fn(() => new Promise<void>((resolve) => (loaded = resolve))),
      pay: vi.fn(async () => ({ status: 'demo' as const })),
    }
    return { provider, finishLoading: () => loaded() }
  }

  it('shows the total of the chosen plan, the email of #38 and the methods once loaded', async () => {
    const { provider, finishLoading } = controllableProvider()
    const { store } = renderPaywall(checkout, { provider })
    act(() => store.dispatch({ type: 'selectPlan', planId: 'month_3' }))

    const dialog = screen.getByRole('dialog', { name: "Your plan is ready. Let's make it real." })
    expect(within(dialog).getByTestId('checkout-total')).toHaveTextContent('Total$59.99 $16.99')
    expect(within(dialog).getByRole('textbox', { name: 'Email' })).toHaveValue('qa@example.com')
    expect(
      within(dialog).queryByRole('button', { name: 'Pay with PayPal' }),
    ).not.toBeInTheDocument()
    expect(within(dialog).getByText('Loading payment options...')).toBeInTheDocument()
    // The amounts are <strong> inside the sentence, so read the dialog's text as a whole.
    expect(dialog.textContent).toContain(
      'You agree that $16.99 will be charged as an intro offer, then $59.99 will be ' +
        'automatically billed every 3 months until you cancel.',
    )

    await act(async () => finishLoading())
    expect(within(dialog).getByRole('button', { name: 'Pay with PayPal' })).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Pay with G Pay (Google Pay)' }),
    ).toBeInTheDocument()
  })

  it('pays through the provider and says nothing was charged (mock)', async () => {
    const { provider, finishLoading } = controllableProvider()
    const { events } = renderPaywall(checkout, { provider })
    await act(async () => finishLoading())
    await act(
      async () => void fireEvent.click(screen.getByRole('button', { name: 'Pay with PayPal' })),
    )
    expect(provider.pay).toHaveBeenCalledWith('paypal', {
      planId: 'month_1',
      email: 'qa@example.com',
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'This is a demo checkout: no payment was taken.',
    )
    expect(events).toContainEqual({ name: 'payment_method_click', method: 'paypal' })
    expect(events).toContainEqual({ name: 'checkout_open' })
  })

  it('asks for a valid email before paying', async () => {
    const { provider, finishLoading } = controllableProvider()
    renderPaywall(checkout, { provider })
    await act(async () => finishLoading())
    fireEvent.change(screen.getByRole('textbox', { name: 'Email' }), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pay with G Pay (Google Pay)' }))
    expect(provider.pay).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('never asks for card details: the card row only says when cards open', () => {
    renderPaywall(checkout)
    const card = screen.getByRole('button', { name: /Credit Card/ })
    expect(card).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(card)
    expect(card).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Card payments will be available at launch.')).toBeVisible()
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
  })

  it('closes back to the paywall', () => {
    const { navigator } = renderPaywall(checkout)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' }))
    // Opened directly (not pushed from the paywall in this visit): the entry is replaced.
    expect(navigator.replace).toHaveBeenCalledWith('/s/paywall')
  })
})
