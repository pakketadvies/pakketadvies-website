import { NextResponse } from 'next/server'
import { sendReviewRequestEmail } from '@/lib/send-review-email-internal'

/**
 * API route to send review request email
 * Called by cron job or manually
 * 
 * POST /api/email/send-review-request
 * Body: { aanvraagId: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { aanvraagId } = body

    if (!aanvraagId) {
      return NextResponse.json(
        { success: false, error: 'aanvraagId is required' },
        { status: 400 }
      )
    }

    console.log('📧 [send-review-request] Received request for aanvraagId:', aanvraagId)

    const result = await sendReviewRequestEmail(aanvraagId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 200 } // Don't return error status if email already sent
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Review email sent successfully',
      emailId: result.emailId,
    })
  } catch (error: any) {
    console.error('❌ [send-review-request] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send review email',
      },
      { status: 500 }
    )
  }
}

