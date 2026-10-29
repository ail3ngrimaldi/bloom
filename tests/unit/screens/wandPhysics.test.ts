import { describe, expect, it } from 'vitest'
import {
  ALLOWED_OVERLAP_PX,
  BUBBLES,
  DRIFT_PX,
  bubbleSpec,
  driftOffset,
  easeOut,
  layoutFor,
  separate,
} from '@/screens/wand/physics'

const ALL = BUBBLES.map((bubble) => bubble.id)

function bounds(layout: Record<string, readonly [number, number]>) {
  const ids = Object.keys(layout)
  return {
    left: Math.min(...ids.map((id) => layout[id][0] - bubbleSpec(id).r)),
    right: Math.max(...ids.map((id) => layout[id][0] + bubbleSpec(id).r)),
    top: Math.min(...ids.map((id) => layout[id][1] - bubbleSpec(id).r)),
    bottom: Math.max(...ids.map((id) => layout[id][1] + bubbleSpec(id).r)),
  }
}

describe('wand bubbles', () => {
  it('has the five bubbles with the reference diameters', () => {
    expect(BUBBLES.map((b) => [b.id, b.r * 2])).toEqual([
      ['anxiety', 55],
      ['self_doubt', 72],
      ['burnout', 55],
      ['loneliness', 75],
      ['lack_of_motivation', 112],
    ])
    for (const bubble of BUBBLES) {
      expect(Math.abs(bubble.tilt)).toBeGreaterThanOrEqual(10)
      expect(Math.abs(bubble.tilt)).toBeLessThanOrEqual(25)
      expect(bubble.period).toBeGreaterThanOrEqual(3)
      expect(bubble.period).toBeLessThanOrEqual(6)
    }
  })

  it('rests without overlaps', () => {
    const layout = layoutFor(ALL)
    for (let i = 0; i < ALL.length; i++)
      for (let j = i + 1; j < ALL.length; j++) {
        const [a, b] = [layout[ALL[i]], layout[ALL[j]]]
        const gap =
          Math.hypot(a[0] - b[0], a[1] - b[1]) - bubbleSpec(ALL[i]).r - bubbleSpec(ALL[j]).r
        expect(gap, `${ALL[i]}-${ALL[j]}`).toBeGreaterThan(0)
      }
  })

  it('keeps the remaining cluster centred after releases', () => {
    for (const alive of [ALL, ALL.slice(1), ['burnout', 'loneliness'], ['anxiety']]) {
      const box = bounds(layoutFor(alive))
      expect(box.left + box.right).toBeCloseTo(0)
      expect(box.top + box.bottom).toBeCloseTo(0)
    }
    expect(layoutFor([])).toEqual({})
  })

  it('drifts at most about 8 px from the anchor', () => {
    for (const bubble of BUBBLES)
      for (let t = 0; t < 12; t += 0.25) {
        const [dx, dy] = driftOffset(bubble, t)
        expect(Math.abs(dx)).toBeLessThanOrEqual(DRIFT_PX)
        expect(Math.abs(dy)).toBeLessThanOrEqual(DRIFT_PX)
      }
  })

  it('pushes overlapping bubbles apart until they only touch softly', () => {
    const squeezed = separate({ anxiety: [0, 0], burnout: [10, 0] }, 1)
    const distance = Math.abs(squeezed.burnout[0] - squeezed.anxiety[0])
    expect(distance).toBeCloseTo(27.5 * 2 - ALLOWED_OVERLAP_PX)
    // Symmetric: both moved by the same amount.
    expect(squeezed.anxiety[0]).toBeCloseTo(-squeezed.burnout[0] + 10)
  })

  it('leaves bubbles that do not overlap where they are', () => {
    const apart = { anxiety: [0, 0] as const, burnout: [80, 0] as const }
    expect(separate(apart)).toEqual({ anxiety: [0, 0], burnout: [80, 0] })
  })

  it('eases out between 0 and 1', () => {
    expect(easeOut(-1)).toBe(0)
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(2)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0.5)
  })
})
