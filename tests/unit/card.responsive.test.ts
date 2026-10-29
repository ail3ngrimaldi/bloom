import { describe, expect, it } from 'vitest'
import { readSrc } from './helpers/css'

/**
 * jsdom does not evaluate media queries, so the responsive contract of the Card (and of the
 * sheet modal that mirrors it) is checked against the stylesheet source. The rendered result is
 * covered by tests/e2e/gallery.spec.ts in a real browser.
 */
describe('Card stylesheet', () => {
  const css = readSrc('ui/Card/Card.module.css')

  it('is 375 wide, viewport minus 62 tall, radius 32 with 32/30 margins', () => {
    const base = css.slice(0, css.indexOf('@media'))
    expect(base).toContain('width: var(--card-width)')
    expect(base).toContain('height: var(--card-height)')
    expect(base).toContain('margin: var(--card-margin-top) 0 var(--card-margin-bottom)')
    expect(base).toContain('border-radius: var(--radius-card)')
    expect(base).not.toContain('box-shadow')
    expect(base).toContain('background: var(--bg-card)')
  })

  it('goes full-bleed under 480px: full width, no radius, no margin', () => {
    const media = /@media \(max-width: 479\.98px\)\s*\{\s*\.card\s*\{([^}]*)\}/.exec(css)
    expect(media, 'media query for widths under 480px').not.toBeNull()
    const rules = media![1]
    expect(rules).toMatch(/width:\s*100%/)
    expect(rules).toMatch(/margin:\s*0/)
    expect(rules).toMatch(/border-radius:\s*0/)
  })
})
