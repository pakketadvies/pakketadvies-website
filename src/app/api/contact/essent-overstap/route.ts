import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { appendLeadToSheet } from '@/lib/google-sheets'

interface EssentOverstapData {
  naam: string
  email: string
  telefoon: string
  opmerking?: string
  privacy_akkoord: boolean
}

export async function POST(request: Request) {
  try {
    const body: EssentOverstapData = await request.json()
    
    // Validatie
    if (!body.naam || !body.email || !body.telefoon) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Naam, email en telefoonnummer zijn verplicht' 
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

    // Telefoonnummer validatie
    if (body.telefoon.length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vul een geldig telefoonnummer in' 
        },
        { status: 400 }
      )
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

        // Initialize Resend
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Get recipient email from env var, fallback to info@pakketadvies.nl
        const recipientEmail = process.env.CONTACT_FORM_RECIPIENT_EMAIL || 'info@pakketadvies.nl'

        // Use environment variable for from address
        let fromEmail = (process.env.RESEND_FROM_EMAIL || 'PakketAdvies <noreply@pakketadvies.nl>')
          .trim()
          .replace(/\n/g, '')
          .replace(/\r/g, '')
        if ((fromEmail.startsWith('"') && fromEmail.endsWith('"')) || (fromEmail.startsWith("'") && fromEmail.endsWith("'"))) {
          fromEmail = fromEmail.slice(1, -1)
        }

        // Generate email HTML
        const emailHtml = `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nieuwe Essent Overstap Aanvraag - PakketAdvies</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F8FAFC; line-height: 1.6;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F4C75 0%, #1A5F8A 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; font-size: 24px; margin: 0;">PakketAdvies</h1>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="background: #FEF2F2; padding: 30px 20px; text-align: center; border-top: 4px solid #EF4444;">
              <h1 style="color: #0F4C75; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">⚠️ Nieuwe Essent Overstap Aanvraag</h1>
              <p style="color: #64748B; font-size: 16px; margin: 0;"><strong>Belangrijk: T/m 11 maart boetevrij!</strong></p>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="background: white; padding: 30px 20px;">
              <h2 style="color: #0F4C75; font-size: 20px; margin: 0 0 20px 0; font-weight: bold;">Contactgegevens</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Naam</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">${body.naam}</p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">E-mail</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="mailto:${body.email}" style="color: #14B8A6; text-decoration: none;">${body.email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Telefoon</p>
                    <p style="color: #0F4C75; font-size: 16px; margin: 0; font-weight: 500;">
                      <a href="tel:${body.telefoon.replace(/\s/g, '')}" style="color: #14B8A6; text-decoration: none;">${body.telefoon}</a>
                    </p>
                  </td>
                </tr>
              </table>

              ${body.opmerking ? `
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="color: #64748B; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 0.5px;">Opmerking</p>
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid #14B8A6;">
                      <p style="color: #0F4C75; font-size: 16px; margin: 0; white-space: pre-wrap;">${body.opmerking}</p>
                    </div>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>

          <!-- Urgency Notice -->
          <tr>
            <td style="background: #FEF2F2; padding: 20px; border-top: 2px solid #FEE2E2;">
              <p style="color: #991B1B; font-size: 14px; margin: 0; font-weight: bold; text-align: center;">
                ⏰ DEADLINE: 11 maart 2026 voor boetevrije overstap!
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 30px 20px; background: #F8FAFC;">
              <a href="${baseUrl}/essent-overstap" target="_blank" rel="noopener noreferrer" style="background: #14B8A6; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; margin: 10px 5px; font-size: 16px; cursor: pointer;">
                📄 Bekijk landingspagina
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #0F4C75; padding: 30px 20px; text-align: center;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0 0 10px 0;">
                <strong style="color: white;">PakketAdvies</strong>
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 10px 0 0 0;">
                <a href="${baseUrl}/privacy" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Privacybeleid</a> | 
                <a href="${baseUrl}/contact" style="color: rgba(255,255,255,0.8); text-decoration: underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
        `.trim()

        // Send notification email to PakketAdvies team
        console.log('📧 [essent-overstap] Sending notification email via Resend to:', recipientEmail)
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          replyTo: body.email,
          subject: `⚠️ Nieuwe Essent Overstap Aanvraag (DEADLINE 11 maart!) | PakketAdvies`,
          html: emailHtml,
        })

        if (emailError) {
          console.error('❌ [essent-overstap] Error sending notification email via Resend:', emailError)
          // Don't fail the request if email fails, just log it
        } else {
          console.log('✅ [essent-overstap] Notification email sent successfully, ID:', emailResult?.id)
        }
      }
    } catch (emailError: any) {
      console.error('❌ [essent-overstap] Unexpected error sending email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    // ============================================
    // GOOGLE SHEETS INTEGRATION (Advertentieleads)
    // ============================================
    try {
      console.log('📊 [essent-overstap] Attempting to write to Google Sheets...')
      await appendLeadToSheet({
        datumLeadBinnen: new Date().toISOString(),
        huidigeLeveranciers: 'Essent',
        postcode: '', // Niet beschikbaar in essent overstap formulier
        huisnummer: '', // Niet beschikbaar in essent overstap formulier
        stroom: '', // Niet beschikbaar in essent overstap formulier
        gas: '', // Niet beschikbaar in essent overstap formulier
        naam: body.naam,
        telefoonnummer: body.telefoon,
        emailadres: body.email,
        opmerkingen: `Essent Overstap (boetevrij t/m 11 maart)${body.opmerking ? `\n\nOpmerking: ${body.opmerking}` : ''}`,
      })
      console.log('✅ [essent-overstap] Successfully wrote to Google Sheets')
    } catch (sheetsError: any) {
      console.error('❌ [essent-overstap] Error writing to Google Sheets (non-blocking):', sheetsError)
      // Non-blocking: formulier blijft werken ook als Google Sheets faalt
    }

    return NextResponse.json({
      success: true,
      message: 'Bedankt voor je interesse! We nemen zo snel mogelijk contact met je op.',
    })
  } catch (error: any) {
    console.error('Error processing essent overstap form:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Er is een fout opgetreden. Probeer het later opnieuw.' 
      },
      { status: 500 }
    )
  }
}
