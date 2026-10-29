import { describe, expect, it } from 'vitest'
import { STEP_GAP_MS, STEP_IN_MS, STEP_OUT_MS, REDUCED_FADE_MS } from '@/ui'
import { contrast } from './helpers/color'
import { readSrc, reducedMotionTokens, rootTokens } from './helpers/css'

const css = readSrc('styles/tokens.css')
const tokens = rootTokens(css)

describe('design tokens (PLAN 4.1 to 4.4)', () => {
  it('defines every colour of the 4.1 table', () => {
    const colours = {
      '--bg-page-lilac': '#eceaff',
      '--bg-card': '#f5f4fd',
      '--bg-page-soft': '#f5f4fd',
      '--bg-page-dark': '#0d0e11',
      '--bg-wand-col': '#edebf9',
      '--bg-page-warm': '#f3f1ef',
      '--surface-option': '#ffffff',
      '--surface-option-active': '#e4e1fd',
      '--surface-option-active-multi': '#e3e0fe',
      '--progress-track': '#ffffff',
      '--progress-fill': '#bab3fd',
      '--brand-indigo': '#3424b8',
      '--brand-violet': '#6454fe',
      '--accent-violet-soft': '#6c5fff',
      '--accent-violet-emphasis': '#6657e3',
      '--ink-900': '#13171b',
      '--ink-700': '#353334',
      '--ink-600': '#5c5f73',
      '--you-border': '#6f58db',
      '--you-fill-from': '#f9d9aa',
      '--you-fill-to': '#f4ceb8',
      '--success-green': '#11b786',
      '--meter-1': '#7bd5f1',
      '--meter-2': '#9df6a7',
      '--meter-3': '#e6e881',
      '--meter-4': '#f0b76d',
      '--meter-5': '#ef845d',
      '--meter-6': '#f06253',
      '--meter-track': '#f3f1ef',
      '--alert-bg': '#fbdfe6',
      '--alert-icon-bg': '#feb2b6',
      '--alert-icon-fg': '#fc4247',
      '--step-1': '#35ba9c',
      '--step-2': '#f6a76c',
      '--step-3': '#e99282',
      '--overlay-loader': 'rgba(0, 0, 0, 0.5)',
      '--paywall-accent': '#7a60ff',
      '--paywall-selected-bg': '#e7e2fd',
      '--price-struck': '#818f9e',
      '--price-struck-red': '#bd2128',
      '--checkout-overlay': 'rgba(0, 0, 0, 0.6)',
      '--paypal-gold': '#fcc237',
      '--safe-pill-bg': '#bef7f1',
      '--wand-bubble-anxiety': '#6c5fe0',
      '--wand-bubble-self-doubt': '#4f78c4',
      '--wand-bubble-burnout': '#9a5bbe',
      '--wand-bubble-loneliness': '#d2648e',
      '--wand-bubble-motivation': '#e08a4a',
    }
    for (const [name, value] of Object.entries(colours)) expect(tokens[name], name).toBe(value)
    expect(tokens['--paywall-grad']).toContain('#636efe')
    expect(tokens['--paywall-grad']).toContain('#9c7bfe')
    expect(tokens['--paywall-grad']).toContain('#d085fd')
    expect(tokens['--alert-pill-bg']).toBe('#fedde0')
  })

  it('defines the radii and measures of 4.3', () => {
    const measures = {
      '--card-width': '375px',
      '--card-margin-top': '32px',
      '--card-margin-bottom': '30px',
      '--radius-card': '32px',
      '--option-width': '333px',
      '--option-height': '72px',
      '--option-gap': '9px',
      '--radius-option': '12px',
      '--multi-row-width': '325px',
      '--multi-row-height': '56px',
      '--multi-row-gap': '9px',
      '--checkbox-size': '24px',
      '--checkbox-inset': '17px',
      '--checkbox-label-inset': '59px',
      '--radius-checkbox': '6px',
      '--cta-width': '325px',
      '--cta-height': '52px',
      '--radius-cta': '10px',
      '--card-gutter-option': '21px',
      '--card-gutter-cta': '25px',
      '--cta-margin-bottom': '26px',
      '--header-logo-top': '42px',
      '--header-logo-height': '26px',
      '--header-progress-top': '75px',
      '--header-progress-height': '3px',
      '--header-progress-width': '333px',
      '--radius-progress': '2px',
      '--title-top': '124px',
      '--wand-col-width': '365px',
      '--summary-width': '520px',
      '--loader-bar-width': '270px',
      '--loader-bar-height': '44px',
      '--loader-bar-gap': '12px',
      '--radius-loader-bar': '22px',
      '--sheet-width': '375px',
      '--sheet-height': '648px',
      '--paywall-width': '457px',
      '--checkout-max-width': '430px',
      '--checkout-max-height': '630px',
      '--checkout-button-width': '390px',
      '--checkout-button-height': '54px',
    }
    for (const [name, value] of Object.entries(measures)) expect(tokens[name], name).toBe(value)
  })

  it('keeps the option label at the bottom left by default (decision D5)', () => {
    expect(tokens['--option-label-align']).toBe('flex-end')
  })

  it('defines the typography of 4.2', () => {
    const type = {
      '--fs-headline-lg': '26px',
      '--lh-headline-lg': '31px',
      '--fs-headline-md': '24px',
      '--lh-headline-md': '30px',
      '--fs-headline-sm': '22px',
      '--lh-headline-sm': '28px',
      '--fw-headline': '500',
      '--fs-question': '20px',
      '--lh-question': '24px',
      '--fw-question': '700',
      '--fs-subtitle': '14px',
      '--lh-subtitle': '17px',
      '--fs-option': '15px',
      '--lh-option': '20px',
      '--fs-cta': '17px',
      '--lh-cta': '24px',
      '--fw-cta': '600',
      '--fs-inter-title': '21px',
      '--lh-inter-title': '26px',
      '--fs-inter-body': '15px',
      '--lh-inter-body': '23px',
      '--fs-paywall-title': '26px',
      '--lh-paywall-title': '32px',
      '--fs-plan-title': '18px',
      '--lh-plan-title': '22px',
      '--fs-price-big': '44px',
      '--fs-price-small': '16px',
      '--fs-legal': '12px',
      '--lh-legal': '16px',
    }
    for (const [name, value] of Object.entries(type)) expect(tokens[name], name).toBe(value)
    // The families are the self-hosted files that next/font registers (src/app/fonts.ts), exposed
    // as --font-inter and --font-source-serif; the rest of each stack is the fallback.
    expect(tokens['--font-sans']).toMatch(
      /^var\(--font-inter, [^)]+\), 'Inter Fallback', system-ui/,
    )
    expect(tokens['--font-serif']).toMatch(/^var\(--font-source-serif, [^)]+\), Georgia/)
  })

  it('names no token after the reference product', () => {
    expect(css.toLowerCase()).not.toContain('fabulous')
  })
})

describe('motion tokens (PLAN 4.4)', () => {
  it('mirrors the exported step durations', () => {
    expect(tokens['--motion-step-out']).toBe(`${STEP_OUT_MS}ms`)
    expect(tokens['--motion-step-gap']).toBe(`${STEP_GAP_MS}ms`)
    expect(tokens['--motion-step-in']).toBe(`${STEP_IN_MS}ms`)
    expect(tokens['--motion-reduced-fade']).toBe(`${REDUCED_FADE_MS}ms`)
    expect([STEP_OUT_MS, STEP_GAP_MS, STEP_IN_MS]).toEqual([400, 150, 300])
  })

  it('has the option and arrow timings and three easings', () => {
    expect(tokens['--motion-option']).toBe('120ms')
    expect(tokens['--motion-arrow']).toBe('150ms')
    for (const name of ['--ease-standard', '--ease-out', '--ease-in']) {
      expect(tokens[name], name).toMatch(/^cubic-bezier\(/)
    }
  })

  it('reduces every duration to a fade of at most 100 ms under prefers-reduced-motion', () => {
    const reduced = reducedMotionTokens(css)
    for (const name of [
      '--motion-step-out',
      '--motion-step-gap',
      '--motion-step-in',
      '--motion-option',
      '--motion-arrow',
      '--motion-progress',
      '--motion-overlay',
    ]) {
      expect(reduced[name], name).toBeDefined()
      expect(parseFloat(reduced[name]), name).toBeLessThanOrEqual(100)
    }
  })
})

describe('text contrast (WCAG AA, 4.5:1)', () => {
  const AA = 4.5
  const pairs: Array<[string, string]> = [
    ['--ink-900', '--bg-card'],
    ['--ink-900', '--bg-page-lilac'],
    ['--ink-900', '--bg-page-warm'],
    ['--ink-900', '--bg-page-white'],
    ['--ink-700', '--surface-option'],
    ['--ink-700', '--surface-option-active'],
    ['--ink-700', '--surface-option-active-multi'],
    ['--ink-700', '--btn-white-bg'],
    ['--ink-600', '--bg-card'],
    ['--ink-600', '--bg-page-lilac'],
    ['--ink-600', '--bg-page-soft'],
    ['--ink-400', '--bg-wand-col'],
    ['--ink-400', '--bg-page-lilac'],
    ['--brand-indigo', '--bg-card'],
    ['--brand-indigo', '--bg-page-lilac'],
    ['--brand-indigo', '--bg-page-white'],
    ['--btn-primary-fg', '--btn-primary-bg'],
    ['--on-brand', '--btn-loading-bg'],
    ['--accent-violet-emphasis', '--bg-card'],
    ['--price-struck-red', '--bg-page-white'],
  ]

  it.each(pairs)('%s on %s', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(AA)
  })

  it('keeps large-text accents above 3:1 (they are never used for body text)', () => {
    expect(contrast(tokens['--accent-violet-soft'], tokens['--bg-card'])).toBeGreaterThanOrEqual(3)
  })

  it('needs the darkened ink-400: the sampled colour failed AA on the wand column', () => {
    expect(contrast(tokens['--ink-400-sampled'], tokens['--bg-wand-col'])).toBeLessThan(AA)
    expect(contrast(tokens['--ink-400'], tokens['--bg-wand-col'])).toBeGreaterThanOrEqual(AA)
  })

  it('draws the focus ring with at least 3:1 against the surfaces it sits on', () => {
    for (const bg of ['--bg-card', '--bg-page-lilac', '--surface-option', '--bg-page-white']) {
      expect(contrast(tokens['--focus-ring-color'], tokens[bg]), bg).toBeGreaterThanOrEqual(3)
    }
  })
})
