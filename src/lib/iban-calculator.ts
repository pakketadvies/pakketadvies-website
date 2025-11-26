/**
 * IBAN Calculator and Validator
 * Supports Dutch IBAN format: NL + 2 check digits + 4 letters (bank code) + 10 digits (account number)
 */

// Dutch bank codes mapping
const DUTCH_BANK_CODES: { [key: string]: string } = {
  'ABNA': 'ABN AMRO',
  'FTSB': 'ABN AMRO (ex Fortis)',
  'INGB': 'ING Bank',
  'RABO': 'Rabobank',
  'SNSB': 'SNS Bank',
  'ASNB': 'ASN Bank',
  'TRBK': 'Triodos Bank',
  'BUNQ': 'Bunq',
  'KNAB': 'Knab',
  'RBRB': 'RegioBank',
  'DEUT': 'Deutsche Bank',
  'BOTK': 'Bank of Tokyo-Mitsubishi',
  'CHAS': 'JPMorgan Chase',
  'CITC': 'Citibank',
  'COBA': 'Commerzbank',
  'DEUT': 'Deutsche Bank',
  'HSBC': 'HSBC Bank',
  'NWAB': 'Nederlandse Waterschapsbank',
  'NWBK': 'NWB Bank',
  'PSTB': 'Postbank',
  'RABO': 'Rabobank',
  'REVO': 'Revolut',
  'TRIO': 'Triodos Bank',
  'UGBI': 'Van Lanschot',
  'VOWA': 'Volkswagen Bank',
}

/**
 * Validates IBAN format and checksum
 */
export function validateIBAN(iban: string): { valid: boolean; error?: string } {
  // Remove spaces and convert to uppercase
  const cleaned = iban.replace(/\s/g, '').toUpperCase()

  // Check basic format
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, error: 'Ongeldig IBAN formaat' }
  }

  // Check length (Dutch IBAN should be 18 characters)
  if (cleaned.length !== 18) {
    return { valid: false, error: 'IBAN moet 18 tekens lang zijn' }
  }

  // Check if it's a Dutch IBAN
  if (!cleaned.startsWith('NL')) {
    return { valid: false, error: 'Alleen Nederlandse IBAN wordt ondersteund' }
  }

  // Validate checksum using mod-97 algorithm
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString())
  
  let remainder = ''
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder + numeric[i]).replace(/^0+/, '')
    if (remainder.length >= 9) {
      remainder = (parseInt(remainder.slice(0, 9)) % 97).toString() + remainder.slice(9)
    }
  }
  const mod97 = parseInt(remainder) % 97

  if (mod97 !== 1) {
    return { valid: false, error: 'IBAN checksum is ongeldig' }
  }

  return { valid: true }
}

/**
 * Calculates IBAN from Dutch bank account number
 */
export function calculateIBAN(bankCode: string, accountNumber: string): { iban: string; error?: string } {
  // Clean inputs
  const cleanedBankCode = bankCode.replace(/\s/g, '').toUpperCase()
  const cleanedAccount = accountNumber.replace(/\s/g, '')

  // Validate bank code (4 letters)
  if (!/^[A-Z]{4}$/.test(cleanedBankCode)) {
    return { iban: '', error: 'Bankcode moet 4 letters zijn (bijv. INGB, RABO)' }
  }

  // Validate account number (10 digits)
  if (!/^\d{10}$/.test(cleanedAccount)) {
    return { iban: '', error: 'Rekeningnummer moet 10 cijfers zijn' }
  }

  // Create base IBAN (without check digits)
  const base = 'NL00' + cleanedBankCode + cleanedAccount.padStart(10, '0')

  // Calculate check digits using mod-97 algorithm
  const rearranged = base.slice(4) + base.slice(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString())
  
  let remainder = ''
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder + numeric[i]).replace(/^0+/, '')
    if (remainder.length >= 9) {
      remainder = (parseInt(remainder.slice(0, 9)) % 97).toString() + remainder.slice(9)
    }
  }
  const mod97 = parseInt(remainder) % 97
  const checkDigits = String(98 - mod97).padStart(2, '0')

  const iban = 'NL' + checkDigits + cleanedBankCode + cleanedAccount.padStart(10, '0')

  return { iban }
}

/**
 * Formats IBAN with spaces (every 4 characters)
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
}

/**
 * Gets bank name from IBAN
 */
export function getBankNameFromIBAN(iban: string): string | undefined {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  if (cleaned.length < 8) return undefined
  
  const bankCode = cleaned.slice(4, 8)
  return DUTCH_BANK_CODES[bankCode] || undefined
}

/**
 * Gets list of common Dutch bank codes
 */
export function getCommonBankCodes(): Array<{ code: string; name: string }> {
  return Object.entries(DUTCH_BANK_CODES)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

