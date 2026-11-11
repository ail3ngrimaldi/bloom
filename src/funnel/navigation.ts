import { isDevToolsEnabled } from '@/lib/env'
import { closingOf, isStepId, stepAt } from './steps'
import type { FunnelStep, StepId } from './steps'
import type { ClosingVariant } from './types'

export function stepPath(id: StepId): string {
  return `/s/${id}`
}

/** The step id of a funnel URL path (/s/<id>, optional trailing slash), or null. */
export function stepIdFromPath(pathname: string | null | undefined): StepId | null {
  const match = /^\/s\/([^/]+)\/?$/.exec(pathname ?? '')
  return match && isStepId(match[1]) ? match[1] : null
}

/** How the funnel changes the URL. Tests inject their own. */
export interface FunnelNavigator {
  push(url: string): void
  replace(url: string): void
  /** Path of the URL currently shown, read at call time (not at render time). */
  currentPath(): string
  /** The browser's Back. */
  back(): void
}

/**
 * Steps change the URL with the History API: Next.js syncs usePathname with pushState and
 * replaceState, so moving between steps is instant and needs no server round trip, while every
 * step keeps its own URL, the browser's Back goes one step back and a reload resumes in place.
 * The query string (campaign parameters, ?qa) is carried along.
 */
export const historyNavigator: FunnelNavigator = {
  push: (url) => window.history.pushState(null, '', url + window.location.search),
  replace: (url) => window.history.replaceState(null, '', url + window.location.search),
  currentPath: () => window.location.pathname,
  back: () => window.history.back(),
}

/**
 * Where a visitor may be: any step up to the furthest one reached by moving forward. Later steps
 * (a shared deep link, a stale tab) are sent back there. A step of the other closing (the paywall
 * while the funnel ends with "pay what you want", or the reverse) leads to the step at the same
 * position of this visitor's closing.
 */
export function allowedStep(
  requested: FunnelStep,
  furthest: number,
  bypass: boolean,
  closing: ClosingVariant,
): FunnelStep {
  if (bypass) return requested
  const owner = closingOf(requested)
  const step =
    owner !== null && owner !== closing ? (stepAt(requested.n, closing) ?? requested) : requested
  if (step.n <= furthest) return step
  return stepAt(furthest, closing) ?? step
}

/** QA bypass of the guard: `?qa` on any step URL, only where the dev tools are on (never prod). */
export function readQaBypass(search: string): boolean {
  return isDevToolsEnabled() && new URLSearchParams(search).has('qa')
}
