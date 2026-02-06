import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { generateContactFormulierEmail, generateContactBevestigingEmail } from '@/lib/email-templates'
import { appendLeadToSheet } from '@/lib/google-sheets'

interface ContactFormData {
  naam: string
  bedrijfsnaam: string
  email: string
  telefoon?: string
  onderwerp: string
  bericht: string
  privacy_akkoord: boolean
  website?: string // Honeypot field (verborgen, bots vullen dit in)
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json()
    
    // Validatie
    if (!body.naam || !body.email || !body.onderwerp || !body.bericht) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Alle verplichte velden moeten ingevuld zijn' 
        },
        { status: 400 }
      )
    }

    if (!body.privacy_akkoord) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Je moet akkoord gaan met de privacyvoorwaarden' 
        },
        { status: 400 }
      )
    }

    // Email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ongeldig emailadres' 
        },
        { status: 400 }
      )
    }

    // Honeypot check - als website veld is ingevuld, is het spam
    if (body.website && body.website.trim() !== '') {
      console.log('🚫 [contact] Spam detected - honeypot field filled:', body.website)
      // Return success to bot (don't let them know they were caught)
      return NextResponse.json({
        success: true,
        message: 'Je bericht is ontvangen. We nemen zo snel mogelijk contact met je op.',
      })
    }

    // Use service role key voor public inserts
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Probeer contactbericht op te slaan in database
    // Als de tabel niet bestaat, log dan en return success (voor development)
    const { data, error } = await supabase
      .from('contactberichten')
      .insert({
        naam: body.naam,
        bedrijfsnaam: body.bedrijfsnaam,
        email: body.email,
        telefoon: body.telefoon || null,
        onderwerp: body.onderwerp,
        bericht: body.bericht,
        privacy_akkoord: body.privacy_akkoord,
        status: 'nieuw',
        aangemaakt_op: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Als de tabel niet bestaat (code 42P01), log dan en return success
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('Contactberichten tabel bestaat nog niet. Bericht wordt gelogd:', {
          naam: body.naam,
          bedrijfsnaam: body.bedrijfsnaam,
          email: body.email,
          onderwerp: body.onderwerp,
        })
      } else {
        console.error('Error inserting contact message:', error)
      }
    }

    // Verstuur email notificatie naar PakketAdvies team
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set, skipping email notification')
      } else {
        // Get base URL for email template
        let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'
        
        // Safety check: if baseUrl contains a preview deployment pattern, use production domain
        if (baseUrl.includes('-') && baseUrl.includes('.vercel.app')) {
          baseUrl = 'https://pakketadvies.nl'
        }

        // Generate email HTML
        const emailHtml = generateContactFormulierEmail({
          naam: body.naam,
          bedrijfsnaam: body.bedrijfsnaam,
          email: body.email,
          telefoon: body.telefoon,
          onderwerp: body.onderwerp,
          bericht: body.bericht,
          baseUrl,
        })

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Get recipient email from env var, fallback to info@pakketadvies.nl
        const recipientEmail = process.env.CONTACT_FORM_RECIPIENT_EMAIL || 'info@pakketadvies.nl'

        // Use environment variable for from address, fallback to Resend test domain
        let fromEmail = (process.env.RESEND_FROM_EMAIL || 'PakketAdvies <noreply@pakketadvies.nl>')
          .trim()
          .replace(/\n/g, '')
          .replace(/\r/g, '')
        if ((fromEmail.startsWith('"') && fromEmail.endsWith('"')) || (fromEmail.startsWith("'") && fromEmail.endsWith("'"))) {
          fromEmail = fromEmail.slice(1, -1)
        }

        // Send notification email to PakketAdvies team
        console.log('📧 [contact] Sending notification email via Resend to:', recipientEmail)
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          replyTo: body.email, // Reply-to set to customer email for easy response
          subject: `📧 Nieuw contactformulier bericht: ${body.onderwerp} | PakketAdvies`,
          html: emailHtml,
        })

        if (emailError) {
          console.error('❌ [contact] Error sending notification email via Resend:', emailError)
          // Don't fail the request if email fails, just log it
        } else {
          console.log('✅ [contact] Notification email sent successfully, ID:', emailResult?.id)
        }

        // Send confirmation email to customer
        try {
          const bevestigingHtml = generateContactBevestigingEmail({
            naam: body.naam,
            bedrijfsnaam: body.bedrijfsnaam,
            email: body.email,
            onderwerp: body.onderwerp,
            baseUrl,
          })

          console.log('📧 [contact] Sending confirmation email to customer:', body.email)
          const { data: bevestigingResult, error: bevestigingError } = await resend.emails.send({
            from: fromEmail,
            to: body.email,
            subject: `✅ Bedankt voor je bericht - ${body.onderwerp} | PakketAdvies`,
            html: bevestigingHtml,
          })

          if (bevestigingError) {
            console.error('❌ [contact] Error sending confirmation email via Resend:', bevestigingError)
            // Don't fail the request if email fails, just log it
          } else {
            console.log('✅ [contact] Confirmation email sent successfully, ID:', bevestigingResult?.id)
          }
        } catch (bevestigingError: any) {
          console.error('❌ [contact] Unexpected error sending confirmation email:', bevestigingError)
          // Don't fail the request if email fails, just log it
        }
      }
    } catch (emailError: any) {
      console.error('❌ [contact] Unexpected error sending email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    // ============================================
    // GOOGLE SHEETS INTEGRATION (Advertentieleads)
    // ============================================
    try {
      console.log('📊 [contact] Attempting to write to Google Sheets...')
      await appendLeadToSheet({
        datumLeadBinnen: new Date().toISOString(),
        huidigeLeveranciers: '', // Niet beschikbaar in contactformulier
        postcode: '', // Niet beschikbaar in contactformulier
        huisnummer: '', // Niet beschikbaar in contactformulier
        stroom: '', // Niet beschikbaar in contactformulier
        gas: '', // Niet beschikbaar in contactformulier
        naam: body.naam,
        telefoonnummer: body.telefoon || '',
        emailadres: body.email,
        opmerkingen: `${body.onderwerp}\n\n${body.bericht}${body.bedrijfsnaam ? `\n\nBedrijf: ${body.bedrijfsnaam}` : ''}`,
      })
      console.log('✅ [contact] Successfully wrote to Google Sheets')
    } catch (sheetsError: any) {
      console.error('❌ [contact] Error writing to Google Sheets (non-blocking):', sheetsError)
      // Non-blocking: formulier blijft werken ook als Google Sheets faalt
    }

    return NextResponse.json({
      success: true,
      message: 'Je bericht is ontvangen. We nemen zo snel mogelijk contact met je op.',
      id: data?.id,
    })
  } catch (error: any) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Er is een fout opgetreden. Probeer het later opnieuw.' 
      },
      { status: 500 }
    )
  }
}
