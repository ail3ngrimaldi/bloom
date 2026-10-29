'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { StepScreen } from '@/screens/StepScreen'
import { Card, PageShell, StepTransition } from '@/ui'
import { copy } from './copy'
import { useFunnelState, useHydrated } from './FunnelProvider'
import styles from './FunnelView.module.css'
import { allowedStep, readQaBypass, stepIdFromPath } from './navigation'
import { getStep } from './steps'
import type { FunnelStep, StepId } from './steps'
import type { Step } from './types'
import { useFunnelActions } from './useFunnelActions'

/**
 * What the step transition is keyed on: the checkout is the paywall with a modal on top, so
 * moving between them changes the modal, not the page.
 */
export function transitionKeyFor(step: Step): string {
  return step.type === 'checkout' ? 'paywall' : step.id
}

/** Question and capture screens sit on the quiz card; every other screen fills the page. */
export function frameFor(step: Step): 'card' | 'bare' {
  return step.type === 'single' || step.type === 'multi' || step.type === 'capture'
    ? 'card'
    : 'bare'
}

/** The empty frame of a step, rendered on the server and until the stored answers are back. */
function Frame({ step }: { step: Step }) {
  return (
    <PageShell theme={step.theme}>
      <Card variant={frameFor(step)} data-frame-step={step.id}>
        <noscript>
          <p className={styles.noscript}>{copy.common.noscript}</p>
        </noscript>
      </Card>
    </PageShell>
  )
}

const noopSubscribe = () => () => {}

/** The ?qa guard bypass (dev tools only). False on the server and while hydrating. */
function useQaBypass(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => readQaBypass(window.location.search),
    () => false,
  )
}

/**
 * The funnel: renders the step of the URL (/s/<id>) inside its frame and fades between steps.
 *
 * The server renders the empty frame of the requested step (background, card) and the step itself
 * appears once the stored answers are back, so a reload never flashes unpersonalised content.
 * The intro, which uses no stored answer, is rendered on the server in full.
 * A visitor who is further ahead than the furthest step they reached (a deep link, a stale tab)
 * is sent back there, unless the dev-tools ?qa bypass is on.
 */
export function FunnelView() {
  const requested = getStep(stepIdFromPath(usePathname()) ?? 'intro')
  const hydrated = useHydrated()
  const { furthest } = useFunnelState()
  const bypass = useQaBypass()
  const actions = useFunnelActions()
  const step = allowedStep(requested, furthest, bypass)
  const allowed = step === requested

  useEffect(() => {
    if (hydrated && !allowed) actions.goTo(step.id, { replace: true })
  }, [hydrated, allowed, step.id, actions])

  // The intro depends on no stored answer and is where visitors land, so it is rendered on the
  // server too: it paints (FCP, LCP) before the JavaScript has even loaded.
  const serverRenderable = requested.id === 'intro'
  if (!allowed || !(hydrated || serverRenderable)) {
    return <Frame step={hydrated ? step : requested} />
  }
  return <FunnelStage step={step} />
}

function FunnelStage({ step }: { step: FunnelStep }) {
  const actions = useFunnelActions()
  // The frame belongs to the step on screen: it changes while nothing is visible (onSwap).
  const [frameId, setFrameId] = useState<StepId>(step.id)
  const frameRef = useRef<HTMLDivElement>(null)
  const firstEntrance = useRef(true)
  const lastViewed = useRef<StepId | null>(null)

  useEffect(() => {
    // Once per step change (effects run twice on mount in development).
    if (lastViewed.current === step.id) return
    lastViewed.current = step.id
    if (step.id === 'intro') actions.track({ name: 'funnel_start' })
    actions.track({ name: 'step_view', n: step.n, id: step.id })
  }, [step, actions])

  const onNext = useCallback(() => actions.next(step), [actions, step])

  // After a step change, focus what the step asks for first (a field marked data-autofocus) or
  // else its heading, so screen readers announce it. On first load only a field gets focus.
  const onEntered = useCallback(() => {
    const first = firstEntrance.current
    firstEntrance.current = false
    const field = frameRef.current?.querySelector<HTMLElement>('[data-autofocus]')
    if (field) {
      field.focus({ preventScroll: true })
      return
    }
    if (first) return
    const heading = frameRef.current?.querySelector<HTMLElement>('h1')
    if (!heading) return
    heading.tabIndex = -1
    heading.focus({ preventScroll: true })
  }, [])

  const frameStep = getStep(frameId)
  return (
    <PageShell theme={frameStep.theme}>
      <Card ref={frameRef} variant={frameFor(frameStep)} data-frame-step={frameStep.id}>
        <StepTransition
          stepKey={transitionKeyFor(step)}
          appear
          onSwap={(key) => setFrameId(key as StepId)}
          onEntered={onEntered}
        >
          <StepScreen step={step} onNext={onNext} />
        </StepTransition>
      </Card>
    </PageShell>
  )
}
