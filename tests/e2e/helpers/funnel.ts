import { readFileSync } from 'node:fs'
import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export interface ReferenceStep {
  n: number
  id: string
  type: string
  header: boolean
  title?: string
}

/** The step catalogue of the reference funnel (docs/feature-parity/funnel.reference.json). */
export const REFERENCE = JSON.parse(
  readFileSync(
    new URL('../../../docs/feature-parity/funnel.reference.json', import.meta.url),
    'utf8',
  ),
) as { steps: ReferenceStep[] }

export const stepId = (page: Page) => new URL(page.url()).pathname.replace(/^\/s\//, '')

/** The funnel stage of the step on screen (StepTransition), once it has settled. */
export const stage = (page: Page) => page.locator('[data-phase]')

export async function waitForStep(page: Page, id: string) {
  await expect(page).toHaveURL(new RegExp(`/s/${id}(\\?|$)`))
  await expect(stage(page)).toHaveAttribute('data-phase', 'idle')
}

/**
 * Answers whatever the current step asks for, the simplest way, and waits for the next step:
 * an option, a checkbox and Continue, a text field, the wand bubbles, the loader questions.
 */
export async function answerStep(page: Page, choice = 0) {
  const from = stepId(page)
  const radios = page.getByRole('radio')
  const checkboxes = page.getByRole('checkbox')
  const textbox = page.getByRole('textbox')
  const bubbles = page.getByRole('button', { name: /^Release / })

  if (from === 'loader') {
    // Two questions stop the bars; the loader then moves on by itself.
    for (let i = 0; i < 2; i++) {
      const dialog = page.getByRole('dialog')
      await dialog.waitFor({ timeout: 15_000 })
      await dialog.getByRole('button', { name: 'Yes' }).click()
      await dialog.waitFor({ state: 'detached' })
    }
  } else if (from === 'loading') {
    // Moves on by itself.
  } else if (from === 'paywall') {
    await page.getByRole('button', { name: 'Continue' }).click()
  } else if (await radios.count()) {
    await radios.nth(choice).click()
  } else if (await checkboxes.count()) {
    await checkboxes.nth(choice).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  } else if (await textbox.count()) {
    const type = await textbox.first().getAttribute('type')
    await textbox.first().fill(type === 'email' ? 'qa@example.com' : 'Sam')
    await page.getByRole('button', { name: 'Continue' }).click()
  } else if (await bubbles.count()) {
    // The bubbles drift on every frame, so they never pass Playwright's "stable" check.
    for (let i = 0; i < 3; i++) await bubbles.first().click({ force: true })
    await page.getByRole('button', { name: 'Continue' }).click()
  } else {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
  await expect(page).not.toHaveURL(new RegExp(`/s/${from}(\\?|$)`), { timeout: 20_000 })
  await expect(stage(page)).toHaveAttribute('data-phase', 'idle')
}

/** Walks forward from the current step until `id` is on screen. */
export async function walkTo(page: Page, id: string) {
  for (let guard = 0; guard < 45 && stepId(page) !== id; guard++) await answerStep(page)
  await waitForStep(page, id)
}
