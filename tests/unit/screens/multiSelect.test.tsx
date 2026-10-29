import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStep } from '@/funnel/steps'
import { MultiSelectScreen } from '@/screens/multi'
import type { ScreenStep } from '@/screens/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

const sacrifice = getStep('sacrifice') as ScreenStep<'multi'>

beforeEach(() => {
  resetNextNavigation()
})

describe('MultiSelectScreen', () => {
  it('has no header, a "Choose all that apply" subtitle and one checkbox per option', () => {
    renderFunnel(<MultiSelectScreen step={sacrifice} onNext={() => {}} />)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getByText('Choose all that apply')).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /Which of these do you tend to sacrifice for others\?/ }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(5)
  })

  it('keeps Continue disabled until something is chosen', () => {
    renderFunnel(<MultiSelectScreen step={sacrifice} onNext={() => {}} />)
    const cta = screen.getByRole('button', { name: 'Continue' })
    expect(cta).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    expect(cta).toBeEnabled()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    expect(cta).toBeDisabled()
  })

  it('toggles rows in pick order and submits the answer once on Continue', () => {
    const onNext = vi.fn()
    const { store, events } = renderFunnel(<MultiSelectScreen step={sacrifice} onNext={onNext} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Your own goals' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Sleep' }))
    expect(screen.getByRole('checkbox', { name: 'Sleep' })).toHaveAttribute('aria-checked', 'true')
    expect(store.getState().answers.sacrifice).toEqual(['own_goals', 'sleep'])
    expect(events).toEqual([])

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(events).toEqual([{ name: 'answer', id: 'sacrifice', value: ['own_goals', 'sleep'] }])
  })

  it('restores the previous selection', () => {
    renderFunnel(<MultiSelectScreen step={sacrifice} onNext={() => {}} />, {
      state: { answers: { sacrifice: ['nutrition'] }, furthest: 21 },
    })
    expect(screen.getByRole('checkbox', { name: 'Nutrition' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })
})
