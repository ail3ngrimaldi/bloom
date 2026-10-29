import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { waitForStep } from './helpers/funnel'

/** Phase 9 (PLAN 8.3): responsive layouts, touch targets, no-JS behaviour, layout stability. */

const FINISHED_SESSION = {
  answers: {
    drained: 'often',
    adhd: 'diagnosed',
    control_life: 'few_weeks',
    wand: ['anxiety'],
    gender: 'female',
  },
  lead: { email: 'qa@example.com', name: 'Sam' },
  selectedPlanId: null,
  paywallStartedAt: null,
  furthest: 42,
}

async function seed(page: Page) {
  await page.addInitScript((state) => {
    sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(state))
  }, FINISHED_SESSION)
}

const SCREENS = [
  'intro',
  'drained',
  'adhd',
  'wand',
  'sacrifice',
  'science',
  'match',
  'evidence',
  'expert',
  'summary',
  'loader',
  'email',
  'paywall',
  'checkout',
]

for (const width of [360, 390, 430]) {
  test.describe(`phone ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true })

    test('no screen scrolls sideways and every control is at least 44 px', async ({ page }) => {
      test.setTimeout(120_000)
      await seed(page)
      for (const id of SCREENS) {
        await page.goto(`/s/${id}?qa`)
        await waitForStep(page, id)
        const report = await page.evaluate(() => {
          const overflow = document.scrollingElement!.scrollWidth - window.innerWidth
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
          return { overflow, small }
        })
        expect(report, id).toEqual({ overflow: 0, small: [] })
      }
    })

    test('the quiz card goes full-bleed', async ({ page }) => {
      await seed(page)
      await page.goto('/s/drained?qa')
      await waitForStep(page, 'drained')
      const card = await page.locator('[data-frame-step]').boundingBox()
      expect(card).toMatchObject({ x: 0, y: 0, width })
    })
  })
}

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the intro is fully rendered on the server', async ({ page }) => {
    await page.goto('/s/intro')
    await expect(
      page.getByRole('heading', { name: "You're not lazy, you might be burning out." }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
  })

  test('other steps explain that JavaScript is needed', async ({ page }) => {
    await page.goto('/s/drained')
    // Playwright's text engine skips <noscript>, so the message is found by CSS.
    const message = page.locator('noscript p, [data-frame-step] > p')
    await expect(message).toBeVisible()
    expect(await message.textContent()).toContain('Bloom needs JavaScript to show this step.')
  })
})

test('the layout does not shift while walking the first steps (CLS < 0.1)', async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as unknown as { __cls: number }).__cls = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as Array<
        PerformanceEntry & { value: number; hadRecentInput: boolean }
      >)
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value
    }).observe({ type: 'layout-shift', buffered: true })
  })
  await page.goto('/s/intro')
  await waitForStep(page, 'intro')
  await page.getByRole('button', { name: 'Continue' }).click()
  await waitForStep(page, 'drained')
  await page.getByRole('radio', { name: 'Often' }).click()
  await waitForStep(page, 'overthink')
  await page.getByRole('radio', { name: 'Often' }).click()
  await waitForStep(page, 'sleep')
  const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
  expect(cls).toBeLessThan(0.1)
})

test('plans can be chosen with the keyboard', async ({ page }) => {
  await seed(page)
  await page.goto('/s/paywall?qa')
  await waitForStep(page, 'paywall')
  await page.getByRole('radio', { name: /^1 month plan/ }).focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: /^3 month plan/ })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('radio', { name: /^3 month plan/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
})
