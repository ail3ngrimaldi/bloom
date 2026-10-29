'use client'

import type { FunnelStep } from '@/funnel/steps'
import { MultiSelectScreen } from './multi'
import { PendingScreen } from './pending'
import { SingleSelectScreen } from './single'

export interface StepScreenProps {
  step: FunnelStep
  onNext: () => void
}

/** The screen component of each step type. */
export function StepScreen({ step, onNext }: StepScreenProps) {
  switch (step.type) {
    case 'single':
      return <SingleSelectScreen step={step} onNext={onNext} />
    case 'multi':
      return <MultiSelectScreen step={step} onNext={onNext} />
    default:
      return <PendingScreen step={step} onNext={onNext} />
  }
}
