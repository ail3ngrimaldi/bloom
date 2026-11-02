import type { ReactNode } from 'react'
import { AttributionCapture } from '@/funnel/AttributionCapture'
import { FunnelProvider } from '@/funnel/FunnelProvider'

/** Every funnel step shares this layout, so the answers held by the provider outlast each step. */
export default function FunnelLayout({ children }: { children: ReactNode }) {
  return (
    <FunnelProvider>
      <AttributionCapture />
      {children}
    </FunnelProvider>
  )
}
