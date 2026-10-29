import { vi } from 'vitest'

/**
 * Stand-in for `next/navigation`, which needs the App Router at runtime. Register it at the top of
 * a test file (vi.mock calls are hoisted, so the factory imports this module lazily):
 *
 *   vi.mock('next/navigation', async () =>
 *     (await import('./helpers/nextNavigation')).createNextNavigationMock(),
 *   )
 *
 * `notFound()` and `redirect()` throw like the real ones do, so a page that calls them can be
 * asserted with `expect(() => Page()).toThrow(NotFoundSignal)`.
 */

export class NotFoundSignal extends Error {
  constructor() {
    super('NEXT_NOT_FOUND')
    this.name = 'NotFoundSignal'
  }
}

export class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super(`NEXT_REDIRECT ${url}`)
    this.name = 'RedirectSignal'
  }
}

/** What the hooks report. Change it from a test (and call resetNextNavigation in beforeEach). */
export const navigationState: {
  pathname: string
  searchParams: URLSearchParams
  params: Record<string, string | string[]>
} = { pathname: '/', searchParams: new URLSearchParams(), params: {} }

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

export function resetNextNavigation(): void {
  navigationState.pathname = '/'
  navigationState.searchParams = new URLSearchParams()
  navigationState.params = {}
  for (const fn of Object.values(routerMock)) fn.mockReset()
}

export function createNextNavigationMock() {
  return {
    useRouter: () => routerMock,
    usePathname: () => navigationState.pathname,
    useSearchParams: () => navigationState.searchParams,
    useParams: () => navigationState.params,
    notFound: (): never => {
      throw new NotFoundSignal()
    },
    redirect: (url: string): never => {
      throw new RedirectSignal(url)
    },
  }
}
