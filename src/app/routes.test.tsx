import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './routes'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

describe('routes', () => {
  it('serves the placeholder landing at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Bloom' })).toBeInTheDocument()
  })

  describe('gallery (dev only)', () => {
    it('is registered in dev builds', async () => {
      expect(import.meta.env.DEV).toBe(true)
      renderAt('/__gallery')
      expect(await screen.findByRole('heading', { name: 'Bloom UI gallery' })).toBeInTheDocument()
      for (const name of [
        'Themes',
        'Header',
        'Button',
        'OptionCard',
        'CheckboxRow',
        'Modal',
        'StepTransition',
      ]) {
        expect(screen.getByRole('heading', { name })).toBeInTheDocument()
      }
    })

    it('shows every button variant', async () => {
      renderAt('/__gallery')
      await screen.findByRole('heading', { name: 'Bloom UI gallery' })
      expect(screen.getAllByRole('button', { name: 'Continue' }).length).toBeGreaterThanOrEqual(5)
      expect(screen.getByRole('button', { name: 'Please wait...' })).toHaveAttribute(
        'aria-busy',
        'true',
      )
      expect(
        screen
          .getAllByRole('button', { name: 'Continue' })
          .some((b) => (b as HTMLButtonElement).disabled),
      ).toBe(true)
    })

    it('shows header progress at 0, 20, 50 and 95 percent', async () => {
      renderAt('/__gallery')
      await screen.findByRole('heading', { name: 'Bloom UI gallery' })
      const values = screen
        .getAllByRole('progressbar')
        .map((bar) => bar.getAttribute('aria-valuenow'))
      expect(values).toEqual(['0', '20', '50', '95'])
    })

    it('reproduces the single-select layout of reference image 03', async () => {
      renderAt('/__gallery/quiz-single')
      const title = await screen.findByRole('heading', { level: 1 })
      expect(title).toHaveTextContent('How often do you feel mentally or physically drained?')
      const group = screen.getByRole('radiogroup')
      expect(
        within(group)
          .getAllByRole('radio')
          .map((o) => o.textContent),
      ).toEqual(['Always', 'Often', 'Sometimes', 'Rarely'])
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3')
    })

    it('reproduces the multi-select layout of reference image 06 with two rows selected', async () => {
      renderAt('/__gallery/quiz-multi')
      const title = await screen.findByRole('heading', { level: 1 })
      expect(title).toHaveTextContent('Which of these do you tend to sacrifice for others?')
      expect(screen.getByText('Choose all that apply')).toBeInTheDocument()
      const rows = screen.getAllByRole('checkbox')
      expect(rows.map((r) => r.textContent)).toEqual([
        'Sleep',
        'Nutrition',
        'Alone time',
        'Your own goals',
        'Emotional space',
      ])
      expect(rows.filter((r) => r.getAttribute('aria-checked') === 'true')).toHaveLength(2)
      expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })
  })
})
