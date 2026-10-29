import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

/**
 * Phase 1 acceptance: the dev-only gallery twins of reference images 03 and 06 must keep the
 * measures of PLAN 4.3 (1280x720 viewport => card 375 x 658). Positions are relative to the card.
 */

const TOLERANCE = 1

async function open(page: Page, path: string) {
  await page.goto(path)
  await page.locator('[role="radio"], [role="checkbox"], h1').first().waitFor()
  await page.evaluate(() => document.fonts.ready)
}

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('element has no box')
  return b
}

async function relative(page: Page, locator: Locator) {
  const card = await box(page.locator('[class*="card"]').first())
  const b = await box(locator)
  return {
    top: b.y - card.y,
    left: b.x - card.x,
    width: b.width,
    height: b.height,
    bottom: b.y + b.height - card.y,
  }
}

function near(actual: number, expected: number) {
  expect(Math.abs(actual - expected), `${actual} vs ${expected}`).toBeLessThanOrEqual(TOLERANCE)
}

test.describe('quiz-single (reference image 03)', () => {
  test.beforeEach(async ({ page }) => open(page, '/__gallery/quiz-single'))

  test('card, header, title and options follow the measures of PLAN 4.3', async ({ page }) => {
    const card = page.locator('[class*="card"]').first()
    const cardBox = await box(card)
    near(cardBox.width, 375)
    near(cardBox.height, 720 - 62)
    near(cardBox.y, 32)
    near(cardBox.x, (1280 - 375) / 2)
    expect(await card.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('32px')
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none')

    const logo = await relative(page, page.locator('header svg'))
    near(logo.top, 42)
    near(logo.height, 26)

    const progress = page.getByRole('progressbar')
    const bar = await relative(page, progress)
    near(bar.top, 75)
    near(bar.height, 3)
    near(bar.width, 333)
    expect(await progress.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('2px')

    near((await relative(page, page.locator('h1'))).top, 124)

    const options = page.getByRole('radio')
    await expect(options).toHaveCount(4)
    const rects = []
    for (let i = 0; i < 4; i++) rects.push(await relative(page, options.nth(i)))
    for (const rect of rects) {
      near(rect.width, 333)
      near(rect.height, 72)
      near(rect.left, 21)
    }
    for (let i = 1; i < 4; i++) near(rects[i].top - rects[i - 1].bottom, 9)
    // 24px below the 2-line title (124 + 48).
    near(rects[0].top, 124 + 48 + 24)
    expect(await options.first().evaluate((el) => getComputedStyle(el).borderRadius)).toBe('12px')
  })

  test('puts the label at the bottom left of the option', async ({ page }) => {
    const option = await box(page.getByRole('radio').first())
    const label = await box(page.getByRole('radio').first().locator('span'))
    near(label.x - option.x, 16)
    near(option.y + option.height - (label.y + label.height), 16)
  })

  test('hover, selection and keyboard behave like the reference', async ({ page }) => {
    const options = page.getByRole('radio')
    const background = (i: number) =>
      options.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor)

    expect(await background(1)).toBe('rgb(255, 255, 255)')
    await options.nth(1).hover()
    await expect.poll(() => background(1)).toBe('rgb(228, 225, 253)')
    await page.mouse.move(2, 2)

    await page.keyboard.press('Tab')
    await expect(options.first()).toBeFocused()
    expect(await options.first().evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await expect(options.nth(2)).toBeFocused()
    await page.keyboard.press('Space')
    await expect(options.nth(2)).toHaveAttribute('aria-checked', 'true')
    await expect.poll(() => background(2)).toBe('rgb(228, 225, 253)')
    await page.keyboard.press('Tab')
    await expect(options.nth(2)).not.toBeFocused()
  })
})

test.describe('quiz-multi (reference image 06)', () => {
  test.beforeEach(async ({ page }) => open(page, '/__gallery/quiz-multi'))

  test('rows, checkbox and CTA follow the measures of PLAN 4.3', async ({ page }) => {
    const card = await box(page.locator('[class*="card"]').first())
    const rows = page.getByRole('checkbox')
    await expect(rows).toHaveCount(5)
    const rects = []
    for (let i = 0; i < 5; i++) rects.push(await relative(page, rows.nth(i)))
    for (const rect of rects) {
      near(rect.width, 325)
      near(rect.height, 56)
      near(rect.left, 25)
    }
    for (let i = 1; i < 5; i++) near(rects[i].top - rects[i - 1].bottom, 9)

    const cta = await relative(page, page.getByRole('button', { name: 'Continue' }))
    near(cta.width, 325)
    near(cta.height, 52)
    near(card.height - cta.bottom, 26)
    expect(
      await page
        .getByRole('button', { name: 'Continue' })
        .evaluate((el) => getComputedStyle(el).borderRadius),
    ).toBe('10px')

    // Block (title to last row) is centred above the CTA, lifted by about 6px.
    const title = await relative(page, page.locator('h1'))
    const top = title.top
    const bottom = cta.top - rects[4].bottom
    near(bottom - top, 12)

    const row = rows.nth(0)
    const rowBox = await box(row)
    const checkbox = await box(row.locator('span').first())
    near(checkbox.width, 24)
    near(checkbox.height, 24)
    near(checkbox.x - rowBox.x, 17)
    const label = await box(row.locator('span').last())
    near(label.x - rowBox.x, 59)
    expect(
      await row
        .locator('span')
        .first()
        .evaluate((el) => getComputedStyle(el).borderRadius),
    ).toBe('6px')
  })

  test('checkbox and row colours', async ({ page }) => {
    const rows = page.getByRole('checkbox')
    const style = (i: number, selector?: string) =>
      rows
        .nth(i)
        .evaluate(
          (el, s) => getComputedStyle(s ? (el.querySelector(s) as Element) : el).backgroundColor,
          selector,
        )
    // Nutrition (1) and Your own goals (3) start selected; Sleep (0) does not.
    expect(await style(0)).toBe('rgb(255, 255, 255)')
    expect(await style(1)).toBe('rgb(227, 224, 254)')
    expect(await style(0, 'span')).toBe('rgb(236, 234, 255)')
    expect(await style(1, 'span')).toBe('rgb(100, 84, 254)')
  })

  test('Space toggles a row, Enter does not, and an empty selection disables the CTA', async ({
    page,
  }) => {
    const rows = page.getByRole('checkbox')
    await rows.nth(0).focus()
    await page.keyboard.press('Enter')
    await expect(rows.nth(0)).toHaveAttribute('aria-checked', 'false')
    await page.keyboard.press('Space')
    await expect(rows.nth(0)).toHaveAttribute('aria-checked', 'true')

    const cta = page.getByRole('button', { name: 'Continue' })
    await expect(cta).toBeEnabled()
    for (const i of [0, 1, 3]) await rows.nth(i).click()
    await expect(cta).toBeDisabled()
    await expect.poll(() => cta.evaluate((el) => getComputedStyle(el).opacity)).toBe('0.35')
  })
})

test.describe('responsive card', () => {
  test('is full-bleed below 480px with no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await open(page, '/__gallery/quiz-single')
    const card = page.locator('[class*="card"]').first()
    expect(await box(card)).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
    const style = await card.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { radius: cs.borderRadius, margin: cs.margin }
    })
    expect(style).toEqual({ radius: '0px', margin: '0px' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390)
    for (const option of await page.getByRole('radio').all()) {
      expect((await box(option)).height).toBeGreaterThanOrEqual(44)
    }
  })

  test('keeps the 375px card from 480px up', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await open(page, '/__gallery/quiz-single')
    const card = page.locator('[class*="card"]').first()
    near((await box(card)).width, 375)
    expect(await card.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('32px')
  })
})

test.describe('motion', () => {
  const phases = (page: Page) =>
    page.evaluate(async () => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.textContent === 'Next step',
      )
      const seen: Array<[number, string]> = []
      const start = performance.now()
      button?.click()
      await new Promise<void>((resolve) => {
        const tick = () => {
          const phase = document.querySelector('[data-phase]')?.getAttribute('data-phase') ?? ''
          if (seen.at(-1)?.[1] !== phase) seen.push([Math.round(performance.now() - start), phase])
          if (performance.now() - start < 1200) requestAnimationFrame(tick)
          else resolve()
        }
        requestAnimationFrame(tick)
      })
      return seen
    })

  test('step transition runs out 400, gap 150, in 300 and never resizes its frame', async ({
    page,
  }) => {
    await open(page, '/__gallery')
    const frame = page.locator('[data-phase]').first().locator('..')
    const before = await box(frame)
    const seen = await phases(page)
    expect(seen.map(([, phase]) => phase)).toEqual(['out', 'gap', 'in', 'idle'])
    const [out, gap, entering, idle] = seen.map(([ms]) => ms)
    expect(gap - out).toBeGreaterThanOrEqual(380)
    expect(gap - out).toBeLessThanOrEqual(480)
    expect(entering - gap).toBeGreaterThanOrEqual(140)
    expect(entering - gap).toBeLessThanOrEqual(240)
    expect(idle - entering).toBeGreaterThanOrEqual(290)
    expect(idle - entering).toBeLessThanOrEqual(400)
    expect(await box(frame)).toEqual(before)
  })

  test('reduced motion shortens it to fades of at most 100 ms', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await open(page, '/__gallery')
    const seen = await phases(page)
    const total = seen.at(-1)![0] - seen[0][0]
    expect(total).toBeLessThanOrEqual(320)
    const arrow = page.locator('[class*="arrowLine"]').first()
    expect(await arrow.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s')
  })

  test('the CTA arrow stretches from 15px to 25px on hover', async ({ page }) => {
    await open(page, '/__gallery')
    const button = page.getByRole('button', { name: 'Continue' }).first()
    const shaft = button.locator('[class*="arrowLine"]')
    near((await box(shaft)).width, 15)
    await button.hover()
    await expect.poll(async () => Math.round((await box(shaft)).width)).toBe(25)
  })
})

test.describe('modal', () => {
  test('traps focus, closes on ESC, returns focus and releases the scroll lock', async ({
    page,
  }) => {
    await open(page, '/__gallery')
    const opener = page.getByRole('button', { name: /Open sheet modal/ })
    await opener.click()
    const dialog = page.getByRole('dialog', { name: 'Do you tend to lose motivation easily?' })
    await expect(dialog).toBeVisible()
    expect(await box(dialog)).toMatchObject({ width: 375, height: 648 })
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
      true,
    )
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('')
  })

  test('checkout modal is at most 430 x 630 and scrolls inside', async ({ page }) => {
    await open(page, '/__gallery')
    await page.getByRole('button', { name: /Open checkout modal/ }).click()
    const dialog = page.getByRole('dialog')
    const size = await box(dialog)
    expect(size.width).toBeLessThanOrEqual(430)
    expect(size.height).toBeLessThanOrEqual(630)
    expect(await dialog.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
    expect(await dialog.evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor)).toBe(
      'rgba(0, 0, 0, 0.6)',
    )
  })
})

test.describe('first paint', () => {
  test.use({ javaScriptEnabled: false })

  test('is lilac before any JavaScript runs (no black or white flash)', async ({ page }) => {
    await page.goto('/')
    const colours = await page.evaluate(() => [
      getComputedStyle(document.documentElement).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
    ])
    expect(colours).toEqual(['rgb(236, 234, 255)', 'rgb(236, 234, 255)'])
  })
})

test.describe('accessibility (axe)', () => {
  for (const path of ['/__gallery', '/__gallery/quiz-single', '/__gallery/quiz-multi']) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await open(page, path)
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
