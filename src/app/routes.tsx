import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Home } from './Home'

/**
 * The gallery is dev and QA tooling. `import.meta.env.DEV` is replaced by a literal `false` in
 * production builds, so the lazy import is dropped and the gallery never ships.
 */
const Gallery = import.meta.env.DEV ? lazy(() => import('./gallery/GalleryRoutes')) : null

/** Route table. Phase 2a adds the funnel routes (/s/:stepId) here. */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {Gallery && (
        <Route
          path="/__gallery/*"
          element={
            <Suspense fallback={null}>
              <Gallery />
            </Suspense>
          }
        />
      )}
    </Routes>
  )
}
