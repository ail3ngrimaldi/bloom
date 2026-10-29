'use client'

import type { FunnelStep } from '@/funnel/steps'
import { CaptureScreen } from './capture'
import { InterstitialScreen } from './inter'
import { IntroScreen } from './intro'
import { LoaderScreen } from './loader'
import { LoadingScreen } from './loading'
import { MultiSelectScreen } from './multi'
import { PaywallScreen } from './paywall'
import { SingleSelectScreen } from './single'
import { SummaryScreen } from './summary'
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
    case 'loader':
      return <LoaderScreen step={step} onNext={onNext} />
    case 'capture':
      return <CaptureScreen step={step} onNext={onNext} />
    case 'loading':
      return <LoadingScreen step={step} onNext={onNext} />
    case 'summary':
      return <SummaryScreen step={step} onNext={onNext} />
    case 'inter':
      return <InterstitialScreen step={step} onNext={onNext} />
    case 'single':
      return <SingleSelectScreen step={step} onNext={onNext} />
    case 'multi':
      return <MultiSelectScreen step={step} onNext={onNext} />
    case 'paywall':
    case 'checkout':
      return <PaywallScreen step={step} onNext={onNext} />
  }
}
