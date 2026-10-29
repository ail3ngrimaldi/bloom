export { mockLeadService, MOCK_LEAD_DELAY_MS } from './mock'
export { buildLeadSubmission, SENSITIVE_ANSWER_KEYS } from './submission'
export type { Lead, LeadService, LeadSubmission } from './types'
export {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  isValidEmail,
  isValidName,
  normalizeName,
} from './validate'
