import { useId } from 'react'
import { BACKDROP, HAIR, SHIRT, SKIN } from './palette'

export interface AvatarProps {
  cx: number
  cy: number
  r: number
  /** Picks the colours; any integer works. */
  seed: number
}

/**
 * Abstract person (head and shoulders) in a circle, for use inside an <svg>. Placeholder art:
 * no faces, no likeness of anyone.
 */
export function Avatar({ cx, cy, r, seed }: AvatarProps) {
  const clip = useId()
  const pick = <T,>(list: readonly T[], offset = 0) => list[(seed + offset) % list.length]
  return (
    <g>
      <clipPath id={clip}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <circle cx={cx} cy={cy} r={r} fill={pick(BACKDROP, 2)} />
        <ellipse cx={cx} cy={cy + r * 0.95} rx={r * 0.78} ry={r * 0.55} fill={pick(SHIRT, 1)} />
        <circle cx={cx} cy={cy - r * 0.08} r={r * 0.38} fill={pick(SKIN)} />
        <path
          d={`M ${cx - r * 0.4} ${cy - r * 0.08}
              a ${r * 0.4} ${r * 0.42} 0 0 1 ${r * 0.8} 0
              q ${-r * 0.4} ${-r * 0.14} ${-r * 0.8} 0 z`}
          fill={pick(HAIR, 3)}
        />
      </g>
    </g>
  )
}
