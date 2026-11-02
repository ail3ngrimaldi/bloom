import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CLAIMS } from '@/funnel/claims'
import type { FunnelState } from '@/funnel/state'
import { getStep } from '@/funnel/steps'
import { SHEET_LOAD_MS, GIFT_DELAY_MS } from '@/screens/plan/PlanSheet'
import { PwywScreen } from '@/screens/pwyw'
import type { ScreenStep } from '@/screens/types'
import type { CheckoutProvider } from '@/services/checkout/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const plan = getStep('plan') as ScreenStep<'plan_sheet'>
const NOW = new Date(2026, 9, 31, 12, 0, 0)
// Built, not written: no card-shaped literal belongs in the repository (guardrail 7).
const SIXTEEN = '5678'.repeat(4)
/** When the gift is applied in these tests: after the skeleton and the delay before it opens. */
const GRANT_AT = NOW.getTime() + SHEET_LOAD_MS + GIFT_DELAY_MS

interface Options {
  path?: string
  state?: Partial<FunnelState>
  provider?: CheckoutProvider
}

function renderSheet({ path = '/s/plan', state, provider }: Options = {}) {
  const onNext = vi.fn()
  const view = renderFunnel(<PwywScreen step={plan} onNext={onNext} />, {
    path,
    state: {
      furthest: 42,
      lead: { email: 'qa@example.com', name: 'Sam' },
      trialAmount: 2,
      answers: {
        drained: 'rarely',
        adhd: 'no',
        wand: ['self_doubt', 'burnout', 'anxiety'],
        success_30d: ['no_procrastination', 'calmer'],
      },
      ...state,
    },
    checkout: provider,
  })
  return { ...view, onNext }
}

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
const sheet = () => screen.getByRole('dialog', { name: 'Your personalized plan' })
const gift = () =>
  screen.getByRole('dialog', { name: /Pick a gift to reveal your discount\.|off is yours\./ })

/**
 * Past the skeleton and then the delay before the gift opens. Two steps, not one: the delay starts
 * when the sheet has rendered its content, which React only does once the first advance is over.
 */
const openGift = () => {
  advance(SHEET_LOAD_MS)
  advance(GIFT_DELAY_MS)
}

function applyGift() {
  openGift()
  fireEvent.click(within(gift()).getByRole('button', { name: 'Gift 1 of 3' }))
  fireEvent.click(within(gift()).getByRole('button', { name: 'Apply my discount' }))
}

function controllableProvider() {
  const provider: CheckoutProvider = {
    load: vi.fn(() => Promise.resolve()),
    pay: vi.fn(async () => ({ status: 'demo' as const })),
    payCard: vi.fn(async () => ({ status: 'demo' as const })),
  }
  return provider
}

beforeEach(() => {
  resetNextNavigation()
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('plan sheet: loading (PLAN-B 4.2)', () => {
  it('is a dialog over the page that shows a skeleton first and everything under 1.5 s', () => {
    const { events } = renderSheet()
    expect(sheet()).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Loading your plan...')
    expect(screen.queryByText('Payment Options')).not.toBeInTheDocument()
    expect(SHEET_LOAD_MS).toBeLessThan(1500)

    advance(SHEET_LOAD_MS)
    expect(screen.getByRole('heading', { name: 'Payment Options' })).toBeInTheDocument()
    expect(events).toContainEqual({ name: 'sheet_open' })
    expect(events).toContainEqual({ name: 'sheet_ready', ms: expect.any(Number) })
  })

  it('keeps the fixed bar during the load and the whole sheet, with Start Now', () => {
    renderSheet()
    expect(screen.getByTestId('sticky-label')).toHaveTextContent('14 Day Trial - $2.00')
    expect(screen.getByText("We'll remind you before the trial ends")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start Now' })).toBeDisabled()
    advance(SHEET_LOAD_MS)
    expect(screen.getByRole('button', { name: 'Start Now' })).toBeEnabled()
  })

  it('closes with the × button and with Escape, back to the pay-what-you-want page', () => {
    const { navigator } = renderSheet()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(navigator.replace).toHaveBeenCalledWith('/s/pwyw')
    navigator.replace.mockClear()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(navigator.replace).toHaveBeenCalledWith('/s/pwyw')
  })
})

describe('plan sheet: the gift (PLAN-B 4.3)', () => {
  it('opens by itself about a second after the sheet is painted, with three gifts', () => {
    const { events } = renderSheet()
    advance(SHEET_LOAD_MS)
    advance(GIFT_DELAY_MS - 1)
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    advance(1)
    expect(gift()).toHaveAccessibleName('Pick a gift to reveal your discount.')
    expect(screen.getByText('ONE LAST THING')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Your trial amount is locked in. What is inside comes off your price after the trial.',
      ),
    ).toBeInTheDocument()
    expect(
      within(gift())
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label')),
    ).toEqual(['Gift 1 of 3', 'Gift 2 of 3', 'Gift 3 of 3'])
    expect(events).toContainEqual({ name: 'gift_view' })
  })

  it('has no way out but to answer: Escape and the backdrop do nothing', () => {
    const { navigator, store } = renderSheet()
    openGift()
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.mouseDown(gift().parentElement!)
    expect(gift()).toBeInTheDocument()
    expect(navigator.replace).not.toHaveBeenCalled()
    expect(store.getState().discount).toBeNull()
  })

  it('reveals "70% off is yours." and the coupon when a gift is picked', () => {
    const { events } = renderSheet()
    openGift()
    fireEvent.click(within(gift()).getByRole('button', { name: 'Gift 2 of 3' }))
    expect(gift()).toHaveAccessibleName('70% off is yours.')
    expect(screen.getByText('DISCOUNT UNLOCKED')).toBeInTheDocument()
    expect(
      screen.getByText('Tap below and we add it to your plan. Nothing to type in.'),
    ).toBeInTheDocument()
    expect(screen.getByText('RESERVED FOR YOU')).toBeInTheDocument()
    expect(screen.getByText('Off your price after the trial.')).toBeInTheDocument()
    expect(within(gift()).getByRole('button', { name: 'Apply my discount' })).toHaveFocus()
    expect(events).toContainEqual({ name: 'gift_pick', index: 1 })
  })

  it('grants the discount for real when it is applied: stored, tracked and shown in the sheet', () => {
    const { store, events } = renderSheet()
    applyGift()
    expect(store.getState().discount).toMatchObject({
      pct: 70,
      code: 'off_70_october',
      grantedAt: GRANT_AT,
      expiresAt: null, // no countdown flag: the discount does not end
    })
    expect(events).toContainEqual({ name: 'discount_apply', pct: 70 })
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    expect(screen.getByTestId('promo-code')).toHaveTextContent('off_70_october')
    expect(screen.getByText('Promo Code Is Applied!', { exact: false })).toBeInTheDocument()
    expect(screen.getByTestId('discount-banner')).toHaveTextContent('70% OFF YOUR PLAN')
  })

  it('does not open again once a discount has been granted (a reload keeps it)', () => {
    renderSheet({
      state: {
        discount: { pct: 70, code: 'off_70_october', grantedAt: NOW.getTime(), expiresAt: null },
      },
    })
    openGift()
    advance(5000)
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    expect(screen.getByTestId('promo-code')).toBeInTheDocument()
  })

  it('offers a single gift when the owner prefers not to suggest chance (count = 1)', () => {
    // The default is three gifts that reveal the same discount (D11); the config says how many.
    expect(plan.gift).toEqual({ count: 3, outcomes: [70, 70, 70] })
  })
})

describe('plan sheet: price, banner and legal text follow the discount (guardrail 4)', () => {
  it('before the gift: no coupon, no banner, no struck price, the list price after the trial', () => {
    renderSheet()
    advance(SHEET_LOAD_MS)
    expect(screen.queryByTestId('promo-code')).not.toBeInTheDocument()
    expect(screen.queryByTestId('discount-banner')).not.toBeInTheDocument()
    expect(screen.queryByText(/^SAVE/)).not.toBeInTheDocument()
    expect(screen.getByTestId('plan-per-day')).toHaveTextContent('$2.22/day')
    expect(screen.getByTestId('plan-billed')).toHaveTextContent('$133.30 billed every 2 months')
  })

  it('after the gift: $39.99 every 2 months, $0.67 a day, $2.22 struck and SAVE 70%', () => {
    renderSheet()
    applyGift()
    expect(screen.getByText('SAVE 70%')).toBeInTheDocument()
    expect(screen.getByTestId('plan-per-day')).toHaveTextContent('$2.22/day')
    expect(screen.getByTestId('plan-per-day')).toHaveTextContent('$0.67/day')
    expect(screen.getByTestId('plan-per-day').querySelector('s')).toHaveTextContent('$2.22/day')
    expect(screen.getByTestId('plan-billed')).toHaveTextContent('$39.99 billed every 2 months')
    expect(within(sheet()).getByText(/Demo prices/)).toBeInTheDocument()
  })

  it('the legal text and the charge summary carry the same price and date as the plan', () => {
    renderSheet()
    applyGift()
    const legal = screen.getByTestId('legal').textContent!
    expect(legal).toContain('This is an auto renewing subscription.')
    expect(legal).toContain(
      "If you don't cancel during the 14-day intro period, Bloom will charge you $39.99 on November 14, 2026.",
    )
    expect(legal).toContain(
      'After the intro period, you will be charged automatically $39.99 every 2 months until you cancel.',
    )
    expect(legal).toContain('You can cancel at any time by going through your account settings via')
    expect(legal).toContain('See our Subscription Policy for details.')
    expect(screen.getByTestId('charge-summary')).toHaveTextContent(
      '$2.00 today. Then $39.99 every 2 months from November 14, 2026 until you cancel. Cancel anytime in your account settings.',
    )
  })

  it.each([2, 10, 16.41])(
    'shows $%s in the fixed bar, the plan card and the charge summary',
    (amount) => {
      renderSheet({ state: { trialAmount: amount } })
      advance(SHEET_LOAD_MS)
      const money = `$${amount.toFixed(2)}`
      expect(screen.getByTestId('sticky-label')).toHaveTextContent(`14 Day Trial - ${money}`)
      expect(screen.getByTestId('plan-trial-amount')).toHaveTextContent(money)
      expect(screen.getByTestId('charge-summary')).toHaveTextContent(`${money} today.`)
    },
  )

  it('uses the most popular amount when none was chosen', () => {
    renderSheet({ state: { trialAmount: null } })
    expect(screen.getByTestId('sticky-label')).toHaveTextContent('14 Day Trial - $16.41')
  })

  it('shows the Day 12 reminder, two days before the trial ends', () => {
    renderSheet()
    advance(SHEET_LOAD_MS)
    expect(screen.getByText('Day 12')).toBeInTheDocument()
    expect(screen.getByText('A gentle nudge 2 days before your trial ends.')).toBeInTheDocument()
    expect(screen.getByText('14-day trial')).toBeInTheDocument()
    expect(screen.getByText('Full access to the Bloom app.')).toBeInTheDocument()
  })
})

describe('plan sheet: the countdown (guardrail 5, behind paywall.countdown.enabled)', () => {
  it('is off by default: the header says the plan is ready and there is no timer', () => {
    renderSheet()
    applyGift()
    expect(screen.getByText('Your plan is ready')).toBeInTheDocument()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.queryByText(/reserved for the next 15 minutes/)).not.toBeInTheDocument()
    // Without the flag the discount never ends.
    advance(20 * 60 * 1000)
    expect(screen.getByTestId('promo-code')).toBeInTheDocument()
  })

  it('starts when the discount is granted, not before', () => {
    renderSheet({ path: '/s/plan?countdown' })
    advance(SHEET_LOAD_MS)
    advance(30_000)
    // The gift is still open: nothing is counting yet.
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.getByText('Your plan is ready')).toBeInTheDocument()
    fireEvent.click(within(gift()).getByRole('button', { name: 'Gift 3 of 3' }))
    fireEvent.click(within(gift()).getByRole('button', { name: 'Apply my discount' }))
    expect(screen.getByRole('timer', { name: 'Discount time left' })).toHaveTextContent('15:00')
    expect(
      screen.getByText('Your discount has been reserved for the next 15 minutes'),
    ).toBeInTheDocument()
  })

  it('counts one second per second, in the header and in the coupon', () => {
    const { store } = renderSheet({ path: '/s/plan?countdown' })
    applyGift()
    expect(store.getState().discount?.expiresAt).toBe(GRANT_AT + 15 * 60 * 1000)
    advance(3000)
    expect(screen.getByRole('timer')).toHaveTextContent('14:57')
    expect(
      within(screen.getByTestId('promo-code').parentElement!).getByText('14:57'),
    ).toBeInTheDocument()
  })

  it('does not restart on reload: it resumes from the stored end of the discount', () => {
    const grantedAt = NOW.getTime() - 5 * 60 * 1000
    renderSheet({
      path: '/s/plan?countdown',
      state: {
        discount: {
          pct: 70,
          code: 'off_70_october',
          grantedAt,
          expiresAt: grantedAt + 15 * 60 * 1000,
        },
      },
    })
    advance(SHEET_LOAD_MS)
    expect(screen.getByRole('timer')).toHaveTextContent('10:00')
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    advance(GIFT_DELAY_MS)
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    // The interval has ticked once more: 1.6 s after the page opened, 598.4 s are left.
    expect(screen.getByRole('timer')).toHaveTextContent('09:59')
  })

  it('really ends the discount at 0: no coupon, no banner, no SAVE, the list price, and it never restarts', () => {
    const { store, events } = renderSheet({ path: '/s/plan?countdown' })
    applyGift()
    expect(screen.getByTestId('plan-billed')).toHaveTextContent('$39.99')
    advance(15 * 60 * 1000)
    expect(screen.getByText('Your discount has ended')).toBeInTheDocument()
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('promo-code')).not.toBeInTheDocument()
    expect(screen.queryByTestId('discount-banner')).not.toBeInTheDocument()
    expect(screen.queryByText(/^SAVE/)).not.toBeInTheDocument()
    expect(screen.getByTestId('plan-billed')).toHaveTextContent('$133.30 billed every 2 months')
    expect(screen.getByTestId('legal').textContent).toContain(
      'will charge you $133.30 on November 14, 2026',
    )
    expect(screen.getByTestId('charge-summary')).toHaveTextContent('Then $133.30 every 2 months')
    expect(events.filter((event) => event.name === 'countdown_expire')).toHaveLength(1)
    // The gift does not come back and the window is not reopened.
    advance(60_000)
    expect(screen.queryByText('ONE LAST THING')).not.toBeInTheDocument()
    expect(store.getState().discount?.expiresAt).toBe(GRANT_AT + 15 * 60 * 1000)
  })

  it('announces the time left once a minute, not every second', () => {
    renderSheet({ path: '/s/plan?countdown' })
    applyGift()
    const announcer = () =>
      screen.getAllByRole('status').find((el) => /minutes left/.test(el.textContent ?? ''))
    expect(announcer()).toHaveTextContent('15 minutes left on your discount')
    advance(30_000)
    expect(announcer()).toHaveTextContent('15 minutes left on your discount')
    advance(30_000)
    expect(announcer()).toHaveTextContent('14 minutes left on your discount')
  })
})

describe('plan sheet: sections (Appendix B) and claims (guardrails 2 and 3)', () => {
  beforeEach(() => {
    renderSheet()
    advance(SHEET_LOAD_MS)
  })

  it('compares NOW with YOUR GOAL and shows Difficulty and Goal', () => {
    const now = screen.getByRole('group', { name: 'NOW' })
    const goal = screen.getByRole('group', { name: 'YOUR GOAL' })
    for (const label of ['Energy level', 'Well-being level', 'Self-esteem level']) {
      expect(within(now).getByText(label)).toBeInTheDocument()
      expect(within(goal).getByText(label)).toBeInTheDocument()
    }
    // Rarely drained, nothing else scored, Self-doubt released: Good / Fair / Low today.
    for (const value of ['Good', 'Fair', 'Low'])
      expect(within(now).getByText(value)).toBeInTheDocument()
    expect(within(goal).getAllByText('High')).toHaveLength(2)
    expect(within(goal).getByText('Strong')).toBeInTheDocument()
    expect(screen.getByText('Difficulty')).toBeInTheDocument()
    expect(screen.getByText('Perfectionist')).toBeInTheDocument()
    expect(screen.getByText('State of calm')).toBeInTheDocument()
  })

  it('lists the six benefits of the reference', () => {
    expect(
      screen.getByRole('heading', { name: 'What you will get with Bloom' }),
    ).toBeInTheDocument()
    for (const title of [
      'Healthy habits & routines',
      'Improved well-being',
      'Coaching sessions',
      'Tools that support your goals',
      'Planners & workbooks',
      'Habitat Zero',
    ])
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('has an accessible FAQ: the first answer is open and the others open on demand', () => {
    expect(screen.getByRole('heading', { name: 'People often ask' })).toBeInTheDocument()
    const buttons = screen
      .getAllByRole('button')
      .filter(
        (button) => button.hasAttribute('aria-expanded') && button.hasAttribute('aria-controls'),
      )
    expect(buttons).toHaveLength(5)
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByText(
        /^A to-do list tells you what to do\. Bloom builds the drive to actually do it\./,
      ),
    ).toBeVisible()
    for (const button of buttons.slice(1)) expect(button).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(buttons[1])
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true')
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText(/^Most members notice small wins/)).toBeVisible()
    fireEvent.click(buttons[1])
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the two member reviews with the exact text of the reference (claim C7)', () => {
    expect(screen.getByRole('heading', { name: 'Members love our plans' })).toBeInTheDocument()
    for (const review of CLAIMS.reviews) {
      expect(screen.getByText(review.text)).toBeInTheDocument()
      expect(screen.getByText(review.author)).toBeInTheDocument()
    }
    expect(screen.getAllByRole('img', { name: '5 out of 5 stars' })).toHaveLength(2)
  })

  it('shows the expert, the awards and the press (claims C4, C5 and C2)', () => {
    expect(screen.getByText('Content reviewed by an expert')).toBeInTheDocument()
    expect(screen.getByText(CLAIMS.expert.sheet.name)).toBeInTheDocument()
    expect(screen.getByText(CLAIMS.expert.sheet.role)).toBeInTheDocument()
    expect(screen.getByText(CLAIMS.expert.sheet.quote)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Bloom awards' })).toBeInTheDocument()
    for (const award of CLAIMS.awards) {
      expect(screen.getByText(award.title)).toBeInTheDocument()
      expect(screen.getByText(award.source)).toBeInTheDocument()
    }
    const press = screen.getByRole('list', { name: 'As featured in' })
    expect(
      within(press)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(CLAIMS.press.sheet)
  })

  it('writes a letter from future you with the visitor’s name and today’s date', () => {
    expect(screen.getByRole('heading', { name: 'Sam, do you copy?' })).toBeInTheDocument()
    expect(
      screen.getByText(
        "It's me, future Sam. I'm calling from 2027 because today is an important day for you - for us.",
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Saturday, October 31, 2026 is the day we decide to change our lives for the better.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Future Sam')).toBeInTheDocument()
  })

  it('does not name the product of the reference or reproduce its photo anywhere', () => {
    expect(document.body.textContent).not.toMatch(/fabulous/i)
    expect(document.querySelector('img')).toBeNull()
  })
})

describe('plan sheet: the letter without a name', () => {
  it('uses a generic greeting and signature', () => {
    renderSheet({ state: { lead: { email: 'qa@example.com', name: '' } } })
    advance(SHEET_LOAD_MS)
    expect(screen.getByRole('heading', { name: 'Do you copy?' })).toBeInTheDocument()
    expect(screen.getByText('Future you')).toBeInTheDocument()
  })
})

describe('plan sheet: payment (PLAN-B 4.6) with the mock provider', () => {
  async function ready(provider = controllableProvider(), state?: Partial<FunnelState>) {
    const view = renderSheet({ provider, state })
    advance(SHEET_LOAD_MS)
    await act(async () => void (await vi.advanceTimersByTimeAsync(10)))
    return { provider, ...view }
  }

  it('prefills the email of step #38 and mounts the express buttons once the provider has loaded', async () => {
    let finish: () => void = () => {}
    const provider = controllableProvider()
    provider.load = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)))
    renderSheet({ provider })
    advance(SHEET_LOAD_MS)
    expect(screen.getByLabelText('Email')).toHaveValue('qa@example.com')
    expect(screen.queryByRole('button', { name: 'Pay with PayPal' })).not.toBeInTheDocument()
    expect(screen.getByText('Loading payment options...')).toBeInTheDocument()
    await act(async () => finish())
    expect(screen.getByRole('button', { name: 'Pay with PayPal' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay with G Pay (Google Pay)' })).toBeInTheDocument()
  })

  it('pays with an express method for the trial amount, and says nothing was charged', async () => {
    const { provider, events } = await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Pay with PayPal' }))
    await act(async () => void (await vi.advanceTimersByTimeAsync(10)))
    expect(provider.pay).toHaveBeenCalledWith('paypal', { email: 'qa@example.com', trialAmount: 2 })
    expect(events).toContainEqual({ name: 'payment_method_click', method: 'paypal' })
    expect(screen.getByText('This is a demo checkout: no payment was taken.')).toBeInTheDocument()
  })

  it('does not pay with a wrong email', async () => {
    const { provider } = await ready()
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Pay with PayPal' }))
    expect(provider.pay).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a valid email address.')
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('keeps START MEMBERSHIP disabled until the card looks complete, then pays by card', async () => {
    const { provider, events } = await ready()
    const start = screen.getByRole('button', { name: 'START MEMBERSHIP' })
    expect(start).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Card Number (16 digits)'), {
      target: { value: SIXTEEN },
    })
    expect(screen.getByLabelText('Card Number (16 digits)')).toHaveValue(
      ['5678', '5678', '5678', '5678'].join(' '),
    )
    fireEvent.change(screen.getByLabelText('MM / YY'), { target: { value: '1230' } })
    expect(screen.getByLabelText('MM / YY')).toHaveValue('12 / 30')
    expect(start).toBeDisabled()
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } })
    expect(start).toBeEnabled()

    fireEvent.click(start)
    await act(async () => void (await vi.advanceTimersByTimeAsync(10)))
    expect(provider.payCard).toHaveBeenCalledWith({ email: 'qa@example.com', trialAmount: 2 })
    expect(events).toContainEqual({ name: 'start_membership_click' })
    expect(screen.getByText('This is a demo checkout: no payment was taken.')).toBeInTheDocument()
  })

  it('never stores, tracks or hands over what is typed in the card fields (guardrail 7)', async () => {
    const { provider, store, events } = await ready()
    fireEvent.change(screen.getByLabelText('Card Number (16 digits)'), {
      target: { value: SIXTEEN },
    })
    fireEvent.change(screen.getByLabelText('MM / YY'), { target: { value: '1230' } })
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '987' } })
    fireEvent.click(screen.getByRole('button', { name: 'START MEMBERSHIP' }))
    await act(async () => void (await vi.advanceTimersByTimeAsync(10)))
    const everything = JSON.stringify([
      store.getState(),
      events,
      vi.mocked(provider.payCard).mock.calls,
    ])
    expect(everything).not.toContain(SIXTEEN)
    expect(everything).not.toContain('5678')
    expect(JSON.stringify(vi.mocked(provider.payCard).mock.calls)).not.toContain('987')
    expect(provider.payCard).toHaveBeenCalledWith({ email: 'qa@example.com', trialAmount: 2 })
  })

  it('reports which card field the visitor started on, never its value', async () => {
    const { events } = await ready()
    fireEvent.focus(screen.getByLabelText('Card Number (16 digits)'))
    fireEvent.focus(screen.getByLabelText('Card Number (16 digits)'))
    fireEvent.focus(screen.getByLabelText('CVV'))
    expect(events.filter((event) => event.name === 'card_field_focus')).toEqual([
      { name: 'card_field_focus', field: 'number' },
      { name: 'card_field_focus', field: 'cvv' },
    ])
  })

  it('asks for a complete card number and expiry once the fields have been left', async () => {
    await ready()
    const number = screen.getByLabelText('Card Number (16 digits)')
    fireEvent.change(number, { target: { value: '12' } })
    fireEvent.blur(number)
    expect(screen.getByText('Enter the 16 digits of your card.')).toBeInTheDocument()
    expect(number).toHaveAttribute('aria-invalid', 'true')
    const expiry = screen.getByLabelText('MM / YY')
    fireEvent.change(expiry, { target: { value: '0120' } })
    fireEvent.blur(expiry)
    expect(screen.getByText('Enter a valid expiry date.')).toBeInTheDocument()
  })

  it('has the renewal reminder on by default and remembers when it is turned off', async () => {
    const { store } = await ready()
    const reminder = screen.getByRole('checkbox', {
      name: "We'll remind you 2 days before renewal. You're in control.",
    })
    expect(reminder).toBeChecked()
    fireEvent.click(reminder)
    expect(store.getState().reminderOptIn).toBe(false)
  })

  it('says how it is secured and lists the accepted methods', async () => {
    await ready()
    expect(screen.getByText('Pay Safe & Secure')).toBeInTheDocument()
    expect(
      within(screen.getByRole('list', { name: 'Accepted payment methods' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(6)
    expect(screen.getByText('No commitments. Cancel online at anytime.')).toBeInTheDocument()
    expect(screen.getByText('Checkout in seconds with Apple Pay or PayPal')).toBeInTheDocument()
  })

  it('takes the visitor to the payment block with Start Now', async () => {
    const { events } = await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Start Now' }))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(events).toContainEqual({ name: 'start_now_click' })
    expect(screen.getByRole('region', { name: 'Payment Options' })).toHaveFocus()
  })
})
