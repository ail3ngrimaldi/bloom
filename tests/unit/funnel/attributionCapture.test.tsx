import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AttributionCapture } from '@/funnel/AttributionCapture'
import { FunnelView } from '@/funnel/FunnelView'
import { useFunnelActions } from '@/funnel/useFunnelActions'
import type { LeadService } from '@/services/lead/types'
import { renderFunnel } from '../helpers/funnel'
import { resetNextNavigation } from '../helpers/nextNavigation'

vi.mock('next/navigation', async () =>
  (await import('../helpers/nextNavigation')).createNextNavigationMock(),
)

beforeEach(() => {
  resetNextNavigation()
})

const AD_URL =
  '/s/intro?utm_source=facebook&utm_medium=paid&utm_campaign=c1&placement=Instagram_Reels&slug=bloom-initial-pwyw&email=a%40b.co'

function SubmitLead() {
  const actions = useFunnelActions()
  return (
    <button type="button" onClick={() => void actions.submitLead()}>
      submit
    </button>
  )
}

describe('AttributionCapture (PLAN-B 6.6)', () => {
  it('keeps the UTM parameters, the placement and the slug of the landing URL, and nothing else', () => {
    const { store } = renderFunnel(<AttributionCapture />, { path: AD_URL })
    expect(store.getState().attribution).toEqual({
      utm_source: 'facebook',
      utm_medium: 'paid',
      utm_campaign: 'c1',
      placement: 'Instagram_Reels',
      slug: 'bloom-initial-pwyw',
    })
    expect(JSON.stringify(store.getState())).not.toContain('a@b.co')
  })

  it('stores nothing for a visit that did not come from an ad', () => {
    const { store } = renderFunnel(<AttributionCapture />, { path: '/s/intro' })
    expect(store.getState().attribution).toEqual({})
  })

  it('is first touch: a visit that already has an attribution keeps it', () => {
    const { store } = renderFunnel(<AttributionCapture />, {
      path: '/s/intro?utm_source=google&utm_term=t',
      state: { attribution: { utm_source: 'facebook' } },
    })
    expect(store.getState().attribution).toEqual({ utm_source: 'facebook', utm_term: 't' })
  })

  it('reaches the events from the very first one, and the lead service', async () => {
    const leads: LeadService = { submit: vi.fn(async () => {}) }
    const { events } = renderFunnel(
      <>
        <AttributionCapture />
        <FunnelView />
        <SubmitLead />
      </>,
      { path: AD_URL, leads },
    )
    const attribution = {
      utm_source: 'facebook',
      utm_medium: 'paid',
      utm_campaign: 'c1',
      placement: 'Instagram_Reels',
      slug: 'bloom-initial-pwyw',
    }
    expect(events[0]).toEqual({ name: 'funnel_start', attribution })
    expect(events[1]).toMatchObject({ name: 'step_view', id: 'intro', attribution })

    fireEvent.click(screen.getByRole('button', { name: 'submit' }))
    await vi.waitFor(() => expect(leads.submit).toHaveBeenCalledTimes(1))
    expect(vi.mocked(leads.submit).mock.calls[0][0].attribution).toEqual(attribution)
    expect(events.at(-1)).toEqual({ name: 'lead_submit', attribution })
  })

  it('leaves events and the lead without an attribution field when there is none', async () => {
    const leads: LeadService = { submit: vi.fn(async () => {}) }
    const { events } = renderFunnel(
      <>
        <AttributionCapture />
        <FunnelView />
        <SubmitLead />
      </>,
      { path: '/s/intro', leads },
    )
    expect(events[0]).toEqual({ name: 'funnel_start' })
    fireEvent.click(screen.getByRole('button', { name: 'submit' }))
    await vi.waitFor(() => expect(leads.submit).toHaveBeenCalledTimes(1))
    expect(vi.mocked(leads.submit).mock.calls[0][0]).not.toHaveProperty('attribution')
  })
})
