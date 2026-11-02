import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { localCountdown, remainingSeconds } from '@/services/countdown'

describe('remainingSeconds', () => {
  it('counts whole seconds up to the end and never goes below 0', () => {
    expect(remainingSeconds(900_000, 0)).toBe(900)
    expect(remainingSeconds(900_000, 1)).toBe(900)
    expect(remainingSeconds(900_000, 899_001)).toBe(1)
    expect(remainingSeconds(900_000, 900_000)).toBe(0)
    expect(remainingSeconds(900_000, 950_000)).toBe(0)
  })
})

describe('localCountdown (the mock authority)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000_000)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('tells the time of the browser', () => {
    expect(localCountdown.now()).toBe(1_000_000)
  })

  it('opens a window that starts now and lasts the seconds it was asked for', () => {
    expect(localCountdown.open(900)).toEqual({ grantedAt: 1_000_000, expiresAt: 1_900_000 })
  })
})
