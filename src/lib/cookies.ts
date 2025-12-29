/**
 * Cookie consent management utility
 * Handles storage and retrieval of cookie preferences
 */

export type CookieCategory = 'necessary' | 'analytical' | 'marketing'

export interface CookiePreferences {
  necessary: boolean // Always true, cannot be disabled
  analytical: boolean
  marketing: boolean
  timestamp: number // When preferences were saved
  version: string // Cookie policy version (for re-consent)
}

const COOKIE_PREFERENCES_KEY = 'pakketadvies-cookie-preferences'
const COOKIE_POLICY_VERSION = '1.0' // Update this when cookie policy changes

/**
 * Get stored cookie preferences
 */
export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY)
    if (!stored) return null

    const preferences = JSON.parse(stored) as CookiePreferences
    
    // Check if preferences are for current policy version
    if (preferences.version !== COOKIE_POLICY_VERSION) {
      return null // Need to re-consent
    }

    return preferences
  } catch (error) {
    console.error('[Cookie Preferences] Error reading preferences:', error)
    return null
  }
}

/**
 * Save cookie preferences
 */
export function saveCookiePreferences(preferences: Omit<CookiePreferences, 'timestamp' | 'version'>): void {
  if (typeof window === 'undefined') return

  try {
    const fullPreferences: CookiePreferences = {
      ...preferences,
      necessary: true, // Always true
      timestamp: Date.now(),
      version: COOKIE_POLICY_VERSION,
    }

    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(fullPreferences))
    
    // Dispatch event so other components can react to preference changes
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { 
      detail: fullPreferences 
    }))
  } catch (error) {
    console.error('[Cookie Preferences] Error saving preferences:', error)
  }
}

/**
 * Check if user has given consent (any category)
 */
export function hasCookieConsent(): boolean {
  const preferences = getCookiePreferences()
  return preferences !== null
}

/**
 * Check if specific category is allowed
 */
export function isCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences()
  if (!preferences) return false

  if (category === 'necessary') return true // Always allowed
  return preferences[category] === true
}

/**
 * Accept all cookies
 */
export function acceptAllCookies(): void {
  saveCookiePreferences({
    necessary: true,
    analytical: true,
    marketing: true,
  })
}

/**
 * Accept only necessary cookies
 */
export function acceptOnlyNecessary(): void {
  saveCookiePreferences({
    necessary: true,
    analytical: false,
    marketing: false,
  })
}

/**
 * Check if banner should be shown
 */
export function shouldShowCookieBanner(): boolean {
  return !hasCookieConsent()
}

