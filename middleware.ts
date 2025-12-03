import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Redirect www.pakketadvies.nl to pakketadvies.nl (before any other processing)
  const hostname = request.headers.get('host') || ''
  if (hostname === 'www.pakketadvies.nl') {
    const url = request.nextUrl.clone()
    url.host = 'pakketadvies.nl'
    url.protocol = 'https:'
    return NextResponse.redirect(url, 308) // 308 = permanent redirect, preserves method
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

