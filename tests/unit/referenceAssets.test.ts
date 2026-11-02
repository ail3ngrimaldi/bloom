import { describe, expect, it } from 'vitest'
import { filesUnder, readText, sha256 } from './helpers/repo'

/**
 * Guardrail 6 of PLAN-B 2: the reference images live only in docs/ and never reach the bundle of
 * the product. This guard fails the first time one is copied, imported or referenced from code.
 * The build output is checked by `npm run check:build` (scripts/check-build.mjs) after `next build`.
 */
const IMAGES_DIR = 'docs/feature-parity/images'
const PRODUCT_DIRS = ['src', 'public', 'tests', 'scripts']
const TEXT = /\.(?:tsx?|jsx?|mjs|cjs|css|json|md|svg|html)$/i

const referenceHashes = new Map(filesUnder(IMAGES_DIR).map((path) => [sha256(path), path] as const))

describe('reference assets stay in docs/ (guardrail 6)', () => {
  it('has the reference images to compare against', () => {
    expect(referenceHashes.size).toBeGreaterThan(20)
  })

  it('has no copy of a reference image in src/, public/, tests/ or scripts/', () => {
    const copies: string[] = []
    for (const dir of PRODUCT_DIRS) {
      for (const path of filesUnder(dir)) {
        const original = referenceHashes.get(sha256(path))
        if (original) copies.push(`${path} is a copy of ${original}`)
      }
    }
    expect(copies).toEqual([])
  })

  it('has no image of the reference by name or by path in the product source', () => {
    const offenders: string[] = []
    for (const dir of ['src', 'public']) {
      for (const path of filesUnder(dir)) {
        if (!TEXT.test(path)) continue
        if (/feature-parity\/images/.test(readText(path)))
          offenders.push(`${path}: references feature-parity/images`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('has no public/ folder holding a copy of docs/ or a recording', () => {
    expect(
      filesUnder('public').filter((path) => /feature-parity|\.mkv$|\.mp4$/i.test(path)),
    ).toEqual([])
  })
})
