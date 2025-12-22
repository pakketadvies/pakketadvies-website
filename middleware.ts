import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

const AUDIENCE_COOKIE = 'pa_audience'
const AUDIENCE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function getCookieDomain(hostname: string): string | undefined {
  if (hostname === 'pakketadvies.nl' || hostname.endsWith('.pakketadvies.nl')) return '.pakketadvies.nl'
  return undefined
}

function setAudienceCookie(res: NextResponse, hostname: string, value: 'consumer' | 'business') {
  const base = {
    path: '/',
    maxAge: AUDIENCE_MAX_AGE,
    sameSite: 'lax' as const,
  }

  // Always set host-only cookie (keeps existing host-only cookies in sync)
  res.cookies.set(AUDIENCE_COOKIE, value, base)

  // Also set domain cookie so www + apex share the same audience preference
  const domain = getCookieDomain(hostname)
  if (domain) {
    res.cookies.set(AUDIENCE_COOKIE, value, { ...base, domain })
  }
}

export async function middleware(request: NextRequest) {
  // www redirect is now handled by Vercel Dashboard (infrastructure level)
  // This prevents CORS errors with RSC requests

  const { pathname } = request.nextUrl
  const hostname = request.nextUrl.hostname
  const audience = request.cookies.get(AUDIENCE_COOKIE)?.value

  // Optie B: "/" follows last selected audience
  if (pathname === '/' && audience === 'consumer') {
    const url = request.nextUrl.clone()
    url.pathname = '/particulier'
    const res = NextResponse.redirect(url)
    setAudienceCookie(res, hostname, 'consumer')
    return res
  }

  const res = await updateSession(request)

  // Persist audience choice based on where the user is
  // - Visiting /particulier* => consumer
  // - Visiting anything else (non-admin) => business (default)
  if (pathname.startsWith('/particulier')) {
    // Always set both host-only + domain cookie to keep www/apex consistent
    setAudienceCookie(res, hostname, 'consumer')
  } else if (!pathname.startsWith('/admin')) {
    setAudienceCookie(res, hostname, 'business')
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc. (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
