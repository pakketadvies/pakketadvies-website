import { NextResponse } from 'next/server'
import { sendBevestigingEmail } from '@/lib/send-email-internal'

/**
 * POST /api/test-email
 * 
 * Test endpoint om email functionaliteit te testen
 * Gebruik: POST met { aanvraagId: "...", aanvraagnummer: "..." }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { aanvraagId, aanvraagnummer } = body

    if (!aanvraagId || !aanvraagnummer) {
      return NextResponse.json(
        { success: false, error: 'aanvraagId en aanvraagnummer zijn verplicht' },
        { status: 400 }
      )
    }

    console.log('🧪 [test-email] Testing email send for:', { aanvraagId, aanvraagnummer })

    const result = await sendBevestigingEmail(aanvraagId, aanvraagnummer)

    return NextResponse.json({
      success: true,
      message: 'Email test successful',
      result,
    })
  } catch (error: any) {
    console.error('❌ [test-email] Test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

