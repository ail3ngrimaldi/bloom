import { describe, expect, it } from 'vitest'
import { contrast } from './helpers/color'
import { readSrc, rootTokens } from './helpers/css'

const css = readSrc('styles/tokens.b.css')
const tokens = rootTokens(css)

describe('tokens of the pay-what-you-want closing (PLAN-B 5.1)', () => {
  it('defines the sampled colours of the closing', () => {
    const colours = {
      '--pwyw-bg': '#ffffff',
      '--pwyw-ink': '#111719',
      '--pwyw-p1': '#525e69',
      '--pwyw-tile-1': '#dff0fe',
      '--pwyw-tile-1-ink': '#193e66',
      '--pwyw-tile-2': '#cee7ff',
      '--pwyw-tile-2-ink': '#123f6e',
      '--pwyw-tile-3': '#feeadf',
      '--pwyw-accent': '#ff6803',
      '--sheet-page-bg': '#e9eaef',
      '--sheet-header-bg': '#f5f4fd',
      '--sheet-header-ink': '#362c5b',
      '--timer-bg': '#ffffff',
      '--timer-ink': '#332e5d',
      '--sheet-progress-fill': '#685ec9',
      '--sheet-progress-track': '#e3e0fc',
      '--close-ink': '#6762a6',
      '--now-sampled': '#f12f5f',
      '--goal': '#00ca9f',
      '--now-tile': '#fdf3f6',
      '--goal-tile': '#effdfa',
      '--flame': '#f5a900',
      '--brand-teal': '#00ca9f',
      '--ticket-timer-bg': '#f0e7f7',
      '--ticket-timer-ink': '#423363',
      '--plan-title-ink': '#0e181f',
      '--muted-ink': '#616065',
      '--tl-check': '#b1002b',
      '--tl-send': '#ffa032',
      '--tl-bell': '#167bfb',
      '--tl-dotted': '#86d1bb',
      '--pay-container': '#f6f7fa',
      '--gpay-bg': '#f0f1f4',
      '--reminder-bg': '#f4f2fe',
      '--reminder-ink': '#4e4a89',
      '--checkbox': '#363dc7',
      '--start-disabled': '#7be0cc',
      '--faq-bg': '#f5f4fd',
      '--review-bg': '#f4f5f8',
      '--star': '#ffa034',
      '--expert-accent': '#ffa032',
      '--expert-body': '#fdf4eb',
      '--letter-bg': '#f2f0fe',
      '--letter-ink': '#292141',
      '--gift-modal': '#2a1d5b',
      '--gift-pill': '#f0bf90',
      '--gift-lid': '#5043b2',
      '--gift-body': '#d3cefd',
      '--gift-ribbon': '#e9ac5b',
      '--coupon-accent': '#ed8c13',
      '--coupon-ink': '#16171a',
    }
    for (const [name, value] of Object.entries(colours)) expect(tokens[name], name).toBe(value)
  })

  it('defines the gradients of the coupon, the banner and the apply button', () => {
    expect(tokens['--ticket-grad']).toContain('#fef2da')
    expect(tokens['--ticket-grad']).toContain('#e0dbf6')
    expect(tokens['--green-grad']).toContain('#51d912')
    expect(tokens['--green-grad']).toContain('#22bd6a')
    expect(tokens['--green-grad']).toContain('#05aba1')
    expect(tokens['--apply-grad']).toContain('#00b5a9')
    expect(tokens['--apply-grad']).toContain('#00c49c')
  })

  it('defines the measures of the sheet (video px x 1.36)', () => {
    expect(tokens['--plan-sheet-width']).toBe('420px')
    expect(tokens['--plan-sheet-radius']).toBe('32px')
    expect(tokens['--plan-sheet-top']).toBe('42px')
    expect(tokens['--plan-bar-height']).toBe('71px')
    expect(tokens['--gift-modal-width']).toBe('392px')
    expect(tokens['--pwyw-tile-width']).toBe('143px')
    expect(tokens['--pwyw-tile-height']).toBe('141px')
    expect(tokens['--pwyw-cta-width']).toBe('242px')
    expect(tokens['--pwyw-cta-height']).toBe('54px')
  })

  it('names no token after the reference product', () => {
    expect(css.toLowerCase()).not.toContain('fabulous')
  })
})

describe('text contrast of the closing (WCAG AA, 4.5:1)', () => {
  const AA = 4.5
  // [text, surface]. Where the sampled colour failed, the token holds the darkened one.
  const pairs: Array<[string, string]> = [
    ['--pwyw-ink', '--pwyw-bg'],
    ['--pwyw-p1', '--pwyw-bg'],
    ['--pwyw-p2', '--pwyw-bg'],
    ['--pwyw-tile-1-ink', '--pwyw-tile-1'],
    ['--pwyw-tile-2-ink', '--pwyw-tile-2'],
    ['--pwyw-tile-3-ink', '--pwyw-tile-3'],
    ['--on-accent', '--pwyw-accent-strong'],
    ['--sheet-header-ink', '--sheet-header-bg'],
    ['--timer-ink', '--timer-bg'],
    ['--ticket-timer-ink', '--ticket-timer-bg'],
    ['--close-ink', '--timer-bg'],
    ['--compare-label', '--now-tile'],
    ['--compare-label', '--goal-tile'],
    ['--compare-value', '--now-tile'],
    ['--compare-value', '--goal-tile'],
    ['--now-text', '--sheet-bg'],
    ['--goal-text', '--sheet-bg'],
    ['--goal-text', '--goal-tile'],
    ['--sticky-ink', '--sheet-bg'],
    ['--sticky-sub', '--sheet-bg'],
    ['--on-teal', '--brand-teal'],
    ['--on-goal', '--goal'],
    ['--plan-title-ink', '--sheet-bg'],
    ['--muted-ink', '--sheet-bg'],
    ['--muted-ink', '--pay-container'],
    ['--struck-ink', '--sheet-bg'],
    ['--reminder-ink', '--reminder-bg'],
    ['--safe-pill-ink', '--safe-pill-bg-b'],
    ['--field-error', '--sheet-bg'],
    ['--review-ink', '--review-bg'],
    ['--muted-ink', '--faq-bg'],
    ['--plan-title-ink', '--faq-bg'],
    ['--plan-title-ink', '--review-bg'],
    ['--on-expert-accent', '--expert-accent'],
    ['--expert-accent-text', '--expert-body'],
    ['--plan-title-ink', '--expert-body'],
    ['--muted-ink', '--expert-body'],
    ['--letter-ink', '--letter-bg'],
    ['--letter-body', '--letter-bg'],
    ['--on-green', '--sheet-bg'],
    ['--coupon-accent-text', '--sheet-bg'],
    ['--coupon-ink', '--sheet-bg'],
    ['--gift-pill', '--gift-modal'],
    ['--gift-body', '--gift-modal'],
    ['--on-apply', '--sheet-bg'],
  ]

  const literal = (name: string): string => {
    if (name === '--on-accent' || name === '--sheet-bg') return '#ffffff'
    return tokens[name]
  }

  it.each(pairs)('%s on %s', (fg, bg) => {
    expect(contrast(literal(fg), literal(bg))).toBeGreaterThanOrEqual(AA)
  })

  it('keeps white on the lime end of the banner out: its text is dark', () => {
    expect(contrast('#ffffff', '#51d912')).toBeLessThan(AA)
    expect(contrast(tokens['--on-green'], '#51d912')).toBeGreaterThanOrEqual(AA)
    expect(contrast(tokens['--on-green'], '#05aba1')).toBeGreaterThanOrEqual(AA)
  })

  it('needs the darkened tokens: the sampled colours failed AA', () => {
    expect(contrast(tokens['--pwyw-p2-sampled'], tokens['--pwyw-bg'])).toBeLessThan(AA)
    expect(contrast(tokens['--sticky-sub-sampled'], '#ffffff')).toBeLessThan(AA)
    expect(contrast('#ffffff', tokens['--pwyw-accent'])).toBeLessThan(AA)
    expect(contrast('#ffffff', tokens['--now-sampled'])).toBeLessThan(AA)
    expect(contrast('#ffffff', tokens['--now'])).toBeGreaterThanOrEqual(AA)
  })
})
