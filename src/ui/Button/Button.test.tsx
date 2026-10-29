import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders a primary button of type button with a decorative arrow', () => {
    const { container } = render(<Button>Continue</Button>)
    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toBeEnabled()
    expect(button).not.toHaveAttribute('aria-disabled')
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continue</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards its ref and passes other props through', () => {
    const ref = createRef<HTMLButtonElement>()
    render(
      <Button ref={ref} data-testid="cta" type="submit">
        Continue
      </Button>,
    )
    expect(ref.current).toBe(screen.getByTestId('cta'))
    expect(ref.current).toHaveAttribute('type', 'submit')
  })

  describe('disabled', () => {
    it.each([
      ['variant', { variant: 'disabled' as const }],
      ['prop', { disabled: true }],
    ])('uses real disabled semantics through the %s', async (_, props) => {
      const onClick = vi.fn()
      render(
        <Button {...props} onClick={onClick}>
          Continue
        </Button>,
      )
      const button = screen.getByRole('button', { name: 'Continue' })
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('keeps the arrow, like the reference multi-select CTA', () => {
      const { container } = render(<Button variant="disabled">Continue</Button>)
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    })
  })

  describe('loading', () => {
    it.each([
      ['variant', { variant: 'loading' as const }],
      ['prop', { loading: true }],
    ])('shows "Please wait..." through the %s and ignores clicks', async (_, props) => {
      const onClick = vi.fn()
      const { container } = render(
        <Button {...props} onClick={onClick}>
          Continue
        </Button>,
      )
      const button = screen.getByRole('button', { name: 'Please wait...' })
      expect(button).toHaveAttribute('aria-busy', 'true')
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
      await userEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('stays focusable so focus is not lost while submitting', async () => {
      render(<Button loading>Continue</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
      await userEvent.tab()
      expect(button).toHaveFocus()
    })

    it('allows a custom loading label', () => {
      render(
        <Button loading loadingLabel="Saving...">
          Continue
        </Button>,
      )
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
    })
  })

  describe('white', () => {
    it('has no arrow by default and is clickable', async () => {
      const onClick = vi.fn()
      const { container } = render(
        <Button variant="white" onClick={onClick}>
          Continue
        </Button>,
      )
      expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
      await userEvent.click(screen.getByRole('button', { name: 'Continue' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('can opt into the arrow', () => {
      const { container } = render(
        <Button variant="white" arrow>
          Continue
        </Button>,
      )
      expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
    })
  })

  it('can hide the arrow on a primary button', () => {
    const { container } = render(<Button arrow={false}>Continue</Button>)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('applies the variant and size as different class names', () => {
    render(
      <>
        <Button>quiz</Button>
        <Button size="interstitial">inter</Button>
        <Button variant="white">white</Button>
      </>,
    )
    const classes = ['quiz', 'inter', 'white'].map(
      (name) => screen.getByRole('button', { name }).className,
    )
    expect(new Set(classes).size).toBe(3)
  })
})
