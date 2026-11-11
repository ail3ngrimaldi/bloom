/// <reference types="node" />
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

/** The repository root (jsdom's URL is not Node's, so the path is built by hand). */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..')

const SKIPPED = new Set(['node_modules', '.git', '.next', 'coverage', 'test-results'])

/** Every file under `dir` (relative to the repository root), skipping build output and vendors. */
export function filesUnder(dir: string): string[] {
  const start = join(ROOT, dir)
  if (!existsSync(start)) return []
  const found: string[] = []
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (SKIPPED.has(entry.name) || entry.name.startsWith('.next-')) continue
      const path = join(current, entry.name)
      if (entry.isDirectory()) walk(path)
      else found.push(relative(ROOT, path).replaceAll('\\', '/'))
    }
  }
  walk(start)
  return found
}

export function sha256(path: string): string {
  return createHash('sha256')
    .update(readFileSync(join(ROOT, path)))
    .digest('hex')
}

export function readText(path: string): string {
  return readFileSync(join(ROOT, path), 'utf8')
}
