import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendInterneNotificatieEmail } from '@/lib/send-email-internal'

/**
 * POST /api/admin/test-internal-email
 * 
 * Test endpoint om interne notificatie email te testen
 * Alleen toegankelijk voor admins
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { aanvraagId, aanvraagnummer } = body

    if (!aanvraagId || !aanvraagnummer) {
      return NextResponse.json(
        { error: 'aanvraagId en aanvraagnummer zijn verplicht' },
        { status: 400 }
      )
    }

    console.log('🧪 [test-internal-email] Testing internal notification email for:', { aanvraagId, aanvraagnummer })
    
    try {
      const result = await sendInterneNotificatieEmail(aanvraagId, aanvraagnummer)
      return NextResponse.json({
        success: true,
        message: 'Interne notificatie email verzonden',
        result
      })
    } catch (error: any) {
      console.error('❌ [test-internal-email] Error:', error)
      return NextResponse.json({
        success: false,
        error: error.message || 'Unknown error',
        stack: error.stack
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ [test-internal-email] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

