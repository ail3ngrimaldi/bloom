'use client'

import { createContext, useContext } from 'react'

export interface RadioGroupContextValue {
  /** Currently selected option value, if any. */
  value: string | null | undefined
  select: (value: string) => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

/** The enclosing RadioGroup, or null when an option is used on its own. */
export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext)
}
