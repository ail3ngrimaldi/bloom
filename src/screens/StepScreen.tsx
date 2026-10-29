'use client'

import type { FunnelStep } from '@/funnel/steps'
import { InterstitialScreen } from './inter'
import { IntroScreen } from './intro'
import { MultiSelectScreen } from './multi'
import { PendingScreen } from './pending'
import { SingleSelectScreen } from './single'
import { WandScreen } from './wand'

export interface StepScreenProps {
  step: FunnelStep
  onNext: () => void
}

/** The screen component of each step type. */
export function StepScreen({ step, onNext }: StepScreenProps) {
  switch (step.type) {
    case 'intro':
      return <IntroScreen step={step} onNext={onNext} />
    case 'wand':
      return <WandScreen step={step} onNext={onNext} />
    case 'inter':
      return <InterstitialScreen step={step} onNext={onNext} />
    case 'single':
      return <SingleSelectScreen step={step} onNext={onNext} />
    case 'multi':
      return <MultiSelectScreen step={step} onNext={onNext} />
    default:
      return <PendingScreen step={step} onNext={onNext} />
  }
}
