import { NextResponse } from 'next/server'

/**
 * iDIN start endpoint.
 *
 * NOTE: Real iDIN implementations require a contracted provider (e.g. Signicat/CM.com)
 * and credentials. Until configured, we return a friendly message.
 *
 * Once configured, this route should:
 * - create a state + PKCE verifier
 * - redirect to provider authorize URL
 */
export async function GET() {
  const enabled = process.env.IDIN_ENABLED === 'true'
  const provider = process.env.IDIN_PROVIDER
  const clientId = process.env.IDIN_CLIENT_ID
  const clientSecret = process.env.IDIN_CLIENT_SECRET
  const redirectUri = process.env.IDIN_REDIRECT_URI

  // If not configured, redirect back to the wizard with a friendly message (no raw JSON).
  if (!enabled || !provider || !clientId || !clientSecret || !redirectUri) {
    const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
    url.searchParams.set('step', '2')
    url.searchParams.set('method', 'netbeheerder')
    url.searchParams.set('idin', 'not-configured')
    return NextResponse.redirect(url)
  }

  // Provider-specific integration goes here (PKCE + state + authorize redirect).
  // We keep this as an explicit TODO until credentials/provider details are set up.
  const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
  url.searchParams.set('step', '2')
  url.searchParams.set('method', 'netbeheerder')
  url.searchParams.set('idin', 'not-implemented')
  return NextResponse.redirect(url)
}


