import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import type { FunnelEvent } from '@/funnel/analytics'
import { FunnelProvider } from '@/funnel/FunnelProvider'
import type { FunnelNavigator } from '@/funnel/navigation'
import { INITIAL_STATE } from '@/funnel/state'
import type { FunnelState } from '@/funnel/state'
import { STORAGE_KEY, createFunnelStore } from '@/funnel/store'
import type { CheckoutProvider } from '@/services/checkout/types'
import type { LeadService } from '@/services/lead/types'
import { navigationState } from './nextNavigation'

/**
 * Renders funnel UI with a real store (in-memory storage), a navigator that records URL changes
 * and moves the mocked usePathname, and an analytics adapter that records events. Requires the
 * next/navigation mock of ./nextNavigation in the test file.
 */
export function renderFunnel(
  ui: ReactElement,
  {
    path = '/s/intro',
    state,
    leads,
    checkout,
  }: {
    path?: string
    state?: Partial<FunnelState>
    leads?: LeadService
    checkout?: CheckoutProvider
  } = {},
) {
  navigationState.pathname = path.split('?')[0]
  window.history.replaceState(null, '', path)

  const data = new Map<string, string>()
  if (state) data.set(STORAGE_KEY, JSON.stringify({ ...INITIAL_STATE, ...state }))
  const store = createFunnelStore({
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  })

  const go = (url: string) => {
    navigationState.pathname = url.split('?')[0]
    window.history.replaceState(null, '', url)
  }
  const navigator: FunnelNavigator & {
    push: ReturnType<typeof vi.fn>
    replace: ReturnType<typeof vi.fn>
    back: ReturnType<typeof vi.fn>
  } = {
    push: vi.fn(go),
    replace: vi.fn(go),
    currentPath: () => navigationState.pathname,
    back: vi.fn(() => {}),
  }
  const events: FunnelEvent[] = []
  const analytics = { track: (event: FunnelEvent) => void events.push(event) }

  const wrap = (node: ReactElement) => (
    <FunnelProvider
      store={store}
      navigator={navigator}
      analytics={analytics}
      leads={leads}
      checkout={checkout}
    >
      {node}
    </FunnelProvider>
  )
  const view = render(wrap(ui))
  return {
    ...view,
    store,
    navigator,
    events,
    rerenderFunnel: (node: ReactElement) => view.rerender(wrap(node)),
  }
}
