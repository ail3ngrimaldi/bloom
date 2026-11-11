'use client'

import { useSyncExternalStore } from 'react'
import { closingVariant, defaultClosing } from './flags'
import { useFunnelState } from './FunnelProvider'
import type { ClosingVariant } from './types'

const noopSubscribe = () => () => {}

/**
 * `funnel.closing` of this visitor (flags.ts). The server, and the first pass while hydrating, use
 * the build default; the browser then reads the URL and the stored slug.
 */
export function useClosing(): ClosingVariant {
  const { attribution } = useFunnelState()
  return useSyncExternalStore(
    noopSubscribe,
    () => closingVariant(window.location.search, attribution.slug),
    () => defaultClosing(),
  )
}
