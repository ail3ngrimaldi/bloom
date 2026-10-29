import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RadioGroup } from '../RadioGroup'
import { OptionCard } from './OptionCard'

describe('OptionCard', () => {
  it('is a radio with the label as its name, unchecked at rest', () => {
    render(<OptionCard value="often" label="Often" />)
    const option = screen.getByRole('radio', { name: 'Often' })
    expect(option).toHaveAttribute('aria-checked', 'false')
    expect(option).toHaveAttribute('type', 'button')
  })

  it('shows the selected state through aria-checked', () => {
    render(<OptionCard value="often" label="Often" selected />)
    expect(screen.getByRole('radio', { name: 'Often' })).toHaveAttribute('aria-checked', 'true')
  })

  it('accepts a forced visual state for QA without changing the semantics', () => {
    render(<OptionCard value="often" label="Often" data-state="hover" />)
    const option = screen.getByRole('radio', { name: 'Often' })
    expect(option).toHaveAttribute('data-state', 'hover')
    expect(option).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<OptionCard value="often" label="Often" onClick={onClick} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Often' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the optional icon slot before the label and hides it from assistive technology', () => {
    render(<OptionCard value="often" label="Often" icon={<i data-testid="icon" />} />)
    const icon = screen.getByTestId('icon')
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('radio', { name: 'Often' })).toContainElement(icon)
  })

  it('renders no icon wrapper when there is no icon', () => {
    const { container } = render(<OptionCard value="often" label="Often" />)
    expect(container.querySelector('[aria-hidden]')).toBeNull()
  })

  it('selects itself in the enclosing RadioGroup', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup aria-label="Frequency" value="rarely" onValueChange={onValueChange}>
        <OptionCard value="always" label="Always" />
        <OptionCard value="rarely" label="Rarely" />
      </RadioGroup>,
    )
    expect(screen.getByRole('radio', { name: 'Rarely' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Always' })).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(screen.getByRole('radio', { name: 'Always' }))
    expect(onValueChange).toHaveBeenCalledWith('always')
  })

  it('does not select when disabled', async () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup aria-label="Frequency" onValueChange={onValueChange}>
        <OptionCard value="always" label="Always" disabled />
      </RadioGroup>,
    )
    await userEvent.click(screen.getByRole('radio', { name: 'Always' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
