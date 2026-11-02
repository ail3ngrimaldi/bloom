// `npm run check:build` after `npm run build`: guardrail 6 of PLAN-B 2 for the build output.
// The reference images and the recordings live only in docs/ and the repository root; none of them
// may be in what gets deployed. Fails when the build output holds a file named or hashed like a
// reference image or a recording, or text that points at the reference images, and when what
// reaches the browser (client chunks, prerendered pages) mentions docs/feature-parity at all.
// Source maps are not served and only repeat the comments of the source, so they are not read.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = process.env.NEXT_DIST_DIR || '.next'
const imagesDir = join('docs', 'feature-parity', 'images')

if (!existsSync(dist)) {
  console.error(`check:build: "${dist}" does not exist. Run "npm run build" first.`)
  process.exit(2)
}

const hashes = new Map(
  readdirSync(imagesDir).map((name) => [
    createHash('sha256')
      .update(readFileSync(join(imagesDir, name)))
      .digest('hex'),
    name,
  ]),
)

// What is not deployed (build cache, generated types, dev output) is not part of the product.
const SKIPPED = new Set(['cache', 'types', 'dev', 'diagnostics'])
const MAX_TEXT_BYTES = 8 * 1024 * 1024
// What a visitor's browser receives: the client chunks and the prerendered pages.
const browserFacing = (path) =>
  path.startsWith(join(dist, 'static')) || path.startsWith(join(dist, 'server', 'app'))
const offenders = []
let scanned = 0

function walk(dir, depth = 0) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (depth === 0 && SKIPPED.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(path, depth + 1)
      continue
    }
    scanned += 1
    if (/feature-parity|\.mkv$|\.mp4$/i.test(path)) offenders.push(`${path}: name`)
    const buffer = readFileSync(path)
    const original = hashes.get(createHash('sha256').update(buffer).digest('hex'))
    if (original) offenders.push(`${path}: copy of ${original}`)
    if (path.endsWith('.map') || statSync(path).size > MAX_TEXT_BYTES) continue
    if (buffer.includes('feature-parity/images')) offenders.push(`${path}: points at the images`)
    else if (browserFacing(path) && buffer.includes('feature-parity'))
      offenders.push(`${path}: mentions feature-parity`)
  }
}

walk(dist)

if (offenders.length > 0) {
  console.error('check:build: the build output carries material that must stay in docs/:')
  for (const line of offenders) console.error(`  ${line}`)
  process.exit(1)
}
console.log(`check:build: ${scanned} files in ${dist}, no reference material.`)
