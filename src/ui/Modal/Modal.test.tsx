import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'
import type { ModalProps } from './Modal'

function Harness(props: Partial<ModalProps> & { onClosed?: () => void }) {
  const { onClosed, ...modalProps } = props
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        opener
      </button>
      <button type="button">outside</button>
      <Modal
        title="Do you tend to lose motivation easily?"
        {...modalProps}
        open={open}
        onClose={() => {
          setOpen(false)
          onClosed?.()
        }}
      >
        <button type="button">first</button>
        <button type="button">middle</button>
        <button type="button">last</button>
      </Modal>
    </>
  )
}

async function openModal(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'opener' }))
  return screen.getByRole('dialog')
}

afterEach(() => {
  document.body.removeAttribute('style')
})

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Modal open={false}>hidden</Modal>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('hidden')).not.toBeInTheDocument()
  })

  it('is a modal dialog named by its title, rendered in a portal on the body', () => {
    const { container } = render(
      <Modal open title="Checkout">
        <p>body</p>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Checkout' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(container).not.toContainElement(dialog)
    expect(document.body).toContainElement(dialog)
    expect(screen.getByRole('heading', { name: 'Checkout' })).toHaveAttribute(
      'id',
      dialog.getAttribute('aria-labelledby'),
    )
  })

  it('can keep the title for assistive technology only', () => {
    render(<Modal open title="Checkout" hideTitle />)
    expect(screen.getByRole('dialog', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Checkout' }).className).toMatch(/visuallyHidden/)
  })

  it('can be labelled by an element inside it instead', () => {
    render(
      <Modal open labelledBy="own-title">
        <h2 id="own-title">Custom heading</h2>
      </Modal>,
    )
    expect(screen.getByRole('dialog', { name: 'Custom heading' })).toBeInTheDocument()
  })

  describe('size and backdrop', () => {
    it('is a 375 x 648 sheet over the 50% loader backdrop by default', () => {
      render(<Modal open title="t" />)
      expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'sheet')
      expect(screen.getByRole('dialog').parentElement).toHaveAttribute('data-backdrop', 'loader')
    })

    it('uses the checkout size with the 60% checkout backdrop', () => {
      render(<Modal open title="t" size="checkout" />)
      expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'checkout')
      expect(screen.getByRole('dialog').parentElement).toHaveAttribute('data-backdrop', 'checkout')
    })

    it('lets the backdrop be chosen independently of the size', () => {
      render(<Modal open title="t" size="sheet" backdrop="checkout" />)
      expect(screen.getByRole('dialog').parentElement).toHaveAttribute('data-backdrop', 'checkout')
    })
  })

  describe('focus', () => {
    it('moves focus to the first focusable element on open', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await openModal(user)
      expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
    })

    it('prefers an element marked data-autofocus', () => {
      render(
        <Modal open title="t">
          <button type="button">first</button>
          <button type="button" data-autofocus>
            preferred
          </button>
        </Modal>,
      )
      expect(screen.getByRole('button', { name: 'preferred' })).toHaveFocus()
    })

    it('focuses the dialog itself when it has nothing focusable', () => {
      render(<Modal open title="t" />)
      expect(screen.getByRole('dialog')).toHaveFocus()
    })

    it('traps Tab: from the last element it wraps to the first', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await openModal(user)
      await user.tab()
      expect(screen.getByRole('button', { name: 'middle' })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'last' })).toHaveFocus()
      await user.tab()
      expect(screen.getByRole('button', { name: 'first' })).toHaveFocus()
    })

    it('traps Shift+Tab: from the first element it wraps to the last', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await openModal(user)
      await user.tab({ shift: true })
      expect(screen.getByRole('button', { name: 'last' })).toHaveFocus()
    })

    it('pulls focus back when it escapes the dialog', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await openModal(user)
      screen.getByRole('button', { name: 'outside' }).focus()
      expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
    })

    it('returns focus to the opener on close', async () => {
      const user = userEvent.setup()
      render(<Harness />)
      await openModal(user)
      await user.keyboard('{Escape}')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'opener' })).toHaveFocus()
    })
  })

  describe('closing', () => {
    it('closes on ESC', async () => {
      const user = userEvent.setup()
      const onClosed = vi.fn()
      render(<Harness onClosed={onClosed} />)
      await openModal(user)
      await user.keyboard('{Escape}')
      expect(onClosed).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('can ignore ESC (blocking loader questions)', async () => {
      const user = userEvent.setup()
      const onClosed = vi.fn()
      render(<Harness closeOnEscape={false} onClosed={onClosed} />)
      await openModal(user)
      await user.keyboard('{Escape}')
      expect(onClosed).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('closes when the backdrop is pressed but not when the dialog is', async () => {
      const user = userEvent.setup()
      const onClosed = vi.fn()
      render(<Harness onClosed={onClosed} />)
      const dialog = await openModal(user)
      await user.click(dialog)
      expect(onClosed).not.toHaveBeenCalled()
      await user.click(dialog.parentElement as HTMLElement)
      expect(onClosed).toHaveBeenCalledTimes(1)
    })

    it('can ignore backdrop presses', async () => {
      const user = userEvent.setup()
      const onClosed = vi.fn()
      render(<Harness closeOnBackdropClick={false} onClosed={onClosed} />)
      const dialog = await openModal(user)
      await user.click(dialog.parentElement as HTMLElement)
      expect(onClosed).not.toHaveBeenCalled()
    })
  })

  describe('scroll lock', () => {
    it('locks body scrolling while open and restores it afterwards', async () => {
      const user = userEvent.setup()
      document.body.style.overflow = 'auto'
      render(<Harness />)
      expect(document.body.style.overflow).toBe('auto')
      await openModal(user)
      expect(document.body.style.overflow).toBe('hidden')
      await user.keyboard('{Escape}')
      expect(document.body.style.overflow).toBe('auto')
    })

    it('keeps the lock until the last of two modals closes', () => {
      const { rerender } = render(
        <>
          <Modal open title="one" />
          <Modal open title="two" />
        </>,
      )
      expect(document.body.style.overflow).toBe('hidden')
      rerender(
        <>
          <Modal open={false} title="one" />
          <Modal open title="two" />
        </>,
      )
      expect(document.body.style.overflow).toBe('hidden')
      rerender(
        <>
          <Modal open={false} title="one" />
          <Modal open={false} title="two" />
        </>,
      )
      expect(document.body.style.overflow).toBe('')
    })

    it('unlocks when unmounted while open', () => {
      const { unmount } = render(<Modal open title="t" />)
      expect(document.body.style.overflow).toBe('hidden')
      unmount()
      expect(document.body.style.overflow).toBe('')
    })
  })
})
