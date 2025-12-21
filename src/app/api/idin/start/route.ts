import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createNonce, createPkcePair, createState, fetchOidcDiscovery, signPayload } from '@/lib/idin/signicatOidc'

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
  const scopes = (process.env.IDIN_SCOPES || 'openid profile email').trim()

  // If not configured, redirect back to the wizard with a friendly message (no raw JSON).
  if (!enabled || !provider || !clientId || !clientSecret || !redirectUri) {
    const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
    url.searchParams.set('step', '2')
    url.searchParams.set('method', 'netbeheerder')
    url.searchParams.set('idin', 'not-configured')
    return NextResponse.redirect(url)
  }

  if (provider !== 'signicat') {
    const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
    url.searchParams.set('step', '2')
    url.searchParams.set('method', 'netbeheerder')
    url.searchParams.set('idin', 'unsupported-provider')
    return NextResponse.redirect(url)
  }

  try {
    // At this point clientSecret is guaranteed to be a string.
    const cookieSecret = process.env.IDIN_COOKIE_SECRET || clientSecret

    const discovery = await fetchOidcDiscovery()
    const state = createState()
    const nonce = createNonce()
    const { verifier, challenge } = createPkcePair()

    // Store state + PKCE verifier in a signed, short-lived cookie.
    // Note: we use the client secret as default signing key unless IDIN_COOKIE_SECRET is provided.
    const payload = {
      state,
      nonce,
      verifier,
      createdAt: Date.now(),
    }
    const packed = signPayload(payload, cookieSecret)
    const jar = await cookies()
    jar.set('pa_idin_oauth', packed, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    })

    const authorizeUrl = new URL(discovery.authorization_endpoint)
    authorizeUrl.searchParams.set('client_id', clientId)
    authorizeUrl.searchParams.set('response_type', 'code')
    authorizeUrl.searchParams.set('redirect_uri', redirectUri)
    authorizeUrl.searchParams.set('scope', scopes)
    authorizeUrl.searchParams.set('state', state)
    authorizeUrl.searchParams.set('nonce', nonce)
    authorizeUrl.searchParams.set('code_challenge', challenge)
    authorizeUrl.searchParams.set('code_challenge_method', 'S256')

    // If only iDIN is enabled in eID Hub, Signicat will go straight to iDIN.
    // If more eIDs exist, Signicat may show a selector. That's fine for now.

    return NextResponse.redirect(authorizeUrl)
  } catch {
    const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
    url.searchParams.set('step', '2')
    url.searchParams.set('method', 'netbeheerder')
    url.searchParams.set('idin', 'start-failed')
    return NextResponse.redirect(url)
  }
}


