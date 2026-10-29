import { expect, test } from '@playwright/test'

test('the root opens the funnel at 1280x720 without console errors', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')

  await expect(page).toHaveURL(/\/s\/intro$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(page.viewportSize()).toEqual({ width: 1280, height: 720 })
  expect(consoleErrors).toEqual([])
})

test('self-hosts its fonts and sends no request off the app origin', async ({ page, baseURL }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))

  await page.goto('/s/intro')
  await page.getByRole('heading', { level: 1 }).waitFor()
  await page.evaluate(() => document.fonts.ready)

  const origin = new URL(baseURL!).origin
  const offOrigin = requests.filter((url) => !url.startsWith('data:') && !url.startsWith(origin))
  expect(offOrigin).toEqual([])
  expect(requests.filter((url) => url.includes('.woff2')).length).toBeGreaterThanOrEqual(2)
  expect(await page.evaluate(() => [...document.fonts].map((font) => font.status))).toContain(
    'loaded',
  )
})

test('has the document metadata of the layout', async ({ page }) => {
  await page.goto('/s/intro')
  await expect(page).toHaveTitle('Bloom')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#eceaff')
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('type', 'image/svg+xml')
})
