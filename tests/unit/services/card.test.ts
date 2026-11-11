import { describe, expect, it } from 'vitest'
import {
  digitsOnly,
  formatCardNumber,
  formatExpiry,
  isValidCardNumber,
  isValidCvv,
  isValidExpiry,
} from '@/services/checkout/card'

// Numbers are built here, not written: no card-shaped literal belongs in the repository
// (guardrail 7). They are not real cards; only their shape is checked.
const sixteen = '1234'.repeat(4)

describe('card format checks of the mock card fields', () => {
  it('keeps digits only', () => {
    expect(digitsOnly('12 / 3a-4')).toBe('1234')
  })

  it('groups the number in fours and caps it at 16 digits', () => {
    expect(formatCardNumber(sixteen)).toBe(['1234', '1234', '1234', '1234'].join(' '))
    expect(formatCardNumber('12345')).toBe('1234 5')
    expect(formatCardNumber(sixteen + '99')).toBe(formatCardNumber(sixteen))
    expect(formatCardNumber('')).toBe('')
  })

  it('wants exactly 16 digits (the field says "16 digits")', () => {
    expect(isValidCardNumber(sixteen)).toBe(true)
    expect(isValidCardNumber(formatCardNumber(sixteen))).toBe(true)
    expect(isValidCardNumber(sixteen.slice(1))).toBe(false)
    expect(isValidCardNumber('')).toBe(false)
  })

  it('formats MM / YY with the slash once the month is complete', () => {
    expect(formatExpiry('1')).toBe('1')
    expect(formatExpiry('12')).toBe('12')
    expect(formatExpiry('123')).toBe('12 / 3')
    expect(formatExpiry('1230')).toBe('12 / 30')
    expect(formatExpiry('123099')).toBe('12 / 30')
  })

  it('accepts a real month that is not in the past', () => {
    const now = new Date(2026, 9, 31)
    expect(isValidExpiry('10 / 26', now)).toBe(true)
    expect(isValidExpiry('11 / 26', now)).toBe(true)
    expect(isValidExpiry('01 / 27', now)).toBe(true)
    expect(isValidExpiry('09 / 26', now)).toBe(false)
    expect(isValidExpiry('12 / 25', now)).toBe(false)
    expect(isValidExpiry('13 / 28', now)).toBe(false)
    expect(isValidExpiry('00 / 28', now)).toBe(false)
    expect(isValidExpiry('1 / 28', now)).toBe(false)
  })

  it('accepts a security code of three or four digits', () => {
    expect(isValidCvv('123')).toBe(true)
    expect(isValidCvv('1234')).toBe(true)
    expect(isValidCvv('12')).toBe(false)
    expect(isValidCvv('12345')).toBe(false)
    expect(isValidCvv('')).toBe(false)
  })
})
