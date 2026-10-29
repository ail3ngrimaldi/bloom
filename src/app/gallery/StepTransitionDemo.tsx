'use client'

import { useState } from 'react'
import { StepTransition } from '@/ui'
import styles from './gallery.module.css'

export function StepTransitionDemo() {
  const [step, setStep] = useState(1)
  const [entered, setEntered] = useState<string>('-')
  return (
    <div className={styles.row}>
      <div className={styles.transitionFrame}>
        <StepTransition stepKey={step} onEntered={(key) => setEntered(String(key))}>
          <p className={styles.transitionStep}>Step {step}</p>
        </StepTransition>
      </div>
      <div className={styles.column}>
        <button type="button" className={styles.demoButton} onClick={() => setStep((n) => n + 1)}>
          Next step
        </button>
        <p className={styles.caption}>
          Out 400 ms, gap 150 ms, in 300 ms. The frame never animates. Last entered: {entered}
        </p>
      </div>
    </div>
  )
}
