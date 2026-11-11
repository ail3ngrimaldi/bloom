import type { CSSProperties } from 'react'
import styles from './Confetti.module.css'

const PIECES = 30
const COLORS = ['--confetti-1', '--confetti-2', '--confetti-3', '--confetti-4'] as const

/**
 * Squares of lavender, violet, magenta and orange that fall from above the dialog for about two
 * seconds (b-anim-01). Positions are fixed arithmetic, not random, so the render is the same every
 * time. Hidden under `prefers-reduced-motion`.
 */
export function Confetti({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: PIECES }, (_, index) => (
        <span
          key={index}
          className={styles.piece}
          style={
            {
              '--x': `${(index * 37 + 11) % 100}%`,
              '--delay': `${(index % 7) * 0.09}s`,
              '--spin': `${((index * 53) % 540) - 180}deg`,
              '--size': `${8 + (index % 3) * 3}px`,
              '--drift': `${((index % 5) - 2) * 14}px`,
              '--color': `var(${COLORS[index % COLORS.length]})`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
