'use client'

import type { ScreenProps } from '../types'
import { EvidenceScreen } from './EvidenceScreen'
import { ExpertScreen } from './ExpertScreen'
import { MatchScreen } from './MatchScreen'
import { NotAloneScreen } from './NotAloneScreen'
import { ScienceScreen } from './ScienceScreen'

/** The five interstitials (#17, #25, #26, #30, #31) by variant. */
export function InterstitialScreen(props: ScreenProps<'inter'>) {
  switch (props.step.variant) {
    case 'science':
      return <ScienceScreen {...props} />
    case 'match':
      return <MatchScreen {...props} />
    case 'not_alone':
      return <NotAloneScreen {...props} />
    case 'evidence':
      return <EvidenceScreen {...props} />
    case 'expert':
      return <ExpertScreen {...props} />
  }
}
