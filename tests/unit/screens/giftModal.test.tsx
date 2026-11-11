import { fireEvent, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GiftModal } from '@/screens/plan/GiftModal'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

beforeEach(() => {
  resetNextNavigation()
})

const dialog = () => screen.getByRole('dialog')

describe('GiftModal (PLAN-B 4.3, D11)', () => {
  it('is closed until it is asked to open', () => {
    renderFunnel(
      <GiftModal open={false} gift={{ count: 3, outcomes: [70, 70, 70] }} onApply={vi.fn()} />,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('offers a single gift when count is 1, and applies what it reveals', () => {
    const onApply = vi.fn()
    renderFunnel(<GiftModal open gift={{ count: 1, outcomes: [50] }} onApply={onApply} />)
    expect(within(dialog()).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Gift 1 of 1' }))
    expect(dialog()).toHaveAccessibleName('50% off is yours.')
    expect(screen.getByText('50%')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Apply my discount' }))
    expect(onApply).toHaveBeenCalledExactlyOnceWith(50)
  })

  it('reveals what the picked gift holds when the gifts differ', () => {
    const onApply = vi.fn()
    renderFunnel(<GiftModal open gift={{ count: 3, outcomes: [10, 20, 30] }} onApply={onApply} />)
    fireEvent.click(screen.getByRole('button', { name: 'Gift 3 of 3' }))
    expect(dialog()).toHaveAccessibleName('30% off is yours.')
    fireEvent.click(screen.getByRole('button', { name: 'Apply my discount' }))
    expect(onApply).toHaveBeenCalledExactlyOnceWith(30)
  })

  it('does not let a second gift be picked once one is open, and falls back to the first outcome', () => {
    const onApply = vi.fn()
    const { events } = renderFunnel(
      <GiftModal open gift={{ count: 3, outcomes: [40] }} onApply={onApply} />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Gift 2 of 3' }))
    expect(screen.getByRole('button', { name: 'Gift 1 of 3' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Gift 3 of 3' })).toBeDisabled()
    expect(dialog()).toHaveAccessibleName('40% off is yours.')
    expect(events.filter((event) => event.name === 'gift_pick')).toEqual([
      { name: 'gift_pick', index: 1 },
    ])
  })
})
