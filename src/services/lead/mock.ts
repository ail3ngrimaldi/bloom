import type { LeadService } from './types'

/** How long the mock pretends the request takes, so "Please wait..." is seen. */
export const MOCK_LEAD_DELAY_MS = 600

/**
 * Default lead service (decision D4/D8): sends nothing and stores nothing. A real adapter
 * (POST /api/leads, PLAN 6.6) replaces it in phase 8, once there is a privacy policy and consent.
 */
export const mockLeadService: LeadService = {
  submit: () => new Promise((resolve) => setTimeout(resolve, MOCK_LEAD_DELAY_MS)),
}
