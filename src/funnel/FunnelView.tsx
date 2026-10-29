'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { StepScreen } from '@/screens/StepScreen'
import { Card, PageShell, StepTransition } from '@/ui'
import { useFunnelState, useHydrated } from './FunnelProvider'
import { allowedStep, readQaBypass, stepIdFromPath } from './navigation'
import { getStep } from './steps'
import type { FunnelStep, StepId } from './steps'
import type { Step } from './types'
import { useFunnelActions } from './useFunnelActions'

/** Question and capture screens sit on the quiz card; every other screen fills the page. */
export function frameFor(step: Step): 'card' | 'bare' {
  return step.type === 'single' || step.type === 'multi' || step.type === 'capture'
    ? 'card'
    : 'bare'
}

function Frame({ step, children }: { step: Step; children?: ReactNode }) {
  return (
    <PageShell theme={step.theme}>
      <Card variant={frameFor(step)} data-frame-step={step.id}>
        {children}
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

  if (!hydrated || !allowed) return <Frame step={hydrated ? step : requested} />
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

  // After a step change, focus the new heading so screen readers announce it. Not on first load.
  const onEntered = useCallback(() => {
    if (firstEntrance.current) {
      firstEntrance.current = false
      return
    }
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
          stepKey={step.id}
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
