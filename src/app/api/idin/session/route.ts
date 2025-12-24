import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyPayload, signPayload } from '@/lib/idin/signicatOidc'
import logger from '@/lib/logger'

/**
 * GET /api/idin/session
 * 
 * Haalt de iDIN sessie data op (user data + consumption data)
 * en verwijdert de cookie na gebruik.
 */
export async function GET() {
  try {
    const cookieSecret = process.env.IDIN_COOKIE_SECRET || process.env.IDIN_CLIENT_SECRET
    if (!cookieSecret) {
      return NextResponse.json(
        { error: 'IDIN_COOKIE_SECRET not configured' },
        { status: 500 }
      )
    }

    const jar = await cookies()
    const sessionCookie = jar.get('pa_idin_session')?.value

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No iDIN session found' },
        { status: 404 }
      )
    }

    const sessionData = verifyPayload<{
      idinVerified: boolean
      userData: any
      consumptionData: any
      timestamp: number
    }>(sessionCookie, cookieSecret)

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      )
    }

    // Check if session is expired (10 minutes)
    const maxAge = 10 * 60 * 1000 // 10 minutes in ms
    if (Date.now() - sessionData.timestamp > maxAge) {
      // Clear expired cookie
      jar.set('pa_idin_session', '', { path: '/', maxAge: 0 })
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      )
    }

    // Clear cookie after reading (one-time use)
    jar.set('pa_idin_session', '', { path: '/', maxAge: 0 })

    logger.info('[iDIN Session] Session data retrieved and cleared')

    return NextResponse.json({
      success: true,
      data: sessionData,
    })
  } catch (error: any) {
    logger.error('[iDIN Session] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}

