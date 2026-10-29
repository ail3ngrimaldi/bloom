import { mkdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { STEPS } from '../src/funnel/steps'

const OUT = 'docs/feature-parity/shots'

/**
 * A plausible finished session so every screen has data: answers like the recorded walkthrough
 * (male, three bubbles released, a few weeks), a made-up lead and the default plan. Never the
 * reference's real email or name (PLAN 2, guardrail 8).
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
  furthest: STEPS.length,
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

for (const step of STEPS) {
  test(`#${String(step.n).padStart(2, '0')} ${step.id}`, async ({ page }) => {
    await page.addInitScript((state) => {
      sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(state))
    }, DEMO_STATE)
    await page.goto(`/s/${step.id}?qa`)
    await expect(page.locator('[data-phase]')).toHaveAttribute('data-phase', 'idle')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(SETTLE_MS[step.id] ?? 300)
    await page.screenshot({ path: `${OUT}/${String(step.n).padStart(2, '0')}.png` })
  })
}

// Extra states of the reference images: the loader questions (15-loader-popups.png).
test('#37b loader question', async ({ page }) => {
  const answers: Record<string, unknown> = { ...DEMO_STATE.answers }
  delete answers.rushed_mornings
  delete answers.heard_habit_stacking
  await page.addInitScript(
    (state) => {
      sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(state))
    },
    { ...DEMO_STATE, answers },
  )
  await page.goto('/s/loader?qa')
  await page.getByRole('dialog').waitFor({ timeout: 10_000 })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/37b.png` })
})
