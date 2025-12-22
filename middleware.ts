import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { AUDIENCE_COOKIE, getAudienceFromPath } from '@/lib/audience'

const AUDIENCE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export async function middleware(request: NextRequest) {
  // www redirect is now handled by Vercel Dashboard (infrastructure level)
  // This prevents CORS errors with RSC requests

  const { pathname } = request.nextUrl
  const audience = request.cookies.get(AUDIENCE_COOKIE)?.value
  const routeAudience = getAudienceFromPath(pathname)

  // Optie B: "/" follows last selected audience
  if (pathname === '/' && audience === 'consumer') {
    const url = request.nextUrl.clone()
    url.pathname = '/particulier'
    const res = NextResponse.redirect(url)
    res.cookies.set(AUDIENCE_COOKIE, 'consumer', {
      path: '/',
      maxAge: AUDIENCE_MAX_AGE,
      sameSite: 'lax',
    })
    return res
  }

  const res = await updateSession(request)

  // Persist audience based on current route (single source of truth)
  // Note: don't overwrite on admin routes.
  if (!pathname.startsWith('/admin')) {
    if (audience !== routeAudience) {
      res.cookies.set(AUDIENCE_COOKIE, routeAudience, {
        path: '/',
        maxAge: AUDIENCE_MAX_AGE,
        sameSite: 'lax',
      })
    }
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
