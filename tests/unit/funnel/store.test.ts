import { describe, expect, it, vi } from 'vitest'
import { INITIAL_STATE } from '@/funnel/state'
import { STORAGE_KEY, createFunnelStore } from '@/funnel/store'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => void data.set(key, value)),
    data,
  }
}

describe('createFunnelStore', () => {
  it('starts empty without storage and serves the empty state to the server render', () => {
    const store = createFunnelStore()
    expect(store.getState()).toBe(INITIAL_STATE)
    expect(store.getServerState()).toBe(INITIAL_STATE)
  })

  it('persists every change to session storage and notifies subscribers', () => {
    const storage = memoryStorage()
    const store = createFunnelStore(storage)
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)

    store.dispatch({ type: 'answer', key: 'drained', value: 'often' })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(JSON.parse(storage.data.get(STORAGE_KEY)!).answers).toEqual({ drained: 'often' })

    unsubscribe()
    store.dispatch({ type: 'answer', key: 'drained', value: 'rarely' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('skips no-op actions entirely', () => {
    const storage = memoryStorage()
    const store = createFunnelStore(storage)
    const listener = vi.fn()
    store.subscribe(listener)
    store.dispatch({ type: 'reach', n: 1 })
    expect(listener).not.toHaveBeenCalled()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('resumes from a stored state, while the server still gets the empty one', () => {
    const saved = { ...INITIAL_STATE, answers: { gender: 'male' }, furthest: 16 }
    const store = createFunnelStore(memoryStorage({ [STORAGE_KEY]: JSON.stringify(saved) }))
    expect(store.getState()).toEqual(saved)
    expect(store.getServerState()).toBe(INITIAL_STATE)
  })

  it('ignores stored data that is not JSON or not a funnel state', () => {
    expect(createFunnelStore(memoryStorage({ [STORAGE_KEY]: '{oops' })).getState()).toBe(
      INITIAL_STATE,
    )
    expect(createFunnelStore(memoryStorage({ [STORAGE_KEY]: '{"furthest":"x"}' })).getState()).toBe(
      INITIAL_STATE,
    )
  })

  it('keeps working in memory when storage throws (quota, privacy modes)', () => {
    const storage = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('quota')
      },
    }
    const store = createFunnelStore(storage)
    store.dispatch({ type: 'answer', key: 'a', value: 'b' })
    expect(store.getState().answers).toEqual({ a: 'b' })
  })
})
