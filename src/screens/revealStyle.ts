import type { CSSProperties } from 'react'

/** Inline timing for a `.reveal` element (see motion.module.css). */
export function revealStyle(delayMs: number, durationMs = 400): CSSProperties {
  return {
    '--reveal-delay': `${delayMs}ms`,
    '--reveal-duration': `${durationMs}ms`,
  } as CSSProperties
}
