'use client'

import { useEffect } from 'react'
import { hasAttribution, parseAttribution } from './attribution'
import { useFunnelActions } from './useFunnelActions'

/**
 * Remembers where the visit comes from (PLAN-B 3.1 and 6.6): the UTM parameters of the ad, the
 * placement, fbclid and the funnel slug, read once from the landing URL. They are kept for the
 * session (first touch wins) and travel with the lead and with every analytics event. It renders
 * before the steps, so their first events (funnel_start, step_view) already carry them.
 */
export function AttributionCapture() {
  const actions = useFunnelActions()
  useEffect(() => {
    const incoming = parseAttribution(window.location.search)
    if (hasAttribution(incoming)) actions.attribute(incoming)
  }, [actions])
  return null
}
