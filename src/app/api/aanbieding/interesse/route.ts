import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { generateAanbiedingInteresseEmail } from '@/lib/email-templates'

interface AanbiedingInteresseData {
  aanbiedingType: 'particulier-3-jaar' | 'mkb-3-jaar' | 'grootzakelijk' | 'dynamisch'
  naam: string
  email: string
  telefoon?: string
  opmerking?: string
  privacy_akkoord: boolean
}

export async function POST(request: Request) {
  try {
    const body: AanbiedingInteresseData = await request.json()
    
    // Validatie
    if (!body.naam || !body.email || !body.aanbiedingType) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Naam, email en aanbieding type zijn verplicht' 
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
        const emailHtml = generateAanbiedingInteresseEmail({
          aanbiedingType: body.aanbiedingType,
          naam: body.naam,
          email: body.email,
          telefoon: body.telefoon,
          opmerking: body.opmerking,
          baseUrl,
        })

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

        // Map aanbieding type to display name
        const aanbiedingNamen: Record<string, string> = {
          'particulier-3-jaar': 'Particulier 3-jarig aanbod',
          'mkb-3-jaar': '3-jarig vast aanbod voor het MKB',
          'grootzakelijk': 'Groot Zakelijk Aanbod',
          'dynamisch': 'Dynamische energietarieven',
        }

        const aanbiedingNaam = aanbiedingNamen[body.aanbiedingType] || body.aanbiedingType

        // Send notification email to PakketAdvies team
        console.log('📧 [aanbieding-interesse] Sending notification email via Resend to:', recipientEmail)
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          replyTo: body.email, // Reply-to set to customer email for easy response
          subject: `🎯 Nieuwe interesse: ${aanbiedingNaam} | PakketAdvies`,
          html: emailHtml,
        })

        if (emailError) {
          console.error('❌ [aanbieding-interesse] Error sending notification email via Resend:', emailError)
          // Don't fail the request if email fails, just log it
        } else {
          console.log('✅ [aanbieding-interesse] Notification email sent successfully, ID:', emailResult?.id)
        }
      }
    } catch (emailError: any) {
      console.error('❌ [aanbieding-interesse] Unexpected error sending email:', emailError)
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'Bedankt voor je interesse! We nemen zo snel mogelijk contact met je op.',
    })
  } catch (error: any) {
    console.error('Error processing aanbieding interesse form:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Er is een fout opgetreden. Probeer het later opnieuw.' 
      },
      { status: 500 }
    )
  }
}

