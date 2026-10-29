'use client'

import { useEffect, useState } from 'react'

/**
 * Seconds left of a countdown that started at `startedAt` (ms since epoch) and lasts `seconds`.
 * Ticks once a second while running; before `startedAt` is known it reports the full time.
 */
export function useCountdown(startedAt: number | null, seconds: number, enabled: boolean): number {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    const tick = () => setNow(Date.now())
    const first = setTimeout(tick, 0)
    const timer = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [enabled])

  if (startedAt === null || now === null) return seconds
  return Math.max(0, Math.ceil(seconds - (now - startedAt) / 1000))
}

export function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const rest = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
