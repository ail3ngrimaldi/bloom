import { vi } from 'vitest'
import type { SoundService } from '@/services/sound'

/**
 * A SoundService that plays nothing and records what the funnel asks of it: `sound.tap` is the
 * click of an answer, `sound.start` the funnel switching the sound on (its cleanup is `stop`).
 * `muted` and `setMuted` behave like the real thing, notifying whoever subscribed.
 */
export function fakeSound({ supported = true, muted = false } = {}) {
  const listeners = new Set<() => void>()
  let isMuted = muted
  const stop = vi.fn()
  const sound = {
    isSupported: vi.fn(() => supported),
    start: vi.fn(() => stop),
    tap: vi.fn(),
    isMuted: vi.fn(() => isMuted),
    setMuted: vi.fn((next: boolean) => {
      isMuted = next
      for (const listener of listeners) listener()
    }),
    subscribe: vi.fn((listener: () => void) => {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    }),
  } satisfies SoundService
  return { sound, stop }
}
