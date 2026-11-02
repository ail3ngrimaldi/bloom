import { mkdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { ALL_STEPS, closingOf } from '../src/funnel/steps'

const OUT = 'docs/feature-parity/shots'

/**
 * A plausible finished session so every screen has data: answers like the recorded walkthrough
 * (male, three bubbles released, a few weeks), a made-up lead and the default plan. Never the
 * reference's real email or name (PLAN 2, guardrail 7).
 */
const DEMO_STATE = {
  answers: {
    drained: 'often',
    overthink: 'often',
    sleep: 'often',
    selfcare: 'often',
    phone: 'often',
    juggling: 'yes',
    wand: ['self_doubt', 'anxiety', 'lack_of_motivation'],
    procrastinate: 'always',
    restart_habit: 'often',
    concentration: 'always',
    adhd: 'diagnosed',
    untapped: 'not_really',
    control_life: 'few_weeks',
    gender: 'male',
    age: '20s',
    others_needs: 'often',
    others_expect: 'often',
    say_no: 'often',
    sacrifice: ['nutrition', 'own_goals'],
    missing: ['motivation'],
    wish_understood: 'trying_hard',
    tried_habits: 'many_times',
    who_for: ['family', 'future_self'],
    lose_motivation: 'yes',
    expert_referral: 'yes',
    self_discipline: 'phases',
    need_most: 'habits',
    success_30d: ['eat_healthier', 'calmer'],
    biggest_motivation: 'stop_stuck',
    rushed_mornings: 'yes',
    heard_habit_stacking: 'no',
  },
  lead: { email: 'qa@example.com', name: 'Sam' },
  selectedPlanId: 'month_1',
  paywallStartedAt: null,
  furthest: 42,
  trialAmount: 2,
  discount: null,
  reminderOptIn: true,
  attribution: {},
}

/** The "pay what you want" closing's second screen, as it looks after the gift (b-10 to b-15). */
const WITH_DISCOUNT = {
  ...DEMO_STATE,
  discount: { pct: 70, code: 'off_70_october', grantedAt: 1_700_000_000_000, expiresAt: null },
}

/** Extra wait after the step settles, for screens that keep animating once they are in. */
const SETTLE_MS: Partial<Record<string, number>> = {
  intro: 1500,
  wand: 800,
  match: 2500,
  summary: 1200,
  loader: 2500,
  checkout: 1200,
}

test.use({ viewport: { width: 1280, height: 720 } })

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true })
})

const seed = (page: Page, state: unknown) =>
  page.addInitScript((value) => {
    sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(value))
  }, state)

const settled = async (page: Page) => {
  await expect(page.locator('[data-phase]')).toHaveAttribute('data-phase', 'idle')
  await page.evaluate(() => document.fonts.ready)
}

// One screenshot per step: the 40 shared ones and the paywall closing as NN.png, the "pay what you
// want" closing's #41 and #42 as B41.png and B42.png (the plan sheet states follow below).
for (const step of ALL_STEPS) {
  const closing = closingOf(step)
  const file = closing === 'pwyw' ? `B${step.n}` : String(step.n).padStart(2, '0')
  const state = step.id === 'plan' ? WITH_DISCOUNT : DEMO_STATE
  test(`#${String(step.n).padStart(2, '0')} ${step.id}`, async ({ page }) => {
    await seed(page, state)
    await page.goto(`/s/${step.id}?qa`)
    await settled(page)
    await page.waitForTimeout(SETTLE_MS[step.id] ?? (step.id === 'plan' ? 1800 : 300))
    await page.screenshot({ path: `${OUT}/${file}.png` })
  })
}

test('#01 intro of the paywall funnel (closing=paywall)', async ({ page }) => {
  await seed(page, DEMO_STATE)
  await page.goto('/s/intro?qa&closing=paywall')
  await settled(page)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${OUT}/01-paywall-funnel.png` })
})

// Extra states of the reference images: the loader questions (15-loader-popups.png).
test('#37b loader question', async ({ page }) => {
  const answers: Record<string, unknown> = { ...DEMO_STATE.answers }
  delete answers.rushed_mornings
  delete answers.heard_habit_stacking
  await seed(page, { ...DEMO_STATE, answers })
  await page.goto('/s/loader?qa')
  await page.getByRole('dialog').waitFor({ timeout: 10_000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/37b.png` })
})

// The plan sheet in its states (b-anim-02, b-09, b-10 to b-15, b-18).
test.describe('plan sheet states', () => {
  const sheet = (page: Page) => page.getByRole('dialog', { name: 'Your personalized plan' })
  const scroller = (page: Page) => page.getByTestId('sheet-scroll')
  const scrollTo = async (page: Page, fraction: number) => {
    await scroller(page).evaluate((el, f) => {
      el.scrollTop = (el.scrollHeight - el.clientHeight) * f
    }, fraction)
    await page.waitForTimeout(200)
  }

  test('B42 loading, gift and reveal', async ({ page }) => {
    await seed(page, DEMO_STATE)
    await page.goto('/s/plan?qa')
    await settled(page)
    await sheet(page).waitFor()
    await page.screenshot({ path: `${OUT}/B42-loading.png` })

    const gifts = page.getByRole('button', { name: /^Gift \d of 3$/ })
    await gifts.first().waitFor({ timeout: 10_000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${OUT}/B42a-gift-picker.png` })

    // The gifts float on every frame, so they never pass Playwright's "stable" check.
    await gifts.nth(1).click({ force: true })
    await page.waitForTimeout(600)
    await page.screenshot({ path: `${OUT}/B42b-gift-reveal.png` })
    await page.waitForTimeout(2200)
    await page.screenshot({ path: `${OUT}/B42c-gift-coupon.png` })
  })

  test('B42 sections by scroll position', async ({ page }) => {
    await seed(page, WITH_DISCOUNT)
    await page.goto('/s/plan?qa&countdown')
    await settled(page)
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await page.waitForTimeout(1200)
    const positions: Array<[string, number]> = [
      ['B43a-top', 0],
      ['B43b-plan', 0.14],
      ['B43c-payment', 0.27],
      ['B43d-legal-benefits', 0.45],
      ['B43e-faq-reviews', 0.62],
      ['B43f-expert', 0.8],
      ['B43g-letter', 1],
    ]
    for (const [name, fraction] of positions) {
      await scrollTo(page, fraction)
      await page.screenshot({ path: `${OUT}/${name}.png` })
    }
  })

  test('B42 with the countdown running (b-10, b-11)', async ({ page }) => {
    // The end of the discount is computed in the browser when the page starts.
    await page.addInitScript((state) => {
      const now = Date.now()
      sessionStorage.setItem(
        'bloom.funnel.v1',
        JSON.stringify({
          ...state,
          discount: {
            pct: 70,
            code: 'off_70_october',
            grantedAt: now - 147_000,
            expiresAt: now + 753_000,
          },
        }),
      )
    }, DEMO_STATE)
    await page.goto('/s/plan?qa&countdown')
    await settled(page)
    await expect(page.getByTestId('sheet-timer')).toBeVisible()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}/B42d-countdown-top.png` })
    await scrollTo(page, 0.1)
    await page.screenshot({ path: `${OUT}/B42e-countdown-coupon.png` })
  })

  test('B42 the whole sheet in one capture (b-18)', async ({ page }) => {
    await seed(page, WITH_DISCOUNT)
    await page.goto('/s/plan?qa')
    await settled(page)
    await expect(page.getByRole('heading', { name: 'Payment Options' })).toBeVisible()
    await page.waitForTimeout(800)
    // Let the sheet grow to its content so one screenshot holds every section.
    const height = await scroller(page).evaluate((el) => el.scrollHeight)
    await page.setViewportSize({ width: 1280, height: Math.min(height + 140, 9000) })
    await page.waitForTimeout(400)
    await page.screenshot({ path: `${OUT}/B42-full.png` })
  })
})
