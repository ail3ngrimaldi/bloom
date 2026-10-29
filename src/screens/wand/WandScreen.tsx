'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, MouseEvent } from 'react'
import { copy, copyField, interpolate, stepCopy } from '@/funnel/copy'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import { Button, prefersReducedMotion } from '@/ui'
import { cx } from '@/ui/cx'
import { WandIcon } from '../art'
import motion from '../motion.module.css'
import { revealStyle } from '../revealStyle'
import type { ScreenProps } from '../types'
import {
  bubbleSpec,
  driftOffset,
  driftTilt,
  easeOut,
  layoutFor,
  lerpPoint,
  separate,
} from './physics'
import type { Point } from './physics'
import styles from './WandScreen.module.css'

/** The rest of the cluster rearranges itself in about 400 ms after a release (PLAN 5.5). */
export const REARRANGE_MS = 400
/** Particles fly out to 2.5x and fade in about 700 ms. */
export const BURST_MS = 700

const PARTICLES = Array.from({ length: 10 }, (_, index) => index * 36)
const FINISH_SUBTITLE = revealStyle(900, 400)

interface Burst {
  id: string
  x: number
  y: number
}

interface Layout {
  from: Record<string, Point>
  to: Record<string, Point>
  start: number
}

function anchorsAt(layout: Layout, now: number, instant: boolean): Record<string, Point> {
  const k = instant ? 1 : easeOut((now - layout.start) / REARRANGE_MS)
  return Object.fromEntries(
    Object.entries(layout.to).map(([id, to]) => [id, lerpPoint(layout.from[id] ?? to, to, k)]),
  )
}

const translate = ([x, y]: Point) => `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`

/**
 * "If you had a magic wand" (#08, PLAN 5.5): five bubbles drift in a light column on a dark page;
 * tapping one bursts it into a ring of particles and counts it. After the third the title turns
 * to "Feel that lightness", the rest float away and a white Continue appears. The released
 * bubbles are stored in tap order (they feed the "Trigger" of the summary).
 */
export function WandScreen({ step, onNext }: ScreenProps<'wand'>) {
  const actions = useFunnelActions()
  const text = stepCopy(step.id)
  const [released, setReleased] = useState<readonly string[]>([])
  const [bursts, setBursts] = useState<readonly Burst[]>([])
  const [reduced] = useState(prefersReducedMotion)
  const [initial] = useState(() => layoutFor(step.bubbles))
  const finished = released.length >= step.pick

  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const ctaRef = useRef<HTMLButtonElement>(null)
  const positions = useRef<Record<string, Point>>(initial)
  const layout = useRef<Layout>({ from: initial, to: initial, start: 0 })
  const focusNext = useRef<string | null>(null)

  // Rearrange what is left whenever a bubble goes.
  useEffect(() => {
    const now = performance.now()
    const remaining = step.bubbles.filter((id) => !released.includes(id))
    layout.current = {
      from: anchorsAt(layout.current, now, reduced),
      to: layoutFor(remaining),
      start: now,
    }
  }, [released, step.bubbles, reduced])

  // Drift and soft collision, written straight to the DOM once per frame (no re-render).
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const seconds = (now - start) / 1000
      const anchors = anchorsAt(layout.current, now, reduced)
      const targets: Record<string, Point> = {}
      for (const [id, [x, y]] of Object.entries(anchors)) {
        const [dx, dy] = reduced ? [0, 0] : driftOffset(bubbleSpec(id), seconds)
        targets[id] = [x + dx, y + dy]
      }
      const placed = separate(targets)
      positions.current = { ...positions.current, ...placed }
      for (const [id, point] of Object.entries(placed)) {
        const element = buttons.current.get(id)
        if (!element) continue
        element.style.transform = translate(point)
        if (!reduced)
          element.style.setProperty('--tilt', `${driftTilt(bubbleSpec(id), seconds).toFixed(2)}deg`)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced])

  // Keyboard users keep their place: focus moves to the next bubble, or to Continue at the end.
  useEffect(() => {
    const target = focusNext.current
    if (!target) return
    focusNext.current = null
    if (target === 'cta') ctaRef.current?.focus()
    else buttons.current.get(target)?.focus()
  }, [released])

  const release = (id: string, event: MouseEvent<HTMLButtonElement>) => {
    if (finished || released.includes(id)) return
    const next = [...released, id]
    const [x, y] = positions.current[id] ?? [0, 0]
    setReleased(next)
    setBursts((list) => [...list, { id, x, y }])
    actions.track({ name: 'wand_release', label: id, count: next.length })
    if (next.length >= step.pick) actions.answer(step.answerKey, next)
    // A click from the keyboard (Enter or Space) has no pointer position: detail is 0.
    if (event.detail === 0) {
      const rest = step.bubbles.filter((bubble) => !next.includes(bubble))
      focusNext.current = next.length >= step.pick ? 'cta' : (rest[0] ?? null)
    }
  }

  const label = (id: string) => copyField(step.id, `bubbles.${id}`) ?? id
  const counterVars = { count: released.length, total: step.pick }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <div className={cx(styles.intro, finished && styles.gone)} aria-hidden={finished}>
          <WandIcon />
          {/* One heading at a time: once finished, the old title only fades out. */}
          {finished ? (
            <p className={styles.title}>{text.title}</p>
          ) : (
            <h1 className={styles.title}>{text.title}</h1>
          )}
          <p className={styles.subtitle}>{text.subtitle}</p>
        </div>

        {finished && (
          <div className={styles.finish}>
            <h1 className={cx(styles.title, motion.reveal)} style={revealStyle(0, 300)}>
              {copyField(step.id, 'finishTitle')}
            </h1>
            <p className={cx(styles.subtitle, motion.reveal)} style={FINISH_SUBTITLE}>
              {copyField(step.id, 'finishSubtitle')}
            </p>
          </div>
        )}

        <div className={styles.cluster} inert={finished || undefined}>
          {step.bubbles.map((id) => {
            if (released.includes(id)) return null
            const spec = bubbleSpec(id)
            return (
              <div key={id} className={cx(styles.slot, finished && styles.floatAway)}>
                <button
                  ref={(element) => {
                    if (element) buttons.current.set(id, element)
                    else buttons.current.delete(id)
                  }}
                  type="button"
                  className={cx(styles.bubble, styles[id])}
                  style={
                    {
                      '--r': `${spec.r}px`,
                      '--tilt': `${spec.tilt}deg`,
                      transform: translate(initial[id]),
                    } as CSSProperties
                  }
                  aria-label={interpolate(copyField(step.id, 'releaseLabel') ?? '{{label}}', {
                    label: label(id),
                  })}
                  onClick={(event) => release(id, event)}
                >
                  <span className={styles.label} aria-hidden="true">
                    {label(id)}
                  </span>
                </button>
              </div>
            )
          })}
          {bursts.map(({ id, x, y }) => (
            <span
              key={id}
              className={cx(styles.burst, styles[id])}
              style={
                {
                  '--r': `${bubbleSpec(id).r}px`,
                  transform: translate([x, y]),
                } as CSSProperties
              }
              aria-hidden="true"
              data-burst={id}
            >
              <span className={styles.disc} />
              <span className={styles.ring} />
              {PARTICLES.map((angle) => (
                <span
                  key={angle}
                  className={styles.particle}
                  style={{ '--a': `${angle}deg` } as CSSProperties}
                />
              ))}
            </span>
          ))}
        </div>

        <p className={cx(styles.counter, finished && styles.gone)} aria-hidden="true">
          {interpolate(copyField(step.id, 'counter') ?? '', counterVars)}
        </p>
        <p className={styles.srOnly} aria-live="polite">
          {released.length > 0
            ? interpolate(copyField(step.id, 'counterAnnouncement') ?? '', counterVars)
            : ''}
        </p>

        {finished && (
          <div className={cx(styles.cta, motion.reveal)} style={revealStyle(0, 300)}>
            <Button ref={ctaRef} variant="white" onClick={onNext}>
              {text.cta ?? copy.common.continue}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
