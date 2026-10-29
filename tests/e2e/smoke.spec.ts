import { expect, test } from '@playwright/test'

test('app starts at 1280x720 and renders the product name', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Bloom' })).toBeVisible()
  expect(page.viewportSize()).toEqual({ width: 1280, height: 720 })
  expect(consoleErrors).toEqual([])
})
