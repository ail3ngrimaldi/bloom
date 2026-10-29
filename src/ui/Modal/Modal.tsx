import { useEffect, useId, useRef } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../cx'
import { lockScroll } from './scrollLock'
import styles from './Modal.module.css'

export type ModalSize = 'sheet' | 'checkout'
export type ModalBackdrop = 'loader' | 'checkout'

export interface ModalProps {
  open: boolean
  onClose?: () => void
  /** 'sheet' is 375 x 648 like the card (loader questions); 'checkout' is up to 430 x 630. */
  size?: ModalSize
  /** Backdrop colour token. Defaults to the one that matches the size. */
  backdrop?: ModalBackdrop
  /** Accessible name, rendered as the dialog heading. */
  title?: ReactNode
  /** Keeps the title for assistive technology only. */
  hideTitle?: boolean
  /** id of an element inside the dialog that names it, when `title` is not used. */
  labelledBy?: string
  closeOnEscape?: boolean
  closeOnBackdropClick?: boolean
  className?: string
  children?: ReactNode
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function tabbables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getAttribute('aria-hidden') !== 'true' && el.getAttribute('tabindex') !== '-1',
  )
}

/**
 * Accessible modal dialog rendered in a portal: focus moves in on open, is trapped while open and
 * returns to the previously focused element on close; ESC closes (configurable) and the page
 * behind cannot scroll.
 */
export function Modal({
  open,
  onClose,
  size = 'sheet',
  backdrop,
  title,
  hideTitle = false,
  labelledBy,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  className,
  children,
}: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // On the document, not the dialog: focus may rest on the body after a click on the backdrop.
  useEffect(() => {
    if (!open || !closeOnEscape) return
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current?.()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, closeOnEscape])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    if (!dialog) return

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const unlock = lockScroll()

    const initial =
      dialog.querySelector<HTMLElement>('[data-autofocus]') ?? tabbables(dialog)[0] ?? dialog
    initial.focus()

    // Focus that escapes (a click on the backdrop, a script) is pulled back inside.
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) {
        ;(tabbables(dialog)[0] ?? dialog).focus()
      }
    }
    document.addEventListener('focusin', keepFocusInside)

    return () => {
      document.removeEventListener('focusin', keepFocusInside)
      unlock()
      if (opener?.isConnected) opener.focus()
    }
  }, [open])

  if (!open) return null

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return
    const items = tabbables(dialog)
    if (items.length === 0) {
      event.preventDefault()
      dialog.focus()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) onCloseRef.current?.()
  }

  const backdropKind: ModalBackdrop = backdrop ?? (size === 'checkout' ? 'checkout' : 'loader')

  return createPortal(
    <div
      className={cx(styles.backdrop, backdropKind === 'checkout' ? styles.checkout : styles.loader)}
      data-backdrop={backdropKind}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy ?? (title !== undefined ? titleId : undefined)}
        tabIndex={-1}
        className={cx(
          styles.dialog,
          size === 'checkout' ? styles.sizeCheckout : styles.sizeSheet,
          className,
        )}
        data-size={size}
        onKeyDown={handleKeyDown}
      >
        {title !== undefined && (
          <h2 id={titleId} className={hideTitle ? styles.visuallyHidden : styles.title}>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
