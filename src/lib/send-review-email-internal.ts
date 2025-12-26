import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generateReviewRequestEmail, type ReviewRequestEmailData } from '@/lib/email-templates'

/**
 * Internal function to send review request email
 * Sent 1 week after contract activation (status = 'afgehandeld')
 */
export async function sendReviewRequestEmail(aanvraagId: string) {
  try {
    console.log('⭐ [sendReviewRequestEmail] Starting review email send for:', { aanvraagId })

    // Check Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [sendReviewRequestEmail] RESEND_API_KEY is not set')
      throw new Error('Email service niet geconfigureerd')
    }

    // Use service role key to fetch aanvraag data
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [sendReviewRequestEmail] SUPABASE_SERVICE_ROLE_KEY is not set')
      throw new Error('Server configuration error')
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

    // Fetch aanvraag data
    console.log('⭐ [sendReviewRequestEmail] Fetching aanvraag data...')
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select(`
        *,
        contract:contracten(
          naam,
          leverancier:leveranciers(
            naam,
            logo_url
          )
        )
      `)
      .eq('id', aanvraagId)
      .single()

    if (aanvraagError || !aanvraag) {
      console.error('❌ [sendReviewRequestEmail] Error fetching aanvraag:', aanvraagError)
      throw new Error(`Aanvraag niet gevonden: ${aanvraagError?.message}`)
    }

    // Check if review email already sent
    if (aanvraag.review_email_verzonden) {
      console.log('⚠️ [sendReviewRequestEmail] Review email already sent for aanvraag:', aanvraagId)
      return { success: false, message: 'Review email already sent' }
    }

    // Check if review already given
    if (aanvraag.review_gegeven) {
      console.log('⚠️ [sendReviewRequestEmail] Review already given for aanvraag:', aanvraagId)
      return { success: false, message: 'Review already given' }
    }

    // Extract data
    const gegevensData = aanvraag.gegevens_data as any
    const contract = aanvraag.contract as any
    const leverancier = contract?.leverancier

    if (!contract || !leverancier) {
      console.error('❌ [sendReviewRequestEmail] Contract or leverancier not found')
      throw new Error('Contract of leverancier niet gevonden')
    }

    const klantNaam = gegevensData?.contactpersoon || gegevensData?.naam || 'Beste klant'
    const email = aanvraag.email
    const contractNaam = aanvraag.contract_naam || contract.naam
    const leverancierNaam = aanvraag.leverancier_naam || leverancier.naam

    if (!email) {
      console.error('❌ [sendReviewRequestEmail] Email not found for aanvraag:', aanvraagId)
      throw new Error('Email niet gevonden')
    }

    // Generate Google Review URL
    // Google Maps Place ID for PakketAdvies (Stavangerweg 13, 9723JC Groningen)
    // You'll need to get the actual Place ID from Google Maps
    // For now, using a generic Google review link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pakketadvies.nl'
    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID` // TODO: Replace with actual Place ID

    // Prepare email data
    const emailData: ReviewRequestEmailData = {
      klantNaam,
      leverancierNaam,
      contractNaam,
      baseUrl,
      googleReviewUrl,
    }

    // Generate email HTML
    const emailHtml = generateReviewRequestEmail(emailData)

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'PakketAdvies <info@pakketadvies.nl>'

    console.log('⭐ [sendReviewRequestEmail] Sending review email to:', email)
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: '⭐ Hoe bevalt je nieuwe energiecontract?',
      html: emailHtml,
    })

    if (emailError) {
      console.error('❌ [sendReviewRequestEmail] Error sending email:', emailError)
      throw new Error(`Email verzenden mislukt: ${emailError.message}`)
    }

    console.log('✅ [sendReviewRequestEmail] Review email sent successfully, ID:', emailResult?.id)

    // Update database: mark review email as sent
    const { error: updateError } = await supabase
      .from('contractaanvragen')
      .update({
        review_email_verzonden: true,
        review_email_verzonden_at: new Date().toISOString(),
      })
      .eq('id', aanvraagId)

    if (updateError) {
      console.error('⚠️ [sendReviewRequestEmail] Error updating database:', updateError)
      // Don't throw - email was sent successfully
    }

    // Log email in email_logs
    try {
      await supabase
        .from('email_logs')
        .insert({
          aanvraag_id: aanvraagId,
          email_type: 'review_request',
          recipient_email: email,
          subject: '⭐ Hoe bevalt je nieuwe energiecontract?',
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: {
            resend_id: emailResult?.id,
            contract_naam: contractNaam,
            leverancier_naam: leverancierNaam,
          },
        })
    } catch (logError: any) {
      console.error('⚠️ [sendReviewRequestEmail] Error logging email:', logError.message)
      // Don't throw - email was sent successfully
    }

    return {
      success: true,
      message: 'Review email sent successfully',
      emailId: emailResult?.id,
    }
  } catch (error: any) {
    console.error('❌ [sendReviewRequestEmail] Unexpected error:', error)
    throw error
  }
}

