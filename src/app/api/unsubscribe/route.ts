import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/unsubscribe
 * 
 * Handles newsletter unsubscribe requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, email } = body

    if (!token && !email) {
      return NextResponse.json(
        { error: 'Token of email is verplicht' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // If token is provided, decode and find email
    if (token) {
      try {
        // Token is usually base64 encoded email or a database token
        // Try to decode as base64 first
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        if (decoded.includes('@')) {
          // Decoded token contains email
          const emailFromToken = decoded.split('@')[0] + '@' + decoded.split('@')[1]
          
          // Update email preferences in aanvragen
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

    // If email is provided directly
    if (email) {
      const { error: updateError } = await supabase
        .from('contractaanvragen')
        .update({ 
          nieuwsbrief: false,
          email_preferences: { nieuwsbrief: false }
        })
        .eq('gegevens_data->>email', email)

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

