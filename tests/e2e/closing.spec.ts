import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { answerStep, waitForStep, walkTo } from './helpers/funnel'

/**
 * The "pay what you want" closing (PLAN-B phases B2 to B7): the page, the plan sheet, the gift and
 * the discount, the countdown behind its flag, the mock payment, the attribution and the phone
 * layouts. The quiz and the paywall closing are covered by funnel.spec.ts.
 */

const SESSION = {
  answers: {
    drained: 'often',
    adhd: 'no',
    gender: 'male',
    wand: ['self_doubt', 'burnout', 'anxiety'],
    success_30d: ['calmer'],
  },
  lead: { email: 'qa@example.com', name: 'Sam' },
  selectedPlanId: null,
  paywallStartedAt: null,
  furthest: 42,
  trialAmount: 10,
  discount: null,
  reminderOptIn: true,
  attribution: {},
}

type Session = Omit<typeof SESSION, 'discount'> & { discount: unknown }

/** Seeds the funnel's session once; a reload inside the test keeps what the page has stored. */
async function seed(page: Page, state: Session | Record<string, unknown> = SESSION) {
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('bloom.funnel.v1'))
      sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(value))
  }, state)
}

const discounted = (expiresAt: number | null = null): Session => ({
  ...SESSION,
  discount: { pct: 70, code: 'off_70_october', grantedAt: Date.now(), expiresAt },
})

/**
 * A granted discount that ends `ms` after the page opens: the end is computed in the browser when
 * the page starts, so a slow first compile of the dev server cannot eat into it.
 */
async function seedDiscountEndingIn(page: Page, ms: number) {
  await page.addInitScript(
    ([value, endsIn]) => {
      if (sessionStorage.getItem('bloom.funnel.v1')) return
      const now = Date.now()
      const state = {
        ...(value as object),
        discount: {
          pct: 70,
          code: 'off_70_october',
          grantedAt: now,
          expiresAt: now + (endsIn as number),
        },
      }
      sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(state))
    },
    [SESSION, ms] as const,
  )
}

const sheet = (page: Page) => page.getByRole('dialog', { name: 'Your personalized plan' })
const gift = (page: Page) =>
  page.getByRole('dialog', { name: /Pick a gift to reveal your discount\.|off is yours\./ })
// Built, not written: no card-shaped literal belongs in the repository (guardrail 7).
const CARD = '1111'.repeat(4)

async function pickAndApplyGift(page: Page) {
  await expect(gift(page)).toBeVisible({ timeout: 10_000 })
  // The gifts float on every frame, so they never pass Playwright's "stable" check.
  await gift(page).getByRole('button', { name: 'Gift 2 of 3' }).click({ force: true })
  await gift(page).getByRole('button', { name: 'Apply my discount' }).click()
  await expect(gift(page)).toHaveCount(0)
}

test.describe('walking into the closing', () => {
  test('goes from the intro to pay what you want, the plan sheet, the gift and the mock payment', async ({
    page,
  }) => {
    test.setTimeout(240_000)
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await page.goto('/s/intro')
    await expect(page.getByRole('heading', { name: "Let's see if we're a match." })).toBeVisible()
    await walkTo(page, 'pwyw')

    await expect(page.getByRole('heading', { level: 1, name: 'Pay what you want' })).toBeVisible()
    await expect(page.getByText('Sam')).toBeVisible()
    await expect(page.getByRole('radio')).toHaveCount(3)
    await expect(page.getByRole('radio', { name: '$16.41, most popular' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await page.getByRole('radio', { name: '$10.00' }).click()
    await page.getByRole('button', { name: 'See my plan' }).click()

    await waitForStep(page, 'plan')
    await expect(sheet(page)).toBeVisible()
    await pickAndApplyGift(page)

    // The amount chosen, the discount and the dates are the same wherever they appear.
    await expect(page.getByTestId('sticky-label')).toHaveText('14 Day Trial - $10.00')
    await expect(page.getByTestId('plan-trial-amount')).toHaveText('$10.00')
    await expect(page.getByTestId('promo-code')).toHaveText(/^off_70_[a-z]+$/)
    await expect(page.getByTestId('discount-banner')).toHaveText('70% OFF YOUR PLAN')
    await expect(page.getByTestId('plan-billed')).toHaveText('$39.99 billed every 2 months')
    await expect(page.getByTestId('charge-summary')).toContainText(
      '$10.00 today. Then $39.99 every 2 months from',
    )
    await expect(page.getByTestId('legal')).toContainText('will charge you $39.99 on')

    // Payment (mock): the email comes from #38; the card enables START MEMBERSHIP.
    await expect(page.getByLabel('Email')).toHaveValue('qa@example.com')
    await expect(page.getByRole('button', { name: 'Pay with PayPal' })).toBeVisible({
      timeout: 5000,
    })
    const start = page.getByRole('button', { name: 'START MEMBERSHIP' })
    await expect(start).toBeDisabled()
    await page.getByLabel('Card Number (16 digits)').fill(CARD)
    await page.getByLabel('MM / YY').fill('1230')
    await page.getByLabel('CVV').fill('123')
    await expect(start).toBeEnabled()
    await start.click()
    await expect(page.getByText('This is a demo checkout: no payment was taken.')).toBeVisible()

    // Nothing typed in the card fields is kept anywhere.
    const kept = await page.evaluate(() =>
      JSON.stringify([sessionStorage, localStorage, window.__bloomEvents ?? []]),
    )
    expect(kept).not.toContain(CARD)
    expect(consoleErrors).toEqual([])
  })

  test('the paywall funnel is still there behind ?closing=paywall', async ({ page }) => {
    await seed(page, { ...SESSION, furthest: 40 })
    await page.goto('/s/loading?closing=paywall')
    await waitForStep(page, 'paywall')
    await expect(page.getByRole('heading', { name: 'Choose your plan' })).toBeVisible()
  })
})

test.describe('pay what you want (#41)', () => {
  test.beforeEach(async ({ page }) => seed(page, { ...SESSION, furthest: 41, trialAmount: null }))

  test('chooses an amount with the mouse or the keyboard, with an explicit selected state', async ({
    page,
  }) => {
    await page.goto('/s/pwyw')
    await waitForStep(page, 'pwyw')
    const radios = page.getByRole('radio')
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true')
    await radios.nth(0).click()
    await expect(radios.nth(0)).toHaveAttribute('aria-checked', 'true')
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'false')

    await radios.nth(0).focus()
    await page.keyboard.press('ArrowRight')
    await expect(radios.nth(1)).toBeFocused()
    await page.keyboard.press('Space')
    await expect(radios.nth(1)).toHaveAttribute('aria-checked', 'true')

    await page.reload()
    await waitForStep(page, 'pwyw')
    await expect(page.getByRole('radio').nth(1)).toHaveAttribute('aria-checked', 'true')
  })

  for (const [index, amount] of ['$2.00', '$10.00', '$16.41'].entries()) {
    test(`${amount} is the amount in the fixed bar, the plan card and the charge summary`, async ({
      page,
    }) => {
      await page.goto('/s/pwyw')
      await waitForStep(page, 'pwyw')
      await page.getByRole('radio').nth(index).click()
      await page.getByRole('button', { name: 'See my plan' }).click()
      await waitForStep(page, 'plan')
      await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
      await expect(page.getByTestId('sticky-label')).toHaveText(`14 Day Trial - ${amount}`)
      await expect(page.getByTestId('plan-trial-amount')).toHaveText(amount)
      await expect(page.getByTestId('charge-summary')).toContainText(`${amount} today.`)
    })
  }

  test('the browser Back leaves the sheet and Escape or × close it', async ({ page }) => {
    await page.goto('/s/pwyw')
    await page.getByRole('button', { name: 'See my plan' }).click()
    await waitForStep(page, 'plan')
    await page.goBack()
    await waitForStep(page, 'pwyw')
    await expect(sheet(page)).toHaveCount(0)

    await page.getByRole('button', { name: 'See my plan' }).click()
    await waitForStep(page, 'plan')
    await expect(sheet(page)).toBeVisible()
    await page.getByRole('button', { name: 'Close' }).click()
    await waitForStep(page, 'pwyw')
    await expect(page.getByRole('button', { name: 'See my plan' })).toBeFocused()
  })
})

test.describe('the plan sheet (#42)', () => {
  test('shows every section in order, each claim of the reference and a fixed bar that stays', async ({
    page,
  }) => {
    await seed(page, discounted())
    await page.goto('/s/plan')
    await waitForStep(page, 'plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()

    const order = await page.getByTestId('sheet-scroll').locator('h2').allTextContents()
    expect(order).toEqual([
      'Your personalized plan is ready!',
      'Payment Options',
      'What you will get with Bloom',
      'People often ask',
      'Members love our plans',
      'Bloom awards',
      'As featured in',
      'Sam, do you copy?',
    ])

    const scroller = page.getByTestId('sheet-scroll')
    await scroller.evaluate((el) => (el.scrollTop = el.scrollHeight))
    await expect(page.getByRole('heading', { name: 'Sam, do you copy?' })).toBeInViewport()
    // The fixed bar did not scroll away.
    await expect(page.getByRole('button', { name: 'Start Now' })).toBeInViewport()
    await expect(page.getByText('Sabine Rush')).toBeAttached()
    await expect(page.getByText('Chey Here')).toBeAttached()
    await expect(page.getByText('Jazmin Quill, MA, MSc')).toBeAttached()
    await expect(page.getByText('Best Self-Care App 2018')).toBeAttached()
  })

  test('Start Now takes the visitor back to the payment block', async ({ page }) => {
    await seed(page, discounted())
    await page.goto('/s/plan')
    await waitForStep(page, 'plan')
    const scroller = page.getByTestId('sheet-scroll')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await scroller.evaluate((el) => (el.scrollTop = el.scrollHeight))
    await expect(page.getByRole('heading', { name: 'Payment Options' })).not.toBeInViewport()
    await page.getByRole('button', { name: 'Start Now' }).click()
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeInViewport()
  })

  test('the FAQ opens and closes its answers', async ({ page }) => {
    await seed(page, discounted())
    await page.goto('/s/plan')
    const question = page.getByRole('button', { name: 'What results can I realistically expect?' })
    await question.scrollIntoViewIfNeeded()
    await expect(question).toHaveAttribute('aria-expanded', 'false')
    await question.click()
    await expect(question).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByText(/^Most members notice small wins/)).toBeVisible()
  })

  test('paints in under 1.5 s and does not shift its layout while it loads (CLS < 0.1)', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      ;(window as unknown as { __cls: number }).__cls = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<
          PerformanceEntry & { value: number; hadRecentInput: boolean }
        >)
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value
      }).observe({ type: 'layout-shift', buffered: true })
    })
    await seed(page, discounted())
    await page.goto('/s/plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pay with PayPal' })).toBeVisible({
      timeout: 5000,
    })
    await page.waitForTimeout(800)
    const ready = await page.evaluate(() =>
      window.__bloomEvents?.find((event) => event.name === 'sheet_ready'),
    )
    expect(ready).toMatchObject({ name: 'sheet_ready', ms: expect.any(Number) })
    expect((ready as { ms: number }).ms).toBeLessThan(1500)
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls).toBeLessThan(0.1)
  })

  test('keeps the focus inside the sheet while it is open', async ({ page }) => {
    await seed(page, discounted())
    await page.goto('/s/plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByTestId('sheet-scroll')).toBeFocused()
    for (let i = 0; i < 70; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))
      expect(inside, `Tab ${i + 1}`).toBe(true)
    }
    await page.keyboard.press('Escape')
    await waitForStep(page, 'pwyw')
  })
})

test.describe('the gift (PLAN-B 4.3)', () => {
  test('opens by itself, reveals 70 %, grants the discount once and never comes back', async ({
    page,
  }) => {
    await seed(page)
    await page.goto('/s/plan')
    await waitForStep(page, 'plan')
    await expect(gift(page)).toBeVisible({ timeout: 10_000 })
    await expect(gift(page)).toHaveAccessibleName('Pick a gift to reveal your discount.')
    await expect(gift(page).getByRole('button')).toHaveCount(3)

    // Escape and a click on the veil do not close it: it asks for an answer.
    await page.keyboard.press('Escape')
    await expect(gift(page)).toBeVisible()
    await expect(page).toHaveURL(/\/s\/plan/)

    await gift(page).getByRole('button', { name: 'Gift 1 of 3' }).click({ force: true })
    await expect(gift(page)).toHaveAccessibleName('70% off is yours.')
    await expect(page.getByText('RESERVED FOR YOU')).toBeVisible()
    await gift(page).getByRole('button', { name: 'Apply my discount' }).click()
    await expect(gift(page)).toHaveCount(0)
    await expect(page.getByTestId('discount-banner')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await page.waitForTimeout(2600)
    await expect(gift(page)).toHaveCount(0)
    await expect(page.getByTestId('discount-banner')).toBeVisible()
  })

  test('keeps the focus inside while it is open', async ({ page }) => {
    await seed(page)
    await page.goto('/s/plan')
    await expect(gift(page)).toBeVisible({ timeout: 10_000 })
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab')
      const inside = await page.evaluate(
        () =>
          document.activeElement
            ?.closest('[role="dialog"]')
            ?.textContent?.includes('ONE LAST THING') ?? false,
      )
      expect(inside, `Tab ${i + 1}`).toBe(true)
    }
  })

  test.describe('with reduced motion', () => {
    test.use({ reducedMotion: 'reduce' })

    test('the gifts do not float and no confetti falls', async ({ page }) => {
      await seed(page)
      await page.goto('/s/plan')
      await expect(gift(page)).toBeVisible({ timeout: 10_000 })
      const animation = await gift(page)
        .getByRole('button', { name: 'Gift 1 of 3' })
        .evaluate((el) => getComputedStyle(el).animationName)
      expect(animation).toBe('none')
      await gift(page).getByRole('button', { name: 'Gift 1 of 3' }).click({ force: true })
      await expect(gift(page)).toHaveAccessibleName('70% off is yours.')
      const confetti = await page.evaluate(() => {
        const piece = document.querySelector('[class*="confetti"]')
        return piece ? getComputedStyle(piece).display : 'none'
      })
      expect(confetti).toBe('none')
    })
  })
})

test.describe('the countdown (guardrail 5, behind paywall.countdown.enabled)', () => {
  test('is off by default: no timer, "Your plan is ready", and the discount does not end', async ({
    page,
  }) => {
    await seed(page, discounted(null))
    await page.goto('/s/plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByText('Your plan is ready')).toBeVisible()
    await expect(page.getByRole('timer')).toHaveCount(0)
    await page.waitForTimeout(3000)
    await expect(page.getByTestId('discount-banner')).toBeVisible()
  })

  test('starts when the discount is granted and does not restart on reload', async ({ page }) => {
    await seed(page)
    await page.goto('/s/plan?countdown')
    await waitForStep(page, 'plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByRole('timer')).toHaveCount(0)
    await pickAndApplyGift(page)
    await expect(page.getByTestId('sheet-timer')).toContainText(/^(15:00|14:5\d)$/)
    await expect(
      page.getByText('Your discount has been reserved for the next 15 minutes'),
    ).toBeVisible()

    await page.waitForTimeout(2500)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await page.waitForTimeout(1500)
    const clock = (await page.getByTestId('sheet-timer').textContent())!
    expect(clock < '14:58', `the clock read ${clock}`).toBe(true)
    await expect(gift(page)).toHaveCount(0)
  })

  test('really ends the discount: no coupon, no banner, the list price, and never restarts', async ({
    page,
  }) => {
    await seedDiscountEndingIn(page, 3500)
    await page.goto('/s/plan?countdown')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByTestId('discount-banner')).toBeVisible()
    await expect(page.getByTestId('plan-billed')).toHaveText('$39.99 billed every 2 months')

    await expect(page.getByText('Your discount has ended')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('promo-code')).toHaveCount(0)
    await expect(page.getByTestId('discount-banner')).toHaveCount(0)
    await expect(page.getByTestId('plan-billed')).toHaveText('$133.30 billed every 2 months')
    await expect(page.getByTestId('charge-summary')).toContainText('Then $133.30 every 2 months')
    await expect(page.getByTestId('legal')).toContainText('will charge you $133.30 on')

    await page.reload()
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await expect(page.getByText('Your discount has ended')).toBeVisible()
    await expect(page.getByTestId('discount-banner')).toHaveCount(0)
    await page.waitForTimeout(2600)
    await expect(gift(page)).toHaveCount(0)
  })
})

test.describe('where the visit comes from (PLAN-B 3.1 and 6.6)', () => {
  const AD =
    'utm_source=facebook&utm_medium=paid&utm_campaign=c1&utm_content=a2&utm_term=t3&placement=Instagram_Reels&site_source_name=ig'

  test('keeps the UTM parameters of an ad URL and attaches them to the events', async ({
    page,
  }) => {
    await page.goto(`/onboarding/bloom-initial-pwyw?${AD}`)
    await waitForStep(page, 'intro')
    const url = new URL(page.url())
    expect(url.pathname).toBe('/s/intro')
    expect(url.searchParams.get('slug')).toBe('bloom-initial-pwyw')
    expect(url.searchParams.get('utm_campaign')).toBe('c1')

    const attribution = {
      utm_source: 'facebook',
      utm_medium: 'paid',
      utm_campaign: 'c1',
      utm_content: 'a2',
      utm_term: 't3',
      placement: 'Instagram_Reels',
      site_source_name: 'ig',
      slug: 'bloom-initial-pwyw',
    }
    expect(
      await page.evaluate(() => JSON.parse(sessionStorage.getItem('bloom.funnel.v1')!).attribution),
    ).toEqual(attribution)
    expect(await page.evaluate(() => window.__bloomEvents?.[0])).toEqual({
      name: 'funnel_start',
      attribution,
    })

    // It follows the visitor through the funnel, with the query string.
    await answerStep(page)
    await waitForStep(page, 'drained')
    expect(new URL(page.url()).searchParams.get('utm_source')).toBe('facebook')
    const view = await page.evaluate(() =>
      window.__bloomEvents?.find((event) => event.name === 'step_view' && event.id === 'drained'),
    )
    expect(view).toMatchObject({ attribution })
  })

  test('the slug of the paywall funnel picks its headline and its closing', async ({ page }) => {
    await seed(page, { ...SESSION, furthest: 40 })
    await page.goto('/onboarding/bloom-initial-paywall?utm_source=facebook')
    await waitForStep(page, 'intro')
    await expect(
      page.getByRole('heading', { name: "You're not lazy, you might be burning out." }),
    ).toBeVisible()
    // Even after the query string is gone, the stored first-touch slug picks the closing.
    await page.goto('/s/loading')
    await waitForStep(page, 'paywall')
  })

  test('ignores an unknown slug and what is not an attribution parameter', async ({ page }) => {
    await page.goto('/onboarding/not-a-funnel?utm_source=google&email=a%40b.co&secret=1')
    await waitForStep(page, 'intro')
    const stored = await page.evaluate(
      () => JSON.parse(sessionStorage.getItem('bloom.funnel.v1')!).attribution,
    )
    expect(stored).toEqual({ utm_source: 'google' })
  })
})

for (const width of [360, 390, 430]) {
  test.describe(`phone ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true })

    const report = (page: Page) =>
      page.evaluate(() => {
        const overflow = document.scrollingElement!.scrollWidth - window.innerWidth
        const inner = document.querySelector<HTMLElement>('[data-testid="sheet-scroll"]')
        const innerOverflow = inner ? inner.scrollWidth - inner.clientWidth : 0
        const small: string[] = []
        for (const el of document.querySelectorAll<HTMLElement>(
          'button, [role="radio"], [role="checkbox"], input, a[href]',
        )) {
          const box = el.getBoundingClientRect()
          if (!box.width || !box.height || el.closest('[inert]')) continue
          // Links inside running text are exempt (WCAG 2.5.8).
          if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') continue
          if (box.width < 44 || box.height < 44)
            small.push(`${el.tagName} ${Math.round(box.width)}x${Math.round(box.height)}`)
        }
        return { overflow, innerOverflow, small }
      })

    test('pay what you want does not scroll sideways and every control is 44 px', async ({
      page,
    }) => {
      await seed(page, { ...SESSION, furthest: 41 })
      await page.goto('/s/pwyw')
      await waitForStep(page, 'pwyw')
      expect(await report(page)).toEqual({ overflow: 0, innerOverflow: 0, small: [] })
    })

    test('the plan sheet fills the screen, does not scroll sideways and every control is 44 px', async ({
      page,
    }) => {
      await seed(page, discounted())
      await page.goto('/s/plan')
      await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
      await page.waitForTimeout(900)
      const box = await sheet(page).boundingBox()
      expect(box).toMatchObject({ x: 0, y: 0, width })
      expect(await report(page)).toEqual({ overflow: 0, innerOverflow: 0, small: [] })
    })

    test('the gift fits the screen', async ({ page }) => {
      await seed(page)
      await page.goto('/s/plan')
      await expect(gift(page)).toBeVisible({ timeout: 10_000 })
      const box = await gift(page).boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)
      expect(await report(page)).toMatchObject({ overflow: 0 })
    })
  })
}

test.describe('accessibility (axe)', () => {
  const analyze = async (page: Page) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    return results.violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
    )
  }

  test('pay what you want has no WCAG A/AA violations', async ({ page }) => {
    await seed(page, { ...SESSION, furthest: 41 })
    await page.goto('/s/pwyw')
    await waitForStep(page, 'pwyw')
    await page.waitForTimeout(1500)
    expect(await analyze(page)).toEqual([])
  })

  test('the plan sheet has no WCAG A/AA violations', async ({ page }) => {
    await seed(page, discounted())
    await page.goto('/s/plan')
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await page.waitForTimeout(1500)
    expect(await analyze(page)).toEqual([])
  })

  test('the plan sheet with the countdown running has none either', async ({ page }) => {
    await seedDiscountEndingIn(page, 10 * 60 * 1000)
    await page.goto('/s/plan?countdown')
    await expect(page.getByTestId('sheet-timer')).toBeVisible()
    await page.waitForTimeout(1200)
    expect(await analyze(page)).toEqual([])
  })

  test('the gift dialog, picked and not, has none', async ({ page }) => {
    await seed(page)
    await page.goto('/s/plan')
    await expect(gift(page)).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(600)
    expect(await analyze(page)).toEqual([])
    await gift(page).getByRole('button', { name: 'Gift 3 of 3' }).click({ force: true })
    await expect(gift(page)).toHaveAccessibleName('70% off is yours.')
    await page.waitForTimeout(800)
    expect(await analyze(page)).toEqual([])
  })
})
