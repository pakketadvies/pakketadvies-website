export type Audience = 'business' | 'consumer'

export const AUDIENCE_COOKIE = 'pa_audience'

// Keep this list in sync with the site's routing structure.
// Rule: if the user is on a consumer experience route, the UI should reflect "Particulier".
const CONSUMER_PREFIXES = [
  '/particulier',
  // Consumer landing pages used by email/newsletter campaigns
  '/aanbieding/particulier',
  '/aanbieding/dynamisch',
]

export function isConsumerPath(pathname?: string | null): boolean {
  if (!pathname) return false
  return CONSUMER_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function getAudienceFromPath(pathname?: string | null): Audience {
  return isConsumerPath(pathname) ? 'consumer' : 'business'
}


