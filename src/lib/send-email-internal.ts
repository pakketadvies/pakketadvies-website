import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generateBevestigingEmail, type EmailBevestigingData } from '@/lib/email-templates'

/**
 * Internal function to send confirmation email
 * Can be called directly from other API routes without HTTP fetch
 */
export async function sendBevestigingEmail(aanvraagId: string, aanvraagnummer: string) {
  try {
    console.log('📧 [sendBevestigingEmail] Starting email send for:', { aanvraagId, aanvraagnummer })

    // Check Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [sendBevestigingEmail] RESEND_API_KEY is not set')
      throw new Error('Email service niet geconfigureerd')
    }

    // Use service role key to fetch aanvraag data
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [sendBevestigingEmail] SUPABASE_SERVICE_ROLE_KEY is not set')
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
    console.log('📧 [sendBevestigingEmail] Fetching aanvraag data...')
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select(`
        *,
        contract:contracten(
          naam,
          leverancier:leveranciers(
            id,
            naam,
            logo_url
          )
        )
      `)
      .eq('id', aanvraagId)
      .single()

    if (aanvraagError || !aanvraag) {
      console.error('❌ [sendBevestigingEmail] Error fetching aanvraag:', aanvraagError)
      throw new Error('Aanvraag niet gevonden')
    }
    console.log('✅ [sendBevestigingEmail] Aanvraag found:', aanvraag.id)

    // Extract data
    const verbruikData = aanvraag.verbruik_data
    const gegevensData = aanvraag.gegevens_data
    const contract = aanvraag.contract as any
    const leverancier = contract?.leverancier

    // Get email from gegevens_data
    const email = gegevensData?.emailadres || gegevensData?.email
    if (!email) {
      console.error('❌ [sendBevestigingEmail] No email found in gegevens_data:', gegevensData)
      throw new Error('Geen emailadres gevonden in aanvraag')
    }
    console.log('✅ [sendBevestigingEmail] Email address found:', email)

    // Get klant naam
    const klantNaam = gegevensData?.bedrijfsnaam || 
                      `${gegevensData?.aanhef === 'dhr' ? 'Dhr.' : 'Mevr.'} ${gegevensData?.voornaam || ''} ${gegevensData?.achternaam || ''}`.trim() ||
                      gegevensData?.achternaam ||
                      'Klant'

    // Get address from verbruik_data (first leveringsadres)
    const leveringsadres = verbruikData?.leveringsadressen?.[0] || {}
    const adres = {
      straat: leveringsadres.straat || '',
      huisnummer: leveringsadres.huisnummer || '',
      toevoeging: leveringsadres.toevoeging || undefined,
      postcode: leveringsadres.postcode || '',
      plaats: leveringsadres.plaats || '',
    }

    // Get verbruik
    const verbruik = {
      elektriciteit: (verbruikData?.elektriciteitNormaal || 0) + (verbruikData?.elektriciteitDal || 0),
      gas: verbruikData?.gasJaar || verbruikData?.gas || 0,
    }

    // Get aansluitwaarden
    const aansluitwaarden = {
      elektriciteit: verbruikData?.aansluitwaardeElektriciteit || 'Onbekend',
      gas: verbruikData?.aansluitwaardeGas || 'Onbekend',
    }

    // Calculate costs (simplified - we'll use the exact calculation from the API if available)
    const maandbedrag = verbruikData?.maandbedrag || 0
    const jaarbedrag = verbruikData?.jaarbedrag || maandbedrag * 12
    const besparing = verbruikData?.besparing

    // Generate contract viewer URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pakketadvies.nl')
    
    // Generate access token for contract viewer
    const accessToken = crypto.randomUUID()
    
    // Store access token in database (valid for 7 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    
    console.log('📧 [sendBevestigingEmail] Storing access token...')
    await supabase
      .from('contract_viewer_access')
      .insert({
        aanvraag_id: aanvraagId,
        access_token: accessToken,
        expires_at: expiresAt.toISOString(),
      })

    const contractViewerUrl = `${baseUrl}/contract/${aanvraagnummer}?token=${accessToken}`

    // Prepare email data
    const emailData: EmailBevestigingData = {
      aanvraagnummer,
      contractNaam: aanvraag.contract_naam || contract?.naam || 'Energiecontract',
      leverancierNaam: aanvraag.leverancier_naam || leverancier?.naam || 'Onbekende leverancier',
      leverancierLogoUrl: leverancier?.logo_url || null,
      klantNaam,
      email,
      adres,
      verbruik,
      aansluitwaarden,
      maandbedrag,
      jaarbedrag,
      besparing,
      contractViewerUrl,
      baseUrl,
    }

    // Generate email HTML
    console.log('📧 [sendBevestigingEmail] Generating email HTML...')
    const emailHtml = generateBevestigingEmail(emailData)

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email
    console.log('📧 [sendBevestigingEmail] Sending email via Resend to:', email)
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'PakketAdvies <noreply@pakketadvies.nl>',
      to: email,
      subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('❌ [sendBevestigingEmail] Error sending email via Resend:', emailError)
      
      // Log failed email
      await supabase
        .from('email_logs')
        .insert({
          aanvraag_id: aanvraagId,
          email_type: 'bevestiging',
          recipient_email: email,
          subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
          status: 'failed',
          error_message: emailError.message,
        })

      throw emailError
    }

    // Log successful email
    console.log('📧 [sendBevestigingEmail] Logging successful email...')
    await supabase
      .from('email_logs')
      .insert({
        aanvraag_id: aanvraagId,
        email_type: 'bevestiging',
        recipient_email: email,
        subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
        status: 'sent',
        resend_id: emailResult?.id,
      })

    // Update aanvraag email status
    await supabase
      .from('contractaanvragen')
      .update({ email_bevestiging_verzonden: true })
      .eq('id', aanvraagId)

    console.log('✅ [sendBevestigingEmail] Email sent successfully, ID:', emailResult?.id)
    return { success: true, emailId: emailResult?.id }
  } catch (error: any) {
    console.error('❌ [sendBevestigingEmail] Unexpected error:', error)
    throw error
  }
}

