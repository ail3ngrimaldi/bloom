'use client'

import { useEffect, useState } from 'react'

/** False for `delayMs` after the component mounts, then true (immediately when delayMs <= 0). */
export function useDelayedFlag(delayMs: number): boolean {
  const [done, setDone] = useState(delayMs <= 0)
  useEffect(() => {
    if (delayMs <= 0) return
    const timer = setTimeout(() => setDone(true), delayMs)
    return () => clearTimeout(timer)
  }, [delayMs])
  return done
}
