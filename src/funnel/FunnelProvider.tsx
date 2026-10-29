'use client'

import { createContext, useContext, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { mockLeadService } from '@/services/lead/mock'
import type { LeadService } from '@/services/lead/types'
import { localAnalytics } from './analytics'
import type { AnalyticsAdapter } from './analytics'
import { historyNavigator } from './navigation'
import type { FunnelNavigator } from './navigation'
import type { FunnelState } from './state'
import { createFunnelStore, sessionStorageOrNull } from './store'
import type { FunnelStore } from './store'

interface FunnelContextValue {
  store: FunnelStore
  navigator: FunnelNavigator
  analytics: AnalyticsAdapter
  leads: LeadService
}

const FunnelContext = createContext<FunnelContextValue | null>(null)

export interface FunnelProviderProps {
  children: ReactNode
  /** Defaults to a store persisted in sessionStorage. */
  store?: FunnelStore
  /** Defaults to the History API. */
  navigator?: FunnelNavigator
  analytics?: AnalyticsAdapter
  /** Defaults to the mock, which sends nothing. */
  leads?: LeadService
}

/** Holds the funnel state for every /s/* page; it lives in the layout, so it outlasts each step. */
export function FunnelProvider({
  children,
  store,
  navigator,
  analytics,
  leads,
}: FunnelProviderProps) {
  const [value] = useState<FunnelContextValue>(() => ({
    store: store ?? createFunnelStore(sessionStorageOrNull()),
    navigator: navigator ?? historyNavigator,
    analytics: analytics ?? localAnalytics,
    leads: leads ?? mockLeadService,
  }))
  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>
}

export function useFunnelContext(): FunnelContextValue {
  const value = useContext(FunnelContext)
  if (!value) throw new Error('Funnel hooks must be used inside <FunnelProvider>')
  return value
}

/** Current funnel state. While hydrating it is the server's (empty) state, then the stored one. */
export function useFunnelState(): FunnelState {
  const { store } = useFunnelContext()
  return useSyncExternalStore(store.subscribe, store.getState, store.getServerState)
}

const noopSubscribe = () => () => {}

/** False on the server and during hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
