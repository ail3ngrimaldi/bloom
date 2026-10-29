import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CheckboxGroup } from './CheckboxGroup'
import { CheckboxRow } from './CheckboxRow'

function Row({ label = 'Nutrition', initial = false }: { label?: string; initial?: boolean }) {
  const [checked, setChecked] = useState(initial)
  return <CheckboxRow label={label} checked={checked} onCheckedChange={setChecked} />
}

describe('CheckboxRow', () => {
  it('is a checkbox named by its label that reflects `checked`', () => {
    const { rerender } = render(<CheckboxRow label="Sleep" checked={false} />)
    expect(screen.getByRole('checkbox', { name: 'Sleep' })).toHaveAttribute('aria-checked', 'false')
    rerender(<CheckboxRow label="Sleep" checked />)
    expect(screen.getByRole('checkbox', { name: 'Sleep' })).toHaveAttribute('aria-checked', 'true')
  })

  it('toggles with the mouse', async () => {
    const user = userEvent.setup()
    render(<Row />)
    const row = screen.getByRole('checkbox', { name: 'Nutrition' })
    await user.click(row)
    expect(row).toHaveAttribute('aria-checked', 'true')
    await user.click(row)
    expect(row).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles with Space', async () => {
    const user = userEvent.setup()
    render(<Row />)
    const row = screen.getByRole('checkbox', { name: 'Nutrition' })
    await user.tab()
    expect(row).toHaveFocus()
    await user.keyboard(' ')
    expect(row).toHaveAttribute('aria-checked', 'true')
    await user.keyboard(' ')
    expect(row).toHaveAttribute('aria-checked', 'false')
  })

  it('leaves Enter alone so it can still advance the question', async () => {
    const user = userEvent.setup()
    const onCheckedChange = vi.fn()
    render(<CheckboxRow label="Sleep" checked={false} onCheckedChange={onCheckedChange} />)
    await user.tab()
    await user.keyboard('{Enter}')
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('reports the next value to onCheckedChange', async () => {
    const onCheckedChange = vi.fn()
    render(<CheckboxRow label="Sleep" checked={false} onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('keeps two-line labels in one accessible name', () => {
    render(<Row label="Going a week without procrastinating" />)
    expect(
      screen.getByRole('checkbox', { name: 'Going a week without procrastinating' }),
    ).toBeInTheDocument()
  })

  it('does not toggle when disabled', async () => {
    const onCheckedChange = vi.fn()
    render(<CheckboxRow label="Sleep" checked={false} disabled onCheckedChange={onCheckedChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('allows several rows to be checked at once inside a group', async () => {
    const user = userEvent.setup()
    render(
      <CheckboxGroup aria-label="Sacrifices">
        <Row label="Sleep" />
        <Row label="Nutrition" />
        <Row label="Alone time" />
      </CheckboxGroup>,
    )
    await user.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    await user.click(screen.getByRole('checkbox', { name: 'Alone time' }))
    const checked = screen
      .getAllByRole('checkbox')
      .filter((el) => el.getAttribute('aria-checked') === 'true')
    expect(checked.map((el) => el.textContent)).toEqual(['Sleep', 'Alone time'])
    expect(screen.getByRole('group', { name: 'Sacrifices' })).toBeInTheDocument()
  })
})
