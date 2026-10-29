import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { OptionCard } from '../OptionCard'
import { RadioGroup } from './RadioGroup'

const OPTIONS = ['Always', 'Often', 'Sometimes', 'Rarely']

function Group({ initial = null, disabled }: { initial?: string | null; disabled?: string }) {
  const [value, setValue] = useState<string | null>(initial)
  return (
    <>
      <button type="button">before</button>
      <RadioGroup aria-label="Frequency" value={value} onValueChange={setValue}>
        {OPTIONS.map((option) => (
          <OptionCard key={option} value={option} label={option} disabled={option === disabled} />
        ))}
      </RadioGroup>
      <button type="button">after</button>
    </>
  )
}

const radio = (name: string) => screen.getByRole('radio', { name })

describe('RadioGroup', () => {
  it('exposes a radiogroup of radios', () => {
    render(<Group />)
    expect(screen.getByRole('radiogroup', { name: 'Frequency' })).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('has a single tab stop: the first option when nothing is selected', () => {
    render(<Group />)
    expect(screen.getAllByRole('radio').map((el) => el.tabIndex)).toEqual([0, -1, -1, -1])
  })

  it('puts the tab stop on the selected option', () => {
    render(<Group initial="Sometimes" />)
    expect(screen.getAllByRole('radio').map((el) => el.tabIndex)).toEqual([-1, -1, 0, -1])
  })

  it('tabs into the group once and out of it on the next Tab', async () => {
    const user = userEvent.setup()
    render(<Group initial="Often" />)
    await user.tab()
    expect(screen.getByText('before')).toHaveFocus()
    await user.tab()
    expect(radio('Often')).toHaveFocus()
    await user.tab()
    expect(screen.getByText('after')).toHaveFocus()
  })

  it('moves focus with the arrow keys, wrapping at both ends, without selecting', async () => {
    const user = userEvent.setup()
    render(<Group />)
    radio('Always').focus()

    await user.keyboard('{ArrowDown}')
    expect(radio('Often')).toHaveFocus()
    await user.keyboard('{ArrowRight}')
    expect(radio('Sometimes')).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(radio('Often')).toHaveFocus()
    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(radio('Rarely')).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(radio('Always')).toHaveFocus()

    for (const el of screen.getAllByRole('radio'))
      expect(el).toHaveAttribute('aria-checked', 'false')
  })

  it('jumps to the first and last option with Home and End', async () => {
    const user = userEvent.setup()
    render(<Group />)
    radio('Often').focus()
    await user.keyboard('{End}')
    expect(radio('Rarely')).toHaveFocus()
    await user.keyboard('{Home}')
    expect(radio('Always')).toHaveFocus()
  })

  it('moves the roving tab stop with focus', async () => {
    const user = userEvent.setup()
    render(<Group />)
    radio('Always').focus()
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(screen.getAllByRole('radio').map((el) => el.tabIndex)).toEqual([-1, -1, 0, -1])
  })

  it('skips disabled options', async () => {
    const user = userEvent.setup()
    render(<Group disabled="Often" />)
    radio('Always').focus()
    await user.keyboard('{ArrowDown}')
    expect(radio('Sometimes')).toHaveFocus()
  })

  it.each([['{Enter}'], [' ']])('selects the focused option with %j', async (key) => {
    const user = userEvent.setup()
    render(<Group />)
    radio('Always').focus()
    await user.keyboard('{ArrowDown}{ArrowDown}')
    await user.keyboard(key)
    expect(radio('Sometimes')).toHaveAttribute('aria-checked', 'true')
    expect(radio('Always')).toHaveAttribute('aria-checked', 'false')
  })

  it('selects a single option at a time with the mouse', async () => {
    const user = userEvent.setup()
    render(<Group />)
    await user.click(radio('Often'))
    await user.click(radio('Rarely'))
    const checked = screen
      .getAllByRole('radio')
      .filter((el) => el.getAttribute('aria-checked') === 'true')
    expect(checked.map((el) => el.textContent)).toEqual(['Rarely'])
  })
})
