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
    console.log('📧 [sendBevestigingEmail] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('📧 [sendBevestigingEmail] Service role key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    
    try {
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

      if (aanvraagError) {
        console.error('❌ [sendBevestigingEmail] Supabase error fetching aanvraag:', {
          code: aanvraagError.code,
          message: aanvraagError.message,
          details: aanvraagError.details,
          hint: aanvraagError.hint,
        })
        throw new Error(`Aanvraag niet gevonden: ${aanvraagError.message}`)
      }

      if (!aanvraag) {
        console.error('❌ [sendBevestigingEmail] Aanvraag not found (no data returned)')
        throw new Error('Aanvraag niet gevonden (geen data)')
      }
      
      console.log('✅ [sendBevestigingEmail] Aanvraag found:', aanvraag.id)
      console.log('📧 [sendBevestigingEmail] Aanvraag data keys:', Object.keys(aanvraag))
    } catch (fetchError: any) {
      console.error('❌ [sendBevestigingEmail] Exception during fetch:', {
        message: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name,
      })
      throw fetchError
    }

    // Extract data
    console.log('📧 [sendBevestigingEmail] Extracting data from aanvraag...')
    const verbruikData = aanvraag.verbruik_data
    const gegevensData = aanvraag.gegevens_data
    const contract = aanvraag.contract as any
    const leverancier = contract?.leverancier

    console.log('📧 [sendBevestigingEmail] Data extracted:', {
      hasVerbruikData: !!verbruikData,
      hasGegevensData: !!gegevensData,
      hasContract: !!contract,
      hasLeverancier: !!leverancier,
    })

    // Get email from gegevens_data
    const email = gegevensData?.emailadres || gegevensData?.email
    if (!email) {
      console.error('❌ [sendBevestigingEmail] No email found in gegevens_data:', {
        gegevensDataKeys: gegevensData ? Object.keys(gegevensData) : 'null',
        emailadres: gegevensData?.emailadres,
        email: gegevensData?.email,
        fullGegevensData: JSON.stringify(gegevensData, null, 2),
      })
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
    let emailHtml: string
    try {
      emailHtml = generateBevestigingEmail(emailData)
      console.log('✅ [sendBevestigingEmail] Email HTML generated, length:', emailHtml.length)
    } catch (htmlError: any) {
      console.error('❌ [sendBevestigingEmail] Error generating email HTML:', {
        message: htmlError.message,
        stack: htmlError.stack,
      })
      throw new Error(`Fout bij genereren email HTML: ${htmlError.message}`)
    }

    // Initialize Resend
    console.log('📧 [sendBevestigingEmail] Initializing Resend...')
    console.log('📧 [sendBevestigingEmail] RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Send email
    console.log('📧 [sendBevestigingEmail] Sending email via Resend to:', email)
    console.log('📧 [sendBevestigingEmail] Email subject:', `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`)
    
    let emailResult: any
    let emailError: any
    
    try {
      const result = await resend.emails.send({
        from: 'PakketAdvies <noreply@pakketadvies.nl>',
        to: email,
        subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
        html: emailHtml,
      })
      emailResult = result.data
      emailError = result.error
    } catch (resendError: any) {
      console.error('❌ [sendBevestigingEmail] Exception during Resend send:', {
        message: resendError.message,
        stack: resendError.stack,
        name: resendError.name,
      })
      emailError = resendError
    }

    if (emailError) {
      console.error('❌ [sendBevestigingEmail] Error sending email via Resend:', {
        error: emailError,
        message: emailError?.message,
        name: emailError?.name,
        stack: emailError?.stack,
        code: emailError?.code,
        statusCode: emailError?.statusCode,
      })
      
      // Log failed email
      try {
        await supabase
          .from('email_logs')
          .insert({
            aanvraag_id: aanvraagId,
            email_type: 'bevestiging',
            recipient_email: email,
            subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
            status: 'failed',
            error_message: emailError?.message || String(emailError),
          })
        console.log('📧 [sendBevestigingEmail] Failed email logged to database')
      } catch (logError: any) {
        console.error('❌ [sendBevestigingEmail] Error logging failed email:', logError)
      }

      throw emailError
    }

    // Log successful email
    console.log('✅ [sendBevestigingEmail] Email sent successfully via Resend!')
    console.log('📧 [sendBevestigingEmail] Resend response:', {
      id: emailResult?.id,
      from: emailResult?.from,
      to: emailResult?.to,
    })
    
    console.log('📧 [sendBevestigingEmail] Logging successful email to database...')
    try {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          aanvraag_id: aanvraagId,
          email_type: 'bevestiging',
          recipient_email: email,
          subject: `✅ Uw aanvraag is ontvangen - ${aanvraagnummer} | PakketAdvies`,
          status: 'sent',
          resend_id: emailResult?.id,
        })
      
      if (logError) {
        console.error('❌ [sendBevestigingEmail] Error logging successful email:', logError)
      } else {
        console.log('✅ [sendBevestigingEmail] Email logged to database')
      }
    } catch (logError: any) {
      console.error('❌ [sendBevestigingEmail] Exception logging email:', logError)
    }

    // Update aanvraag email status
    console.log('📧 [sendBevestigingEmail] Updating aanvraag email status...')
    try {
      const { error: updateError } = await supabase
        .from('contractaanvragen')
        .update({ email_bevestiging_verzonden: true })
        .eq('id', aanvraagId)
      
      if (updateError) {
        console.error('❌ [sendBevestigingEmail] Error updating email status:', updateError)
      } else {
        console.log('✅ [sendBevestigingEmail] Email status updated in database')
      }
    } catch (updateError: any) {
      console.error('❌ [sendBevestigingEmail] Exception updating email status:', updateError)
    }

    console.log('✅ [sendBevestigingEmail] Email sent successfully, ID:', emailResult?.id)
    return { success: true, emailId: emailResult?.id }
  } catch (error: any) {
    console.error('❌ [sendBevestigingEmail] Unexpected error:', error)
    throw error
  }
}

