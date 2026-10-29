import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { REFERENCE, answerStep, stage, stepId, waitForStep, walkTo } from './helpers/funnel'

/** Phase 2 acceptance (PLAN 7): the engine, the 28 questions, progress and transitions. */

test.describe('entry and routing', () => {
  test('the root redirects to the first step and keeps the campaign parameters', async ({
    page,
  }) => {
    await page.goto('/?utm_source=ad')
    await waitForStep(page, 'intro')
    expect(new URL(page.url()).search).toBe('?utm_source=ad')

    await answerStep(page)
    await waitForStep(page, 'drained')
    expect(new URL(page.url()).search).toBe('?utm_source=ad')
  })

  test('an unknown step is a 404', async ({ page }) => {
    const response = await page.goto('/s/nope')
    expect(response?.status()).toBe(404)
  })

  test('a deep link past the furthest step reached goes back to the start', async ({ page }) => {
    await page.goto('/s/paywall')
    await waitForStep(page, 'intro')
  })

  test('?qa skips that guard in development (QA only, never in production)', async ({ page }) => {
    await page.goto('/s/age?qa')
    await waitForStep(page, 'age')
    await expect(page.getByRole('heading', { name: 'What is your age?' })).toBeVisible()
  })
})

test.describe('walking the funnel', () => {
  test.use({ reducedMotion: 'reduce' })

  test('goes through the 28 questions in order with the reference wording and progress', async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    await page.goto('/s/intro')
    await waitForStep(page, 'intro')

    for (const ref of REFERENCE.steps.filter((step) => step.n < 36)) {
      await waitForStep(page, ref.id)
      const progress = page.getByRole('progressbar')
      if (ref.type === 'single') {
        // Same question as the reference ({{brand}} is Bloom here).
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          ref.title!.replace('{{brand}}', 'Bloom'),
        )
        await expect(progress).toHaveAttribute(
          'aria-valuenow',
          String(Math.round(((ref.n - 1) / 39) * 100)),
        )
      }
      if (ref.type === 'multi') {
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(ref.title!)
      }
      // The header shows on single, intro and capture only.
      await expect(progress).toHaveCount(ref.header ? 1 : 0)
      await answerStep(page)
    }

    await waitForStep(page, 'summary')
    expect(consoleErrors).toEqual([])
  })

  test('resumes on the same step after a reload, with the answers kept', async ({ page }) => {
    await page.goto('/s/intro')
    await walkTo(page, 'sleep')
    await page.reload()
    await waitForStep(page, 'sleep')

    await page.goBack()
    await waitForStep(page, 'overthink')
    await expect(page.getByRole('radio', { name: 'Always' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  test("the browser's Back goes one step back and Forward returns", async ({ page }) => {
    await page.goto('/s/intro')
    await walkTo(page, 'overthink')
    await page.goBack()
    await waitForStep(page, 'drained')
    await page.goForward()
    await waitForStep(page, 'overthink')
  })

  test('personalises the copy with the gender answer', async ({ page }) => {
    await page.goto('/s/gender?qa')
    await waitForStep(page, 'gender')
    await page.getByRole('radio', { name: 'Male', exact: true }).click()
    await waitForStep(page, 'age')
    await answerStep(page)
    await waitForStep(page, 'science')
    await expect(page.getByText('Made for men like you')).toBeVisible()
  })

  test('multi-select keeps Continue disabled until a row is checked', async ({ page }) => {
    await page.goto('/s/sacrifice?qa')
    await waitForStep(page, 'sacrifice')
    const cta = page.getByRole('button', { name: 'Continue' })
    await expect(cta).toBeDisabled()
    await page.getByRole('checkbox', { name: 'Sleep' }).click()
    await expect(cta).toBeEnabled()
    await page.keyboard.press('Space')
    await expect(page.getByRole('checkbox', { name: 'Sleep' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  test('can be answered with the keyboard alone', async ({ page }) => {
    await page.goto('/s/drained?qa')
    await waitForStep(page, 'drained')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('radio', { name: 'Always' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('radio', { name: 'Often' })).toBeFocused()
    await page.keyboard.press('Enter')
    await waitForStep(page, 'overthink')
    await expect(page.getByRole('heading', { name: 'Do you overthink?' })).toBeFocused()
  })
})

test.describe('transition between questions (PLAN 4.4)', () => {
  test('selects at once, then fades the content out and in while the card stays', async ({
    page,
  }) => {
    await page.goto('/s/drained?qa')
    await waitForStep(page, 'drained')
    const card = page.locator('[data-frame-step]')
    await card.evaluate((el) => el.setAttribute('data-test-marker', 'same-card'))

    const started = Date.now()
    await page.getByRole('radio', { name: 'Often' }).click()
    await expect(page.getByRole('radio', { name: 'Often' })).toHaveAttribute('aria-checked', 'true')
    await expect(stage(page)).toHaveAttribute('data-phase', 'out')
    await expect(page.getByRole('heading', { name: 'Do you overthink?' })).toBeVisible()
    await expect(stage(page)).toHaveAttribute('data-phase', 'idle')
    const elapsed = Date.now() - started

    // 150 ms selected + 400 out + 150 gap + 300 in = 1 s (plus test overhead).
    expect(elapsed).toBeGreaterThanOrEqual(900)
    expect(elapsed).toBeLessThan(2500)
    await expect(card).toHaveAttribute('data-test-marker', 'same-card')
    expect(stepId(page)).toBe('overthink')
  })
})

test.describe('intro and interstitials (phase 3)', () => {
  // Wording of the reference's claims that Bloom has no evidence for (PLAN 2, guardrails 1 to 3).
  const CLAIMS =
    /million|as featured|new york times|wired|forbes|girlboss|healthline|stanford|duke|harvard|jazmin|reviewed by/i

  test('the intro reveals everything within about a second, CTA at the bottom', async ({
    page,
  }) => {
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    const cta = page.getByRole('button', { name: 'Continue' })
    await expect(cta).toBeVisible()
    await page.waitForTimeout(1200)
    const opacities = await page.evaluate(() =>
      [...document.querySelectorAll('[data-phase] *')].map((el) => getComputedStyle(el).opacity),
    )
    expect(opacities.every((value) => value === '1')).toBe(true)
    const box = await cta.boundingBox()
    expect(Math.round(box!.y + box!.height)).toBe(720 - 56)
  })

  for (const id of ['science', 'not_alone', 'evidence', 'expert']) {
    test(`/s/${id} enables its CTA about 0.5 s after it shows and makes no claims`, async ({
      page,
    }) => {
      await page.goto(`/s/${id}?qa`)
      const cta = page.getByRole('button', { name: 'Continue' })
      await expect(cta).toBeDisabled()
      await expect(cta).toBeEnabled()
      expect(await page.locator('main, body').first().innerText()).not.toMatch(CLAIMS)
      const box = await cta.boundingBox()
      expect(Math.round(box!.y + box!.height)).toBe(720 - 56)
    })
  }

  test('the match merges the circles, then shows the check and the CTA', async ({ page }) => {
    await page.goto('/s/match?qa')
    await waitForStep(page, 'match')
    const cta = page.getByRole('button', { name: 'Continue' })
    await expect(cta).toBeDisabled()
    await expect(page.getByRole('heading', { name: "It's a match." })).toBeVisible()
    await expect(cta).toBeEnabled({ timeout: 5000 })
    await cta.click()
    await waitForStep(page, 'not_alone')
  })
})

test.describe('accessibility (axe)', () => {
  for (const id of [
    'intro',
    'drained',
    'adhd',
    'sacrifice',
    'science',
    'match',
    'not_alone',
    'evidence',
    'expert',
  ]) {
    test(`/s/${id} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`/s/${id}?qa`)
      await waitForStep(page, id)
      // Let entrance animations finish: axe would read half-transparent text as low contrast.
      await page.waitForTimeout(2500)
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()
      expect(
        results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
        ),
      ).toEqual([])
    })
  }
})
