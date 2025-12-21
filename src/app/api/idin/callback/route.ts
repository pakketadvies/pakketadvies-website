import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { fetchOidcDiscovery, verifyPayload } from '@/lib/idin/signicatOidc'

/**
 * iDIN callback endpoint (placeholder).
 *
 * A real provider will redirect back here with an authorization code (OIDC/OAuth).
 * We should then exchange it for tokens, fetch verified identity attributes,
 * and (if contracted) request energy consumption data (netbeheerder) via the
 * relevant data/consent service.
 */
export async function GET(request: Request) {
  const enabled = process.env.IDIN_ENABLED === 'true'
  const provider = process.env.IDIN_PROVIDER
  const clientId = process.env.IDIN_CLIENT_ID
  const clientSecret = process.env.IDIN_CLIENT_SECRET
  const redirectUri = process.env.IDIN_REDIRECT_URI

  const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
  url.searchParams.set('step', '2')
  url.searchParams.set('method', 'netbeheerder')

  if (!enabled || provider !== 'signicat' || !clientId || !clientSecret || !redirectUri) {
    url.searchParams.set('idin', 'not-configured')
    return NextResponse.redirect(url)
  }

  // At this point clientSecret is guaranteed to be a string.
  const cookieSecret = process.env.IDIN_COOKIE_SECRET || clientSecret

  const incoming = new URL(request.url)
  const code = incoming.searchParams.get('code')
  const returnedState = incoming.searchParams.get('state')
  const error = incoming.searchParams.get('error')
  const errorDescription = incoming.searchParams.get('error_description')

  if (error) {
    url.searchParams.set('idin', 'provider-error')
    if (errorDescription) url.searchParams.set('idinError', errorDescription.slice(0, 140))
    return NextResponse.redirect(url)
  }

  if (!code || !returnedState) {
    url.searchParams.set('idin', 'missing-code')
    return NextResponse.redirect(url)
  }

  const jar = await cookies()
  const packed = jar.get('pa_idin_oauth')?.value
  jar.set('pa_idin_oauth', '', { path: '/', maxAge: 0 })

  if (!packed) {
    url.searchParams.set('idin', 'missing-state')
    return NextResponse.redirect(url)
  }

  const stored = verifyPayload<{ state: string; nonce: string; verifier: string; createdAt: number }>(packed, cookieSecret)
  if (!stored || stored.state !== returnedState) {
    url.searchParams.set('idin', 'state-mismatch')
    return NextResponse.redirect(url)
  }

  try {
    const discovery = await fetchOidcDiscovery()

    // Exchange code for tokens
    const body = new URLSearchParams()
    body.set('grant_type', 'authorization_code')
    body.set('code', code)
    body.set('redirect_uri', redirectUri)
    body.set('client_id', clientId)
    body.set('client_secret', clientSecret)
    body.set('code_verifier', stored.verifier)

    const tokenRes = await fetch(discovery.token_endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    })

    const tokenJson = await tokenRes.json().catch(() => null)
    if (!tokenRes.ok || !tokenJson?.id_token) {
      url.searchParams.set('idin', 'token-exchange-failed')
      return NextResponse.redirect(url)
    }

    // Verify the ID token (issuer, audience, nonce, signature)
    const jwks = createRemoteJWKSet(new URL(discovery.jwks_uri))
    await jwtVerify(tokenJson.id_token, jwks, {
      issuer: discovery.issuer,
      audience: clientId,
      nonce: stored.nonce,
    })

    // NOTE: Energy consumption + supplier/end-date are NOT returned by iDIN itself.
    // That requires a separate data/consent provider integration.
    url.searchParams.set('idin', 'success')
    return NextResponse.redirect(url)
  } catch {
    url.searchParams.set('idin', 'callback-failed')
    return NextResponse.redirect(url)
  }
}


