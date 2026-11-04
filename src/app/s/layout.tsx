import type { ReactNode } from 'react'
import { AttributionCapture } from '@/funnel/AttributionCapture'
import { FunnelProvider } from '@/funnel/FunnelProvider'
import { SoundControl } from '@/funnel/SoundControl'

/** Every funnel step shares this layout, so the answers held by the provider outlast each step. */
export default function FunnelLayout({ children }: { children: ReactNode }) {
  return (
    <FunnelProvider>
      <AttributionCapture />
      {children}
      {/* Fixed in a corner, so it is drawn wherever it is placed; last, so Tab reaches the step first. */}
      <SoundControl />
    </FunnelProvider>
  )
}
