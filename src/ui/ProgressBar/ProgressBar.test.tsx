import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { clampProgress } from './clampProgress'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('is a progressbar with min, max and now', () => {
    render(<ProgressBar value={0.2} />)
    const bar = screen.getByRole('progressbar', { name: 'Progress' })
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
    expect(bar).toHaveAttribute('aria-valuenow', '20')
  })

  it.each([
    [0, '0', '0%'],
    [0.5, '50', '50%'],
    [0.95, '95', '95%'],
    [1, '100', '100%'],
  ])('maps %s to aria-valuenow %s and a %s fill', (value, now, width) => {
    const { container } = render(<ProgressBar value={value} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', now)
    expect((container.querySelector('[role="progressbar"] > div') as HTMLElement).style.width).toBe(
      width,
    )
  })

  it('clamps out-of-range and non-finite values', () => {
    expect(clampProgress(-1)).toBe(0)
    expect(clampProgress(2)).toBe(1)
    expect(clampProgress(Number.NaN)).toBe(0)
    expect(clampProgress(0.3)).toBe(0.3)
    render(<ProgressBar value={3} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('takes a custom accessible name', () => {
    render(<ProgressBar value={0.1} label="Quiz progress" />)
    expect(screen.getByRole('progressbar', { name: 'Quiz progress' })).toBeInTheDocument()
  })
})
