import { NextResponse } from 'next/server'

/**
 * iDIN callback endpoint (placeholder).
 *
 * A real provider will redirect back here with an authorization code (OIDC/OAuth).
 * We should then exchange it for tokens, fetch verified identity attributes,
 * and (if contracted) request energy consumption data (netbeheerder) via the
 * relevant data/consent service.
 */
export async function GET() {
  const url = new URL('/particulier/energie-vergelijken', process.env.NEXT_PUBLIC_SITE_URL || 'https://pakketadvies.nl')
  url.searchParams.set('step', '2')
  url.searchParams.set('method', 'netbeheerder')
  url.searchParams.set('idin', 'callback-not-implemented')
  return NextResponse.redirect(url)
}


