import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generateBevestigingEmail, type EmailBevestigingData } from '@/lib/email-templates'

/**
 * POST /api/email/send-bevestiging
 * 
 * Sends a confirmation email for a contract application
 */
export async function POST(request: Request) {
  try {
    console.log('📧 [send-bevestiging] Email API called')
    const body = await request.json()
    const { aanvraagId, aanvraagnummer } = body

    console.log('📧 [send-bevestiging] Request data:', { aanvraagId, aanvraagnummer })

    if (!aanvraagId || !aanvraagnummer) {
      console.error('❌ [send-bevestiging] Missing required fields')
      return NextResponse.json(
        { success: false, error: 'aanvraagId en aanvraagnummer zijn verplicht' },
        { status: 400 }
      )
    }

    // Check Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ [send-bevestiging] RESEND_API_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Email service niet geconfigureerd' },
        { status: 500 }
      )
    }
    console.log('✅ [send-bevestiging] RESEND_API_KEY is set')

    // Use service role key to fetch aanvraag data
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

    // Fetch aanvraag data
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
      console.error('❌ [send-bevestiging] Error fetching aanvraag:', aanvraagError)
      return NextResponse.json(
        { success: false, error: 'Aanvraag niet gevonden' },
        { status: 404 }
      )
    }
    console.log('✅ [send-bevestiging] Aanvraag found:', aanvraag.id)

    // Extract data
    const verbruikData = aanvraag.verbruik_data
    const gegevensData = aanvraag.gegevens_data
    const contract = aanvraag.contract as any
    const leverancier = contract?.leverancier

    // Get email from gegevens_data
    const email = gegevensData?.emailadres || gegevensData?.email
    if (!email) {
      console.error('❌ [send-bevestiging] No email found in gegevens_data:', gegevensData)
      return NextResponse.json(
        { success: false, error: 'Geen emailadres gevonden in aanvraag' },
        { status: 400 }
      )
    }
    console.log('✅ [send-bevestiging] Email address found:', email)

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

    // Get verbruik - correct extract normaal/dal split
    const elektriciteitNormaal = verbruikData?.elektriciteitNormaal || 0
    const elektriciteitDal = verbruikData?.elektriciteitDal || 0
    const elektriciteitTotaal = elektriciteitNormaal + elektriciteitDal
    const heeftEnkeleMeter = verbruikData?.heeftEnkeleMeter || false
    const gasJaar = verbruikData?.gasJaar || verbruikData?.gas || 0
    
    const verbruik = {
      elektriciteitNormaal: heeftEnkeleMeter ? undefined : elektriciteitNormaal,
      elektriciteitDal: heeftEnkeleMeter ? undefined : (verbruikData?.elektriciteitDal || null),
      elektriciteitTotaal,
      heeftEnkeleMeter,
      gas: gasJaar,
    }

    // Get aansluitwaarden
    const aansluitwaarden = {
      elektriciteit: verbruikData?.aansluitwaardeElektriciteit || 'Onbekend',
      gas: verbruikData?.aansluitwaardeGas || 'Onbekend',
    }

    // Calculate costs (simplified - we'll use the exact calculation from the API if available)
    // For now, use estimates from verbruik_data if available
    const maandbedrag = verbruikData?.maandbedrag || 0
    const jaarbedrag = verbruikData?.jaarbedrag || maandbedrag * 12
    const besparing = verbruikData?.besparing

    // Generate contract viewer URL
    // Use current production domain (pakketadvies.nl)
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    
    if (!baseUrl) {
      baseUrl = 'https://pakketadvies.nl'
    }
    
    // Safety check: if baseUrl contains a preview deployment pattern, use production domain
    if (baseUrl.includes('-') && baseUrl.includes('.vercel.app')) {
      baseUrl = 'https://pakketadvies.nl'
    }
    
    // Generate access token for contract viewer
    const accessToken = crypto.randomUUID()
    
    // Store access token in database (permanent access - no expiration)
    const { error: tokenError } = await supabase
      .from('contract_viewer_access')
      .insert({
        aanvraag_id: aanvraagId,
        access_token: accessToken,
        expires_at: null, // NULL = permanent access
      })
    
    if (tokenError) {
      console.error('❌ [send-bevestiging] Error storing access token:', tokenError.message)
      // Continue anyway - email will still be sent, but contract viewer link might not work
    }

    // Use a more trusted redirect URL structure for email clients
    // This is less likely to be blocked than direct contract viewer links
    const contractViewerUrl = `${baseUrl}/bekijk-contract/${aanvraagnummer}?token=${accessToken}`

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
    const emailHtml = generateBevestigingEmail(emailData)

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email
    console.log('📧 [send-bevestiging] Sending email via Resend to:', email)
    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'PakketAdvies <noreply@pakketadvies.nl>',
      to: email,
      subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
      html: emailHtml,
    })

    if (emailError) {
      console.error('❌ [send-bevestiging] Error sending email via Resend:', emailError)
      
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

      return NextResponse.json(
        { success: false, error: 'Fout bij verzenden email: ' + emailError.message },
        { status: 500 }
      )
    }

    // Log successful email
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

    console.log('✅ [send-bevestiging] Email sent successfully, ID:', emailResult?.id)
    return NextResponse.json({
      success: true,
      emailId: emailResult?.id,
    })
  } catch (error: any) {
    console.error('Unexpected error in send-bevestiging:', error)
    return NextResponse.json(
      { success: false, error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

