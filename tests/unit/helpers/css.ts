/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Vitest replaces CSS imports with empty strings, so CSS-source tests read the files directly. */
export function readSrc(path: string): string {
  return readFileSync(join(import.meta.dirname, '../../../src', path), 'utf8')
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Custom properties of the first `:root` block, with every `var(--x)` reference resolved. */
export function rootTokens(css: string): Record<string, string> {
  const block = /:root\s*\{([^}]*)\}/.exec(stripComments(css))
  if (!block) throw new Error('no :root block')
  const raw: Record<string, string> = {}
  for (const match of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    raw[match[1]] = match[2].trim().replace(/\s+/g, ' ')
  }
  const resolve = (value: string, depth = 0): string => {
    if (depth > 10) throw new Error(`token cycle near ${value}`)
    return value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => {
      if (!(name in raw)) throw new Error(`unknown token ${name}`)
      return resolve(raw[name], depth + 1)
    })
  }
  return Object.fromEntries(Object.entries(raw).map(([name, value]) => [name, resolve(value)]))
}

/** Custom properties declared in the first `:root` block inside `@media (prefers-reduced-motion)`. */
export function reducedMotionTokens(css: string): Record<string, string> {
  const block = /@media \(prefers-reduced-motion: reduce\)\s*\{\s*:root\s*\{([^}]*)\}/.exec(
    stripComments(css),
  )
  if (!block) throw new Error('no reduced-motion block')
  const out: Record<string, string> = {}
  for (const match of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g))
    out[match[1]] = match[2].trim()
  return out
}
