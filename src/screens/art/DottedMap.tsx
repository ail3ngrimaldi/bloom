import { useId } from 'react'
import { Avatar } from './Avatar'
import styles from './art.module.css'

const W = 284
const H = 157
const STEP = 4.6

// Rough continents as rotated ellipses: [cx, cy, rx, ry, degrees].
const LAND: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [70, 48, 46, 25, -10],
  [40, 30, 26, 14, 5],
  [92, 28, 20, 12, 0],
  [86, 75, 16, 9, 35],
  [112, 18, 12, 8, 0],
  [104, 115, 19, 31, 18],
  [97, 93, 12, 10, 0],
  [150, 36, 19, 13, 0],
  [139, 27, 10, 8, 0],
  [155, 92, 24, 33, 0],
  [148, 70, 20, 12, 0],
  [210, 42, 56, 26, 4],
  [236, 70, 24, 14, 0],
  [200, 66, 18, 10, 0],
  [250, 121, 22, 13, 0],
]

function onLand(x: number, y: number): boolean {
  return LAND.some(([cx, cy, rx, ry, deg]) => {
    const a = (deg * Math.PI) / 180
    const dx = x - cx
    const dy = y - cy
    const u = dx * Math.cos(a) + dy * Math.sin(a)
    const v = -dx * Math.sin(a) + dy * Math.cos(a)
    return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1
  })
}

// Deterministic sprinkle of gaps so the dots look hand-placed.
function keep(x: number, y: number): boolean {
  const h = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return h - Math.floor(h) > 0.1
}

const DOTS: ReadonlyArray<readonly [number, number]> = (() => {
  const dots: Array<[number, number]> = []
  for (let y = STEP / 2; y < H; y += STEP)
    for (let x = STEP / 2; x < W; x += STEP) if (onLand(x, y) && keep(x, y)) dots.push([x, y])
  return dots
})()

// Pin tips [x, y] and head radius.
const PINS: ReadonlyArray<readonly [number, number, number]> = [
  [52, 66, 13],
  [112, 52, 17],
  [148, 96, 15],
  [196, 64, 14],
  [232, 40, 12],
  [254, 110, 12],
]

/**
 * Dotted world map with six location pins (PLAN 5.6 #17 item 2, redrawn: no faces, no
 * likeness). TODO(content): placeholder art, replace with Bloom's own illustration.
 */
export function DottedMap() {
  const id = useId()
  return (
    <svg
      className={styles.illustration}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-pin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f7cff" />
          <stop offset="1" stopColor="#3424b8" />
        </linearGradient>
      </defs>
      <g fill="#cfcbea">
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1.45} />
        ))}
      </g>
      {PINS.map(([x, y, r], index) => {
        const head = y - r * 1.9
        return (
          <g key={`${x}-${y}`}>
            <path
              d={`M ${x} ${y} L ${x - r * 0.8} ${head + r * 0.6} A ${r} ${r} 0 1 1 ${x + r * 0.8} ${head + r * 0.6} Z`}
              fill={`url(#${id}-pin)`}
            />
            <circle cx={x} cy={head} r={r * 0.8} fill="#ffffff" />
            <Avatar cx={x} cy={head} r={r * 0.68} seed={index} />
          </g>
        )
      })}
    </svg>
  )
}
