import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { answerStep, waitForStep } from './helpers/funnel'

/**
 * The funnel's sound (src/services/sound): a music loop that starts with the visitor's first tap
 * and a click for answers, both switched off by one button whose choice is kept. The Chrome that
 * runs these tests has no speakers, so what the page asks the browser to play is recorded instead
 * of listened to.
 */

type Heard = 'music-play' | 'music-pause' | 'click'

/** Records the calls that make sound: the music starting and stopping, a click starting. */
async function recordSound(page: Page) {
  await page.addInitScript(() => {
    const log: string[] = []
    Object.assign(window, { __heard: log })
    const play = HTMLMediaElement.prototype.play
    HTMLMediaElement.prototype.play = function () {
      log.push('music-play')
      return play.call(this)
    }
    const pause = HTMLMediaElement.prototype.pause
    HTMLMediaElement.prototype.pause = function () {
      log.push('music-pause')
      return pause.call(this)
    }
    const start = AudioBufferSourceNode.prototype.start
    AudioBufferSourceNode.prototype.start = function (
      ...args: Parameters<AudioBufferSourceNode['start']>
    ) {
      log.push('click')
      return start.apply(this, args)
    }
  })
}

const heard = (page: Page) =>
  page.evaluate(() => (window as unknown as { __heard: string[] }).__heard)
const count = async (page: Page, what: Heard) =>
  (await heard(page)).filter((entry) => entry === what).length

/** How long after a tap the sound is ready for a click: the context runs, the file decodes. */
const WARM_UP_MS = 700

const soundSwitch = (page: Page) => page.getByRole('button', { name: 'Sound' })
const mutedKey = (page: Page) => page.evaluate(() => localStorage.getItem('bloom.sound.muted'))

/** Opens a step directly (the ?qa bypass of the dev tools) and waits for it to settle. */
async function open(page: Page, id: string) {
  await page.goto(`/s/${id}?qa`)
  await waitForStep(page, id)
}

test.describe('the files', () => {
  test('are served as audio/mpeg and cached by the browser for a day', async ({ request }) => {
    for (const file of ['background', 'click']) {
      const response = await request.get(`/audio/${file}.mp3`)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toBe('audio/mpeg')
      expect(response.headers()['cache-control']).toContain('max-age=86400')
      expect((await response.body()).length).toBeGreaterThan(10_000)
    }
  })
})

test.describe('the music', () => {
  test('is not heard or downloaded before the first tap, then plays', async ({ page }) => {
    const requested: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/audio/')) requested.push(new URL(request.url()).pathname)
    })
    const warnings: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') warnings.push(message.text())
    })
    await recordSound(page)
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'true')

    await page.waitForTimeout(WARM_UP_MS)
    expect(await heard(page)).toEqual([])
    expect(requested).not.toContain('/audio/background.mp3')

    await answerStep(page)
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    expect(requested).toContain('/audio/background.mp3')
    // Started inside the tap, so the browser has nothing to complain about.
    expect(warnings.filter((text) => /AudioContext|autoplay|play\(\)/i.test(text))).toEqual([])
  })

  test('keeps playing from one step to the next (nothing starts it twice)', async ({ page }) => {
    await recordSound(page)
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await answerStep(page)
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    const started = await count(page, 'music-play')
    await answerStep(page)
    await answerStep(page)
    // Every tap asks once more; the music is already running, so no new fade-in is started.
    expect(await count(page, 'music-pause')).toBe(0)
    expect(await count(page, 'music-play')).toBeLessThanOrEqual(started + 1)
  })
})

test.describe('the click', () => {
  test('sounds when an option is chosen', async ({ page }) => {
    await recordSound(page)
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await answerStep(page)
    await waitForStep(page, 'drained')
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    await page.waitForTimeout(WARM_UP_MS)

    await page.getByRole('radio').first().click()
    await expect.poll(() => count(page, 'click')).toBe(1)
  })

  test('sounds even when the answer is the very first tap of the visit', async ({ page }) => {
    await recordSound(page)
    await open(page, 'drained')
    await page.getByRole('radio').first().click()
    await expect.poll(() => count(page, 'click')).toBe(1)
  })

  test('is silent on the checkboxes of a multiple choice and sounds on its Continue', async ({
    page,
  }) => {
    await recordSound(page)
    await open(page, 'sacrifice')
    const boxes = page.getByRole('checkbox')
    await boxes.nth(0).click()
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    await page.waitForTimeout(WARM_UP_MS)
    await boxes.nth(1).click()
    await boxes.nth(0).click()
    expect(await count(page, 'click')).toBe(0)

    await boxes.nth(2).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect.poll(() => count(page, 'click')).toBe(1)
  })

  test('is silent on the wand bubbles and sounds on its Continue', async ({ page }) => {
    await recordSound(page)
    await open(page, 'wand')
    const bubbles = page.getByRole('button', { name: /^Release / })
    // The bubbles drift on every frame, so they never pass Playwright's "stable" check.
    await bubbles.first().click({ force: true })
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    await page.waitForTimeout(WARM_UP_MS)
    await bubbles.first().click({ force: true })
    await bubbles.first().click({ force: true })
    expect(await count(page, 'click')).toBe(0)

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect.poll(() => count(page, 'click')).toBe(1)
  })
})

test.describe('the switch', () => {
  test('turns the music and the click off, and the choice outlives a reload', async ({ page }) => {
    const requested: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/audio/')) requested.push(new URL(request.url()).pathname)
    })
    await recordSound(page)
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await answerStep(page)
    await waitForStep(page, 'drained')
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    await page.waitForTimeout(WARM_UP_MS)

    await soundSwitch(page).click()
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => count(page, 'music-pause')).toBeGreaterThan(0)
    expect(await mutedKey(page)).toBe('1')

    await page.getByRole('radio').first().click()
    await page.waitForTimeout(WARM_UP_MS)
    expect(await count(page, 'click')).toBe(0)

    // A muted visitor downloads nothing at all on the next visit.
    requested.length = 0
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'false')
    await answerStep(page)
    await page.waitForTimeout(WARM_UP_MS)
    expect(await heard(page)).toEqual([])
    expect(requested).toEqual([])

    await soundSwitch(page).click()
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => count(page, 'music-play')).toBeGreaterThan(0)
    expect(await mutedKey(page)).toBe('0')
  })

  test('is reachable with the keyboard', async ({ page }) => {
    await page.goto('/s/intro')
    await waitForStep(page, 'intro')
    await soundSwitch(page).focus()
    await page.keyboard.press('Enter')
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('Space')
    await expect(soundSwitch(page)).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  const SESSION = {
    answers: { gender: 'male', wand: ['self_doubt', 'burnout', 'anxiety'], adhd: 'no' },
    lead: { email: 'qa@example.com', name: 'Sam' },
    selectedPlanId: 'month_1',
    paywallStartedAt: null,
    furthest: 42,
    trialAmount: 2,
    discount: null,
    reminderOptIn: true,
    attribution: {},
  }

  // The steps with something of their own near a corner: the logo and progress bar, a title that
  // reaches the edge, the user chip, the paywall's close button, the bottom button.
  const STEPS = ['intro', 'drained', 'sacrifice', 'wand', 'email', 'summary', 'pwyw', 'paywall']

  for (const id of STEPS) {
    test(`the switch covers no text or control of ${id}`, async ({ page }) => {
      await page.addInitScript((state) => {
        sessionStorage.setItem('bloom.funnel.v1', JSON.stringify(state))
      }, SESSION)
      await open(page, id)
      await page.waitForTimeout(1200)
      await expect(soundSwitch(page)).toBeVisible()

      // The button is a 44px touch target and must not sit on another control; the disc drawn in
      // it (smaller on phones) must not sit on any text either.
      const covered = await page.evaluate(() => {
        const toggle = document.querySelector('button[aria-label="Sound"]')!
        const box = toggle.getBoundingClientRect()
        const before = getComputedStyle(toggle, '::before')
        const left = box.left + parseFloat(before.left)
        const top = box.top + parseFloat(before.top)
        const disc = {
          left,
          top,
          right: left + parseFloat(before.width),
          bottom: top + parseFloat(before.height),
        }
        const meets = (area: typeof disc, rect: DOMRect) =>
          rect.width > 0 &&
          rect.height > 0 &&
          Math.min(rect.right, area.right) - Math.max(rect.left, area.left) > 0.5 &&
          Math.min(rect.bottom, area.bottom) - Math.max(rect.top, area.top) > 0.5
        const textRects = (el: Element): DOMRect[] => {
          const rects: DOMRect[] = []
          for (const node of Array.from(el.childNodes)) {
            if (node.nodeType !== Node.TEXT_NODE || !(node.textContent ?? '').trim()) continue
            const range = document.createRange()
            range.selectNodeContents(node)
            rects.push(...Array.from(range.getClientRects()))
          }
          return rects
        }
        const hits: string[] = []
        for (const el of document.querySelectorAll('body *')) {
          if (el === toggle || toggle.contains(el)) continue
          const style = getComputedStyle(el)
          if (style.visibility === 'hidden' || style.display === 'none') continue
          if (Number(style.opacity) === 0) continue
          const name = `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}"`
          if (el.matches('button,a,input,[role="radio"],[role="checkbox"]')) {
            if (meets(box, el.getBoundingClientRect())) hits.push(`${name} (touch area)`)
          } else if (textRects(el).some((rect) => meets(disc, rect))) {
            hits.push(`${name} (disc)`)
          }
        }
        return hits
      })
      expect(covered).toEqual([])
    })
  }
})

test.describe('the keyboard', () => {
  test('reaches the step before the switch, which is the last stop', async ({ page }) => {
    await open(page, 'drained')
    await page.keyboard.press('Tab')
    await expect(page.getByRole('radio', { name: 'Always' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(soundSwitch(page)).toBeFocused()
  })
})
