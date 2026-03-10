import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/unsubscribe
 * 
 * Handles newsletter unsubscribe requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email, source } = body as {
      token?: string
      email?: string
      source?: string
    }

    if (!token && !email) {
      return NextResponse.json(
        { error: 'Token of email is verplicht' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Funnel-specific unsubscribe via secure lead token
    if (token && source === 'funnel') {
      const { error: funnelUpdateError } = await supabase
        .from('comparison_leads')
        .update({
          funnel_status: 'unsubscribed',
          funnel_next_email_at: null,
        })
        .eq('funnel_access_token', token)

      if (funnelUpdateError) {
        console.error('Error updating funnel unsubscribe:', funnelUpdateError)
        return NextResponse.json(
          { error: 'Fout bij uitschrijven van vervolg-e-mails.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Je bent succesvol uitgeschreven voor vervolg-e-mails over je energievoorstel.',
      })
    }

    // If token is provided, decode and find email for legacy nieuwsbrief flow
    if (token) {
      try {
        // Token is usually base64 encoded email or a database token
        // Try to decode as base64 first
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        if (decoded.includes('@')) {
          // Decoded token contains email
          const emailFromToken = decoded.split('@')[0] + '@' + decoded.split('@')[1]
          
          // Update email preferences in aanvragen (legacy nieuwsbrief flow)
          const { error: updateError } = await supabase
            .from('contractaanvragen')
            .update({ 
              nieuwsbrief: false,
              email_preferences: { nieuwsbrief: false }
            })
            .eq('gegevens_data->>email', emailFromToken)

          if (updateError) {
            console.error('Error updating unsubscribe:', updateError)
          }

          return NextResponse.json({
            success: true,
            message: 'U bent succesvol uitgeschreven voor onze nieuwsbrief.',
          })
        }
      } catch (e) {
        // Token is not base64, try as database token
        // For now, just return success
      }
    }

    // If email is provided directly, unsubscribe from both newsletter and lead follow-up
    if (email) {
      const normalizedEmail = email.trim().toLowerCase()

      const { error: leadUnsubscribeError } = await supabase
        .from('comparison_leads')
        .update({
          funnel_status: 'unsubscribed',
          funnel_next_email_at: null,
        })
        .eq('email', normalizedEmail)
        .neq('funnel_status', 'converted')

      if (leadUnsubscribeError) {
        console.error('Error updating lead unsubscribe:', leadUnsubscribeError)
      }

      const { error: updateError } = await supabase
        .from('contractaanvragen')
        .update({ 
          nieuwsbrief: false,
          email_preferences: { nieuwsbrief: false }
        })
        .eq('gegevens_data->>email', normalizedEmail)

      if (updateError) {
        console.error('Error updating unsubscribe:', updateError)
        return NextResponse.json(
          { error: 'Fout bij uitschrijven' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'U bent succesvol uitgeschreven voor onze nieuwsbrief.',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'U bent succesvol uitgeschreven voor onze nieuwsbrief.',
    })
  } catch (error: any) {
    console.error('Error in unsubscribe:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het uitschrijven' },
      { status: 500 }
    )
  }
}

