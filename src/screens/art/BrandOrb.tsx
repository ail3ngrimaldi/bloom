import { useId } from 'react'
import { cx } from '@/ui/cx'
import styles from './art.module.css'

// Five petals around the centre, 72 degrees apart (same flower as the Logo).
const PETALS = [0, 72, 144, 216, 288]

/**
 * Bloom's orb: the brand's circle next to "You" (intro, match). TODO(content): placeholder art,
 * replace with Bloom's own illustration.
 */
export function BrandOrb({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg
      className={cx(styles.orb, className)}
      viewBox="0 0 90 90"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-sky`} cx="30%" cy="25%" r="85%">
          <stop offset="0" stopColor="#b9a8ff" />
          <stop offset="0.55" stopColor="#6c5fff" />
          <stop offset="1" stopColor="#3424b8" />
        </radialGradient>
      </defs>
      <circle cx="45" cy="45" r="45" fill={`url(#${id}-sky)`} />
      <g transform="translate(45 47)">
        {PETALS.map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-11"
            rx="7.5"
            ry="12"
            fill="#ffffff"
            fillOpacity="0.9"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="5.5" fill="#f9d9aa" />
      </g>
      <circle cx="22" cy="24" r="1.6" fill="#ffffff" fillOpacity="0.85" />
      <circle cx="68" cy="20" r="1.2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="72" cy="66" r="1.4" fill="#ffffff" fillOpacity="0.6" />
    </svg>
  )
}
