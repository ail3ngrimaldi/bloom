'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { copy } from './copy'
import { useHydrated, useSound } from './FunnelProvider'
import { stepIdFromPath } from './navigation'
import { getStep } from './steps'
import type { Step } from './types'
import styles from './SoundControl.module.css'

type Corner = 'top-left' | 'bottom-right'

/**
 * The switch sits in the top right corner. These steps have something of their own there, so it
 * moves to the nearest free corner (checked on phones and on desktop windows narrower than the
 * closing's header): the close button of the paywall, the visitor's chip on the "pay what you
 * want" page, its plan sheet and the loading screen, and the long title of the summary.
 */
const CORNER: Partial<Record<Step['type'], Corner>> = {
  paywall: 'top-left',
  checkout: 'top-left',
  pwyw: 'bottom-right',
  plan_sheet: 'bottom-right',
  loading: 'bottom-right',
  summary: 'bottom-right',
}

/**
 * Starts the funnel's sound and shows the switch that turns it off. Browsers only allow sound
 * after a tap, so the music begins with the visitor's first one (src/services/sound). Sound that
 * plays by itself needs a way to stop it (WCAG 1.4.2), so the switch stays in a corner of every
 * step and what it is set to is kept for the next visit.
 */
export function SoundControl() {
  const sound = useSound()
  const hydrated = useHydrated()
  const muted = useSyncExternalStore(sound.subscribe, sound.isMuted, () => false)
  const stepId = stepIdFromPath(usePathname())
  const corner = stepId ? CORNER[getStep(stepId).type] : undefined

  useEffect(() => sound.start(), [sound])

  // The server cannot know the choice, and there is nothing to switch in a browser without Web Audio.
  if (!hydrated || !sound.isSupported()) return null
  return (
    <button
      type="button"
      className={styles.switch}
      data-corner={corner}
      aria-label={copy.common.sound}
      aria-pressed={!muted}
      onClick={() => sound.setMuted(!muted)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 9.5v5h3.5l4.5 3.8V5.7L7.5 9.5H4Z" fill="currentColor" />
        {muted ? (
          <path d="m16 9.5 5 5m0-5-5 5" />
        ) : (
          <path d="M15.5 9a4.2 4.2 0 0 1 0 6m2.3-8.3a7.5 7.5 0 0 1 0 10.6" />
        )}
      </svg>
    </button>
  )
}
