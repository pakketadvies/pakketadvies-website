/**
 * Spam detection utilities
 */

/**
 * Check of een honeypot field is ingevuld (spam indicator)
 */
export function checkHoneypot(website?: string): boolean {
  // Als website field is ingevuld, is het waarschijnlijk spam
  return !!(website && website.trim().length > 0)
}

/**
 * Check of form submission te snel is (spam indicator)
 * Legitieme gebruikers hebben tijd nodig om formulier in te vullen
 */
export function checkSubmissionSpeed(submitTime: number, formLoadTime?: number): boolean {
  if (!formLoadTime) {
    return false // Kan niet checken zonder load time
  }
  
  const timeSpent = submitTime - formLoadTime
  const minTimeMs = 3000 // Minimaal 3 seconden
  
  // Als formulier in minder dan 3 seconden is ingevuld, waarschijnlijk spam
  return timeSpent < minTimeMs
}

/**
 * Check of telefoonnummer verdacht is (alleen cijfers, te kort, etc.)
 */
export function isSuspiciousPhoneNumber(phone: string): boolean {
  if (!phone) {
    return false
  }
  
  // Alleen cijfers (geen legitieme formaten)
  if (/^\d+$/.test(phone) && phone.length < 8) {
    return true
  }
  
  // Herhalende cijfers (bijv. 11111111, 12345678)
  if (/^(\d)\1{7,}$/.test(phone.replace(/\D/g, ''))) {
    return true
  }
  
  // Opeenvolgende cijfers
  if (/^12345678|87654321/.test(phone.replace(/\D/g, ''))) {
    return true
  }
  
  return false
}

/**
 * Check of naam verdacht is (te kort, alleen cijfers, etc.)
 */
export function isSuspiciousName(name: string): boolean {
  if (!name || name.length < 2) {
    return false // Te kort wordt al door schema validatie afgevangen
  }
  
  // Alleen cijfers
  if (/^\d+$/.test(name)) {
    return true
  }
  
  // Te veel speciale tekens
  const specialCharCount = (name.match(/[^a-zA-Z0-9\s]/g) || []).length
  if (specialCharCount > name.length * 0.3) {
    return true
  }
  
  return false
}

/**
 * Algemene spam check functie
 */
export interface SpamCheckResult {
  isSpam: boolean
  reasons: string[]
}

export function performSpamCheck(data: {
  website?: string
  email?: string
  telefoon?: string
  voornaam?: string
  achternaam?: string
  submitTime?: number
  formLoadTime?: number
}): SpamCheckResult {
  const reasons: string[] = []
  
  // Honeypot check
  if (checkHoneypot(data.website)) {
    reasons.push('Honeypot field ingevuld')
  }
  
  // Email check
  if (data.email && isTempEmail(data.email)) {
    reasons.push('Tijdelijk e-mailadres gebruikt')
  }
  
  // Telefoonnummer check
  if (data.telefoon && isSuspiciousPhoneNumber(data.telefoon)) {
    reasons.push('Verdacht telefoonnummer')
  }
  
  // Naam checks
  if (data.voornaam && isSuspiciousName(data.voornaam)) {
    reasons.push('Verdachte voornaam')
  }
  if (data.achternaam && isSuspiciousName(data.achternaam)) {
    reasons.push('Verdachte achternaam')
  }
  
  // Submission speed check
  if (data.submitTime && data.formLoadTime && checkSubmissionSpeed(data.submitTime, data.formLoadTime)) {
    reasons.push('Formulier te snel ingevuld')
  }
  
  return {
    isSpam: reasons.length > 0,
    reasons
  }
}

/**
 * Check of email domain een temporary/disposable email is
 */
function isTempEmail(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false
  }
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) {
    return false
  }
  
  const tempDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'getnada.com', 'mohmal.com', 'yopmail.com', 'maildrop.cc',
    'trashmail.com', 'sharklasers.com', 'grr.la'
  ]
  
  return tempDomains.some(d => domain === d || domain.includes(d))
}

