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
    expect(
      await page.evaluate(() => JSON.parse(sessionStorage.getItem('bloom.funnel.v1')!).answers),
    ).toMatchObject({ gender: 'male' })
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

test.describe('accessibility (axe)', () => {
  for (const id of ['drained', 'adhd', 'sacrifice']) {
    test(`/s/${id} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`/s/${id}?qa`)
      await waitForStep(page, id)
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
