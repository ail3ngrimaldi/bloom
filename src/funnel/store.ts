import { INITIAL_STATE, funnelReducer, parseState } from './state'
import type { FunnelAction, FunnelState } from './state'

/** sessionStorage key. Bump the version when FunnelState changes shape. */
export const STORAGE_KEY = 'bloom.funnel.v1'

/** Minimal external store for useSyncExternalStore. */
export interface FunnelStore {
  getState(): FunnelState
  /** What the server rendered (nothing is stored there): used while hydrating. */
  getServerState(): FunnelState
  subscribe(listener: () => void): () => void
  dispatch(action: FunnelAction): void
}

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>

/** The tab's sessionStorage, or null where it does not exist or is blocked (private modes). */
export function sessionStorageOrNull(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage
  } catch {
    return null
  }
}

function load(storage: KeyValueStorage | null): FunnelState | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    return raw === null ? null : parseState(JSON.parse(raw))
  } catch {
    return null
  }
}

function save(storage: KeyValueStorage | null, state: FunnelState): void {
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota or privacy settings: the funnel keeps working in memory for this page.
  }
}

/**
 * Funnel state that survives a reload of the tab (sessionStorage: it is gone when the tab closes,
 * nothing is shared with other tabs or sent anywhere). Created once per funnel layout.
 */
export function createFunnelStore(storage: KeyValueStorage | null = null): FunnelStore {
  let state = load(storage) ?? INITIAL_STATE
  const listeners = new Set<() => void>()

  return {
    getState: () => state,
    getServerState: () => INITIAL_STATE,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    dispatch(action) {
      const next = funnelReducer(state, action)
      if (next === state) return
      state = next
      save(storage, state)
      for (const listener of listeners) listener()
    },
  }
}
