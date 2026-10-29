import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import type { FocusEvent, HTMLAttributes, KeyboardEvent } from 'react'
import { cx } from '../cx'
import { RadioGroupContext } from './RadioGroupContext'
import type { RadioGroupContextValue } from './RadioGroupContext'
import styles from './RadioGroup.module.css'

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string | null
  onValueChange?: (value: string) => void
  orientation?: 'vertical' | 'horizontal'
}

const ITEM_SELECTOR = '[role="radio"]'

function enabledItems(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true',
  )
}

/**
 * role="radiogroup" with a roving tab stop: one option is tabbable (the one last focused, else the
 * selected one, else the first). Arrow keys, Home and End move focus; Enter and Space select
 * through the options' native button activation. Arrows deliberately do not select, because a
 * quiz question advances as soon as an answer is chosen.
 */
export function RadioGroup({
  value,
  onValueChange,
  orientation = 'vertical',
  className,
  children,
  onKeyDown,
  onFocus,
  ...rest
}: RadioGroupProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const tabStop = useRef<HTMLElement | null>(null)

  const syncTabStops = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const items = enabledItems(root)
    const current = tabStop.current && items.includes(tabStop.current) ? tabStop.current : null
    const checked = items.find((el) => el.getAttribute('aria-checked') === 'true')
    const active = current ?? checked ?? items[0]
    for (const el of items) el.tabIndex = el === active ? 0 : -1
  }, [])

  // Runs after every render so options added, removed or selected later still get a correct stop.
  useLayoutEffect(syncTabStops)

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    onFocus?.(event)
    const item = (event.target as HTMLElement).closest<HTMLElement>(ITEM_SELECTOR)
    if (item && item !== tabStop.current) {
      tabStop.current = item
      syncTabStops()
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !rootRef.current) return
    const items = enabledItems(rootRef.current)
    const index = items.findIndex((el) => el === document.activeElement)
    if (index === -1 || items.length === 0) return

    let next: number
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = (index + 1) % items.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        next = (index - 1 + items.length) % items.length
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = items.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    items[next].focus()
  }

  const context = useMemo<RadioGroupContextValue>(
    () => ({ value, select: (next) => onValueChange?.(next) }),
    [value, onValueChange],
  )

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        {...rest}
        ref={rootRef}
        className={cx(styles.group, className)}
        role="radiogroup"
        aria-orientation={orientation}
        data-orientation={orientation}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}
