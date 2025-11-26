/**
 * Validates phone numbers including international formats
 * Supports:
 * - Dutch numbers: 0612345678, 06-12345678, +31612345678, 0031612345678
 * - International: +31 6 12345678, +1 555 1234567, etc.
 */
export function validatePhoneNumber(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Vul een telefoonnummer in' }
  }

  // Remove all spaces, dashes, parentheses for validation
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Check if it contains only digits and + at the start
  if (!/^\+?[\d]+$/.test(cleaned)) {
    return { valid: false, error: 'Telefoonnummer mag alleen cijfers en een + bevatten' }
  }

  // Dutch mobile numbers (06...)
  if (/^0?6\d{8}$/.test(cleaned)) {
    return { valid: true }
  }

  // Dutch landline (010, 020, etc.)
  if (/^0\d{8,9}$/.test(cleaned)) {
    return { valid: true }
  }

  // International format (+31, +1, etc.)
  if (/^\+\d{1,3}\d{4,14}$/.test(cleaned)) {
    return { valid: true }
  }

  // International with 00 prefix (0031, 001, etc.)
  if (/^00\d{1,3}\d{4,14}$/.test(cleaned)) {
    return { valid: true }
  }

  // Minimum length check (at least 10 digits for most formats)
  const digitsOnly = cleaned.replace(/^\+/, '').replace(/^00/, '')
  if (digitsOnly.length < 10) {
    return { valid: false, error: 'Telefoonnummer is te kort (minimaal 10 cijfers)' }
  }

  // If it's long enough and contains only valid characters, accept it
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return { valid: true }
  }

  return { valid: false, error: 'Vul een geldig telefoonnummer in' }
}

