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
    console.log('📧 [sendBevestigingEmail] Aanvraag ID:', aanvraagId)
    
    let aanvraag: any
    
    try {
      console.log('📧 [sendBevestigingEmail] Step 1: Fetching basis aanvraag data (zonder nested select)...')
      const queryStartTime = Date.now()
      
      // Use simpler query first (more reliable)
      const { data: basisData, error: basisError } = await supabase
        .from('contractaanvragen')
        .select('*')
        .eq('id', aanvraagId)
        .single()

      const queryDuration = Date.now() - queryStartTime
      console.log(`📧 [sendBevestigingEmail] Basis query completed in ${queryDuration}ms`)

      if (basisError) {
        console.error('❌ [sendBevestigingEmail] Error fetching basis aanvraag:', {
          code: basisError.code,
          message: basisError.message,
          details: basisError.details,
          hint: basisError.hint,
        })
        throw new Error(`Aanvraag niet gevonden: ${basisError.message}`)
      }

      if (!basisData) {
        console.error('❌ [sendBevestigingEmail] Aanvraag not found (no data returned)')
        throw new Error('Aanvraag niet gevonden (geen data)')
      }
      
      aanvraag = basisData
      console.log('✅ [sendBevestigingEmail] Basis aanvraag found:', aanvraag.id)
      console.log('📧 [sendBevestigingEmail] Aanvraag data keys:', Object.keys(aanvraag))
      console.log('📧 [sendBevestigingEmail] Verbruik data:', aanvraag.verbruik_data ? 'present' : 'missing')
      console.log('📧 [sendBevestigingEmail] Gegevens data:', aanvraag.gegevens_data ? 'present' : 'missing')
      console.log('📧 [sendBevestigingEmail] Contract ID:', aanvraag.contract_id || 'missing')
      
      // Step 2: Fetch contract data separately if contract_id exists
      if (aanvraag.contract_id) {
        console.log('📧 [sendBevestigingEmail] Step 2: Fetching contract data separately...')
        const contractStartTime = Date.now()
        
        try {
          const { data: contractData, error: contractError } = await supabase
            .from('contracten')
            .select(`
              naam,
              leverancier:leveranciers(
                id,
                naam,
                logo_url
              )
            `)
            .eq('id', aanvraag.contract_id)
            .single()
          
          const contractDuration = Date.now() - contractStartTime
          console.log(`📧 [sendBevestigingEmail] Contract query completed in ${contractDuration}ms`)
          
          if (contractError) {
            console.warn('⚠️ [sendBevestigingEmail] Error fetching contract data (non-critical):', contractError.message)
            // Continue without contract data - we have fallback values
          } else if (contractData) {
            aanvraag.contract = contractData
            console.log('✅ [sendBevestigingEmail] Contract data fetched successfully')
            console.log('📧 [sendBevestigingEmail] Contract naam:', contractData.naam || 'missing')
            console.log('📧 [sendBevestigingEmail] Leverancier:', contractData.leverancier ? 'present' : 'missing')
          }
        } catch (contractFetchError: any) {
          console.warn('⚠️ [sendBevestigingEmail] Exception fetching contract data (non-critical):', contractFetchError.message)
          // Continue without contract data
        }
      } else {
        console.log('⚠️ [sendBevestigingEmail] No contract_id found, skipping contract data fetch')
      }
      
    } catch (fetchError: any) {
      console.error('❌ [sendBevestigingEmail] Exception during fetch:', {
        message: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name,
      })
      throw fetchError
    }
    
    if (!aanvraag) {
      console.error('❌ [sendBevestigingEmail] Aanvraag is null after fetch')
      throw new Error('Aanvraag niet gevonden (null na fetch)')
    }
    
    console.log('✅ [sendBevestigingEmail] All data fetched successfully')

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

    // Calculate costs - try to get from verbruik_data first, otherwise calculate from contract details
    let maandbedrag = verbruikData?.maandbedrag || 0
    let jaarbedrag = verbruikData?.jaarbedrag || 0
    
    // If maandbedrag/jaarbedrag not in verbruik_data, try to calculate from contract details
    if ((!maandbedrag || maandbedrag === 0) && contract) {
      console.log('📧 [sendBevestigingEmail] Calculating costs from contract details...')
      
      // Fetch contract details if not already available
      let contractDetails: any = null
      if (contract.type === 'vast') {
        const { data: details } = await supabase
          .from('contract_details_vast')
          .select('*')
          .eq('contract_id', contract.id)
          .single()
        contractDetails = details
      } else if (contract.type === 'dynamisch') {
        const { data: details } = await supabase
          .from('contract_details_dynamisch')
          .select('*')
          .eq('contract_id', contract.id)
          .single()
        contractDetails = details
      } else if (contract.type === 'maatwerk') {
        const { data: details } = await supabase
          .from('contract_details_maatwerk')
          .select('*')
          .eq('contract_id', contract.id)
          .single()
        contractDetails = details
      }
      
      if (contractDetails) {
        // Simple calculation: leverancier costs + estimated taxes/netbeheer
        const terugleveringJaar = verbruikData?.terugleveringJaar || 0
        let nettoElektriciteitNormaal = elektriciteitNormaal
        let nettoElektriciteitDal = elektriciteitDal
        
        // Saldering
        if (terugleveringJaar > 0) {
          if (heeftEnkeleMeter) {
            const totaalElektriciteit = elektriciteitNormaal + elektriciteitDal
            const saldering = Math.min(totaalElektriciteit, terugleveringJaar)
            nettoElektriciteitNormaal = Math.max(0, totaalElektriciteit - saldering)
            nettoElektriciteitDal = 0
          } else {
            const totaalElektriciteit = elektriciteitNormaal + elektriciteitDal
            const saldering = Math.min(totaalElektriciteit, terugleveringJaar)
            const salderingRatio = totaalElektriciteit > 0 ? saldering / totaalElektriciteit : 0
            nettoElektriciteitNormaal = Math.max(0, elektriciteitNormaal * (1 - salderingRatio))
            nettoElektriciteitDal = Math.max(0, elektriciteitDal * (1 - salderingRatio))
          }
        }
        
        // Calculate leverancier costs
        let leverancierKosten = 0
        if (contract.type === 'vast' || contract.type === 'maatwerk') {
          if (heeftEnkeleMeter && contractDetails.tarief_elektriciteit_enkel) {
            leverancierKosten = (nettoElektriciteitNormaal * contractDetails.tarief_elektriciteit_enkel) +
                              (gasJaar * (contractDetails.tarief_gas || 0))
          } else {
            leverancierKosten = (nettoElektriciteitNormaal * (contractDetails.tarief_elektriciteit_normaal || 0)) +
                              (nettoElektriciteitDal * (contractDetails.tarief_elektriciteit_dal || 0)) +
                              (gasJaar * (contractDetails.tarief_gas || 0))
          }
          
          // Add teruglevering costs if applicable
          if (terugleveringJaar > 0 && contractDetails.tarief_teruglevering_kwh) {
            const overschot = Math.max(0, terugleveringJaar - (elektriciteitNormaal + elektriciteitDal))
            leverancierKosten += overschot * contractDetails.tarief_teruglevering_kwh
          }
          
          // Add vastrecht
          const vastrechtJaar = ((contractDetails.vastrecht_stroom_maand || contractDetails.vaste_kosten_maand || 4) * 12) +
                                ((contractDetails.vastrecht_gas_maand || 0) * 12)
          leverancierKosten += vastrechtJaar
        } else if (contract.type === 'dynamisch') {
          // For dynamic contracts, use estimated market prices + opslag
          const marktPrijsElektriciteit = 0.20
          const marktPrijsGas = 0.80
          leverancierKosten = (nettoElektriciteitNormaal * (marktPrijsElektriciteit + (contractDetails.opslag_elektriciteit_normaal || contractDetails.opslag_elektriciteit || 0))) +
                            (nettoElektriciteitDal * (marktPrijsElektriciteit + (contractDetails.opslag_elektriciteit_dal || contractDetails.opslag_elektriciteit || 0))) +
                            (gasJaar * (marktPrijsGas + (contractDetails.opslag_gas || 0)))
          
          const vastrechtJaar = ((contractDetails.vastrecht_stroom_maand || contractDetails.vaste_kosten_maand || 4) * 12) +
                                ((contractDetails.vastrecht_gas_maand || 0) * 12)
          leverancierKosten += vastrechtJaar
        }
        
        // Add estimated taxes and netbeheer (simplified)
        const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
        const ebElektriciteit = totaalElektriciteit * 0.10154
        const ebGas = gasJaar * 0.57816
        const vermindering = 524.95
        
        // Netbeheerkosten (simplified - using default values)
        let netbeheerElektriciteit = 430.00
        let netbeheerGas = gasJaar > 0 ? 245.00 : 0
        
        // Check for grootverbruik
        const { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } = await import('@/lib/verbruik-type')
        if (aansluitwaarden.elektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaarden.elektriciteit)) {
          netbeheerElektriciteit = 0
        }
        if (aansluitwaarden.gas && isGrootverbruikGasAansluitwaarde(aansluitwaarden.gas)) {
          netbeheerGas = 0
        }
        
        const netbeheerKosten = netbeheerElektriciteit + netbeheerGas
        const extraKosten = ebElektriciteit + ebGas - vermindering + netbeheerKosten
        
        jaarbedrag = Math.round(leverancierKosten + extraKosten)
        maandbedrag = Math.round(jaarbedrag / 12)
        
        console.log('📧 [sendBevestigingEmail] Calculated costs:', { maandbedrag, jaarbedrag })
      }
    }
    
    // Fallback if still 0
    if (!maandbedrag || maandbedrag === 0) {
      jaarbedrag = maandbedrag * 12
    } else if (!jaarbedrag || jaarbedrag === 0) {
      jaarbedrag = maandbedrag * 12
    }
    
    const besparing = verbruikData?.besparing

    // Generate contract viewer URL
    // IMPORTANT: Use the current production domain (pakketadvies.vercel.app)
    // Later when www.pakketadvies.nl is connected, set NEXT_PUBLIC_BASE_URL to that domain
    // VERCEL_URL is the preview deployment URL (e.g., pakketadvies-website-xxx.vercel.app)
    // We want the production Vercel URL (pakketadvies.vercel.app) for customer emails
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    
    // If NEXT_PUBLIC_BASE_URL is not set, use current production Vercel domain
    if (!baseUrl) {
      baseUrl = 'https://pakketadvies.vercel.app'
    }
    
    // Safety check: if baseUrl contains a preview deployment pattern (random hash), use production Vercel URL
    // Pattern: pakketadvies-website-XXXXX.vercel.app (preview) vs pakketadvies.vercel.app (production)
    if (baseUrl.includes('-') && baseUrl.includes('.vercel.app') && !baseUrl.includes('pakketadvies.vercel.app')) {
      console.warn('⚠️ [sendBevestigingEmail] Detected preview deployment URL, using production Vercel URL instead')
      baseUrl = 'https://pakketadvies.vercel.app'
    }
    
    console.log('📧 [sendBevestigingEmail] Base URL for contract viewer:', baseUrl)
    console.log('📧 [sendBevestigingEmail] VERCEL_URL (preview, not used):', process.env.VERCEL_URL)
    console.log('📧 [sendBevestigingEmail] NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)
    
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
    
    // Use environment variable for from address, fallback to Resend test domain
    // IMPORTANT: For production, verify pakketadvies.nl domain in Resend and set RESEND_FROM_EMAIL
    // Trim and clean the from email to remove any extra quotes, whitespace, or newlines
    let fromEmail = (process.env.RESEND_FROM_EMAIL || 'PakketAdvies <onboarding@resend.dev>')
      .trim()
      .replace(/\n/g, '') // Remove newlines
      .replace(/\r/g, '') // Remove carriage returns
    // Remove surrounding quotes if present
    if ((fromEmail.startsWith('"') && fromEmail.endsWith('"')) || 
        (fromEmail.startsWith("'") && fromEmail.endsWith("'"))) {
      fromEmail = fromEmail.slice(1, -1).trim()
    }
    
    // Validate format: should be either "email@domain.com" or "Name <email@domain.com>"
    const emailRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/
    const nameEmailRegex = /^[^<>]+\s*<[^\s<>]+@[^\s<>]+\.[^\s<>]+>$/
    
    if (!emailRegex.test(fromEmail) && !nameEmailRegex.test(fromEmail)) {
      console.error('❌ [sendBevestigingEmail] Invalid from email format:', fromEmail)
      console.error('❌ [sendBevestigingEmail] Expected format: "email@domain.com" or "Name <email@domain.com>"')
      // Fallback to test domain if format is invalid
      fromEmail = 'PakketAdvies <onboarding@resend.dev>'
      console.warn('⚠️ [sendBevestigingEmail] Using fallback from email:', fromEmail)
    }
    
    console.log('📧 [sendBevestigingEmail] From email (raw env):', JSON.stringify(process.env.RESEND_FROM_EMAIL))
    console.log('📧 [sendBevestigingEmail] From email (cleaned):', fromEmail)
    
    let emailResult: any
    let emailError: any
    
    try {
      const result = await resend.emails.send({
        from: fromEmail,
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

