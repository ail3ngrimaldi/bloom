/** Longest name accepted on #39 (PLAN 5.9: 1 to 40 characters). */
export const NAME_MAX_LENGTH = 40
export const EMAIL_MAX_LENGTH = 254

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/

export function isValidEmail(value: string): boolean {
  const email = value.trim()
  return email.length <= EMAIL_MAX_LENGTH && EMAIL.test(email)
}

/** Trims and collapses inner whitespace. */
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function isValidName(value: string): boolean {
  const name = normalizeName(value)
  return name.length >= 1 && name.length <= NAME_MAX_LENGTH
}
