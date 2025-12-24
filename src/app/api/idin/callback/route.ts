import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { fetchOidcDiscovery, verifyPayload, signPayload } from '@/lib/idin/signicatOidc'
import { fetchConsumptionFromEDSN, getEDSNConfig } from '@/lib/idin/edsn-api'
import logger from '@/lib/logger'

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
    const { payload } = await jwtVerify(tokenJson.id_token, jwks, {
      issuer: discovery.issuer,
      audience: clientId,
    })
    const nonce = typeof (payload as any)?.nonce === 'string' ? (payload as any).nonce : null
    if (!nonce || nonce !== stored.nonce) {
      url.searchParams.set('idin', 'nonce-mismatch')
      return NextResponse.redirect(url)
    }

    // Extract user data from ID token payload
    // Signicat iDIN returns verified identity attributes in the ID token
    const userData = {
      // BSN is typically in 'sub' or a custom claim (check Signicat docs)
      bsn: (payload as any)?.sub || (payload as any)?.bsn || (payload as any)?.claims?.bsn,
      // Name
      voornaam: (payload as any)?.given_name || (payload as any)?.voornaam,
      achternaam: (payload as any)?.family_name || (payload as any)?.achternaam,
      // Address (if available in token)
      postcode: (payload as any)?.postal_code || (payload as any)?.postcode,
      huisnummer: (payload as any)?.house_number || (payload as any)?.huisnummer,
      toevoeging: (payload as any)?.house_number_addition || (payload as any)?.toevoeging,
      straat: (payload as any)?.street_address || (payload as any)?.straat,
      plaats: (payload as any)?.locality || (payload as any)?.plaats,
    }

    logger.info('[iDIN Callback] User data extracted from ID token:', {
      hasBsn: !!userData.bsn,
      hasName: !!(userData.voornaam && userData.achternaam),
      hasAddress: !!(userData.postcode && userData.huisnummer),
    })

    // STAP 2: Haal verbruiksdata op via EDSN (als geconfigureerd)
    let consumptionData = null
    const edsnConfig = getEDSNConfig()
    
    if (edsnConfig && userData.bsn && userData.postcode && userData.huisnummer) {
      logger.info('[iDIN Callback] Fetching consumption data from EDSN...')
      
      const edsnResponse = await fetchConsumptionFromEDSN(edsnConfig, {
        bsn: userData.bsn,
        postcode: userData.postcode,
        huisnummer: userData.huisnummer,
        toevoeging: userData.toevoeging,
      })

      if (edsnResponse.success && edsnResponse.data) {
        consumptionData = edsnResponse.data
        logger.info('[iDIN Callback] EDSN data fetched successfully:', {
          hasElectricity: !!(consumptionData.elektriciteitNormaal),
          hasGas: !!(consumptionData.gasJaar),
          hasFeedIn: !!(consumptionData.terugleveringJaar),
        })
      } else {
        logger.warn('[iDIN Callback] EDSN data fetch failed:', edsnResponse.error)
        // Continue without consumption data - user can still fill manually
      }
    } else {
      logger.info('[iDIN Callback] EDSN not configured or missing required data, skipping consumption fetch')
    }

    // STAP 3: Store data in session/cookie for retrieval on redirect
    // We store the consumption data temporarily so the wizard can pick it up
    const sessionData = {
      idinVerified: true,
      userData,
      consumptionData,
      timestamp: Date.now(),
    }

    // Store in signed cookie (expires in 10 minutes)
    const sessionCookie = signPayload(sessionData, cookieSecret)
    jar.set('pa_idin_session', sessionCookie, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    })

    // Redirect with success status
    if (consumptionData) {
      url.searchParams.set('idin', 'success-with-data')
    } else {
      url.searchParams.set('idin', 'success')
      url.searchParams.set('message', 'iDIN verificatie gelukt. Vul je verbruik handmatig in.')
    }
    
    return NextResponse.redirect(url)
  } catch {
    url.searchParams.set('idin', 'callback-failed')
    return NextResponse.redirect(url)
  }
}


