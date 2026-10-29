import type { ClaimRef } from './types'

export interface Claim {
  /** True only once Bloom holds verifiable evidence for it (PLAN 2, guardrails 2 and 3). */
  readonly evidence: boolean
  /** The figure or name the copy shows, e.g. the number of users. Unset while unproven. */
  readonly value?: string
  /** Where the evidence lives, for whoever turns the claim on. */
  readonly source?: string
}

/**
 * Claims, credentials and testimonials (decision D3). All are off: the reference's figures, press
 * logos, universities, expert reviewer and testimonials are not Bloom's and are never rendered.
 * Screens show their claim blocks only when every claim they reference has evidence; otherwise
 * they use the claim-free copy (keys without the 'Claim' suffix in copy.en.json).
 */
export const CLAIMS: Readonly<Record<ClaimRef, Claim>> = {
  users: { evidence: false },
  press: { evidence: false },
  universities: { evidence: false },
  expert: { evidence: false },
  testimonials: { evidence: false },
}

export function hasEvidence(ref: ClaimRef): boolean {
  return CLAIMS[ref].evidence
}

/** True when every listed claim has evidence (and there is at least one). */
export function claimsProven(refs: readonly ClaimRef[]): boolean {
  return refs.length > 0 && refs.every(hasEvidence)
}
