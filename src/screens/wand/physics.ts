/**
 * Geometry of the wand bubbles (PLAN 5.5): where each bubble rests, how it drifts and how the
 * bubbles push each other apart. Pure functions, so they can be unit-tested; WandScreen runs them
 * on every animation frame.
 */

export type Point = readonly [x: number, y: number]

export interface BubbleSpec {
  id: string
  /** Radius in CSS px (diameters 55, 72, 55, 75 and 112 in the reference). */
  r: number
  /** Resting place, relative to the centre of the cluster. */
  anchor: Point
  /** Label rotation in degrees (the reference tilts them between 10 and 25 degrees). */
  tilt: number
  /** Drift period in seconds (3 to 6) and phase, so no two bubbles move in step. */
  period: number
  phase: number
}

export const BUBBLES: readonly BubbleSpec[] = [
  { id: 'anxiety', r: 27.5, anchor: [-48, -78], tilt: 12, period: 4.2, phase: 0.3 },
  { id: 'self_doubt', r: 36, anchor: [54, -66], tilt: 18, period: 5.1, phase: 1.7 },
  { id: 'burnout', r: 27.5, anchor: [-40, -8], tilt: 10, period: 3.6, phase: 2.6 },
  { id: 'loneliness', r: 37.5, anchor: [-60, 62], tilt: 12, period: 4.8, phase: 4.1 },
  { id: 'lack_of_motivation', r: 56, anchor: [40, 40], tilt: -22, period: 5.7, phase: 5.2 },
]

const BY_ID = new Map(BUBBLES.map((bubble) => [bubble.id, bubble]))

export function bubbleSpec(id: string): BubbleSpec {
  const spec = BY_ID.get(id)
  if (!spec) throw new Error(`unknown bubble ${id}`)
  return spec
}

/** Drift amplitude (PLAN 5.5: about 8 px). */
export const DRIFT_PX = 8

/** Slow wandering around the anchor: a Lissajous loop of DRIFT_PX over the bubble's period. */
export function driftOffset(spec: BubbleSpec, seconds: number): Point {
  const a = (2 * Math.PI * seconds) / spec.period + spec.phase
  return [DRIFT_PX * Math.sin(a), DRIFT_PX * Math.cos(a * 0.8 + 0.5)]
}

/** Slight wobble of the label with the drift, in degrees. */
export function driftTilt(spec: BubbleSpec, seconds: number): number {
  return spec.tilt + 3 * Math.sin((2 * Math.PI * seconds) / (spec.period * 1.3) + spec.phase)
}

/**
 * Resting places of the bubbles still there: their anchors, shifted so the group stays centred
 * (the rest of the cluster rearranges itself after a release).
 */
export function layoutFor(alive: readonly string[]): Record<string, Point> {
  const specs = alive.map(bubbleSpec)
  if (specs.length === 0) return {}
  const left = Math.min(...specs.map((s) => s.anchor[0] - s.r))
  const right = Math.max(...specs.map((s) => s.anchor[0] + s.r))
  const top = Math.min(...specs.map((s) => s.anchor[1] - s.r))
  const bottom = Math.max(...specs.map((s) => s.anchor[1] + s.r))
  const dx = -(left + right) / 2
  const dy = -(top + bottom) / 2
  return Object.fromEntries(specs.map((s) => [s.id, [s.anchor[0] + dx, s.anchor[1] + dy] as Point]))
}

/** Overlap tolerated between two bubbles before they push each other (soft collision). */
export const ALLOWED_OVERLAP_PX = 4

/**
 * Soft collision: pairs that overlap by more than ALLOWED_OVERLAP_PX are pushed apart along the
 * line between their centres, half each, for a few relaxation passes.
 */
export function separate(positions: Record<string, Point>, passes = 2): Record<string, Point> {
  const ids = Object.keys(positions)
  const out: Record<string, [number, number]> = Object.fromEntries(
    ids.map((id) => [id, [positions[id][0], positions[id][1]]]),
  )
  for (let pass = 0; pass < passes; pass++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = out[ids[i]]
        const b = out[ids[j]]
        const min = bubbleSpec(ids[i]).r + bubbleSpec(ids[j]).r - ALLOWED_OVERLAP_PX
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const distance = Math.hypot(dx, dy) || 0.001
        if (distance >= min) continue
        const push = (min - distance) / 2
        const ux = dx / distance
        const uy = dy / distance
        a[0] -= ux * push
        a[1] -= uy * push
        b[0] += ux * push
        b[1] += uy * push
      }
    }
  }
  return out
}

/** Ease-out cubic, for the 400 ms rearrangement. */
export function easeOut(t: number): number {
  const clamped = Math.min(1, Math.max(0, t))
  return 1 - (1 - clamped) ** 3
}

export function lerpPoint(from: Point, to: Point, t: number): Point {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]
}
