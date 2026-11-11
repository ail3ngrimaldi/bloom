/**
 * Format checks for the mock card fields of the plan sheet. A real provider hosts these fields and
 * validates them itself; here they only decide whether START MEMBERSHIP can be pressed. Nothing
 * typed in them is ever stored, logged or sent (PLAN-B 4.6, guardrail 7).
 */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/** Up to 16 digits in groups of four, separated by a space. */
export function formatCardNumber(value: string): string {
  return (
    digitsOnly(value)
      .slice(0, 16)
      .match(/.{1,4}/g) ?? []
  ).join(' ')
}

/** "MM / YY": the slash appears once the month is complete. */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4)
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)} / ${digits.slice(2)}`
}

export function isValidCardNumber(value: string): boolean {
  return digitsOnly(value).length === 16
}

/** A real month (01 to 12) that is not in the past. */
export function isValidExpiry(value: string, now: Date = new Date()): boolean {
  const digits = digitsOnly(value)
  if (digits.length !== 4) return false
  const month = Number(digits.slice(0, 2))
  const year = 2000 + Number(digits.slice(2))
  if (month < 1 || month > 12) return false
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

/** Three or four digits (four for some card brands). */
export function isValidCvv(value: string): boolean {
  const length = digitsOnly(value).length
  return length === 3 || length === 4
}
