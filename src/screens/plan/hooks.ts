'use client'

import { useEffect, useState } from 'react'
import type { CountdownService } from '@/services/countdown/types'

/**
 * The authority's clock, ticking once a second while `running` (and fixed otherwise, so a page with
 * no countdown does not re-render every second).
 */
export function useNow(service: CountdownService, running: boolean): number {
  const [now, setNow] = useState(() => service.now())
  useEffect(() => {
    if (!running) return
    const tick = () => setNow(service.now())
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [service, running])
  return now
}

/** False until `trigger` is true and `delayMs` have passed since then. */
export function useAfter(trigger: boolean, delayMs: number): boolean {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!trigger) return
    const timer = setTimeout(() => setDone(true), delayMs)
    return () => clearTimeout(timer)
  }, [trigger, delayMs])
  return trigger && done
}
