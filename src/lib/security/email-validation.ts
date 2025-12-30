/**
 * Email validatie en spam detection
 */

/**
 * Lijst van bekende temporary/disposable email providers
 * Deze worden gebruikt voor spam detection
 */
const TEMP_EMAIL_DOMAINS = [
  // Nederlandse temp mail services
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'getnada.com',
  'mohmal.com',
  'yopmail.com',
  'maildrop.cc',
  'trashmail.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dispostable.com',
  'emailondeck.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'meltmail.com',
  'mintemail.com',
  'mytrashmail.com',
  'tempail.com',
  'tempinbox.com',
  'tempmailaddress.com',
  'throwawaymail.com',
  'tmpmail.org',
  'yopmail.fr',
  'zippymail.info',
  // Algemene patterns
  'tempmail',
  'throwaway',
  'fake',
  'spam',
  'trash',
  'disposable',
  'temporary'
]

/**
 * Check of email domain een temporary/disposable email is
 */
export function isTempEmail(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return false
  }
  
  // Check exact match
  if (TEMP_EMAIL_DOMAINS.some(d => domain === d)) {
    return true
  }
  
  // Check substring match (voor variaties zoals tempmail123.com)
  if (TEMP_EMAIL_DOMAINS.some(d => domain.includes(d))) {
    return true
  }
  
  return false
}

/**
 * Valideer email format en check tegen blacklist
 */
export function validateEmail(email: string): {
  valid: boolean
  error?: string
} {
  if (!email) {
    return { valid: false, error: 'E-mailadres is verplicht' }
  }
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ongeldig e-mailadres formaat' }
  }
  
  // Check temp email
  if (isTempEmail(email)) {
    return { valid: false, error: 'Tijdelijke e-mailadressen zijn niet toegestaan' }
  }
  
  return { valid: true }
}

