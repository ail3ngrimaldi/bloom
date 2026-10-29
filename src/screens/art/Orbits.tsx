import { Avatar } from './Avatar'
import styles from './art.module.css'

const CX = 135
const CY = 133
const INNER = 70
const OUTER = 104

// Satellites: [angle in degrees, orbit radius, avatar radius].
const SATELLITES: ReadonlyArray<readonly [number, number, number]> = [
  [-100, OUTER, 24],
  [-140, OUTER, 11],
  [-58, OUTER, 12],
  [-18, OUTER, 23],
  [18, OUTER, 10],
  [58, OUTER, 24],
  [112, OUTER, 12],
  [158, OUTER, 23],
  [-165, INNER, 15],
  [40, INNER, 11],
]

/**
 * A person in the middle surrounded by others on two dotted orbits (PLAN 5.6 #26 item 2,
 * redrawn). TODO(content): placeholder art, replace with Bloom's own illustration.
 */
export function Orbits() {
  return (
    <svg className={styles.illustration} viewBox="0 0 270 266" aria-hidden="true" focusable="false">
      <g fill="none" stroke="#c9c5e8" strokeWidth="1.5" strokeDasharray="3 5">
        <circle cx={CX} cy={CY} r={INNER} />
        <circle cx={CX} cy={CY} r={OUTER} />
      </g>
      <circle cx={CX} cy={CY} r={54} fill="#ffffff" />
      <Avatar cx={CX} cy={CY} r={50} seed={0} />
      {SATELLITES.map(([deg, orbit, r], index) => {
        const a = (deg * Math.PI) / 180
        const x = CX + orbit * Math.cos(a)
        const y = CY + orbit * Math.sin(a)
        return (
          <g key={deg}>
            <circle cx={x} cy={y} r={r + 2.5} fill="#ffffff" />
            <Avatar cx={x} cy={y} r={r} seed={index + 1} />
          </g>
        )
      })}
    </svg>
  )
}
