import type { Answers } from '@/funnel/types'
import type { WellbeingProfile } from '@/profile/types'

/** What the email and name capture steps collect. */
export interface Lead {
  email: string
  name: string
}

/** What is handed to the lead service after the name step (PLAN 6.6). */
export interface LeadSubmission {
  lead: Lead
  /** The answers, minus health data, which never leaves the browser (copy of #12). */
  answers: Answers
  profile: WellbeingProfile
}

export interface LeadService {
  submit(submission: LeadSubmission): Promise<void>
}
