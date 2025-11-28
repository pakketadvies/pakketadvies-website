import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateAanvraagRequest, CreateAanvraagResponse } from '@/types/aanvragen'

/**
 * POST /api/aanvragen/create
 * 
 * Creates a new contract application (aanvraag) with a unique aanvraagnummer
 * Uses service role key to bypass RLS for public form submissions
 */
export async function POST(request: Request) {
  try {
    const body: CreateAanvraagRequest = await request.json()
    
    // Validatie
    if (!body.contract_id || !body.verbruik_data || !body.gegevens_data) {
      return NextResponse.json<CreateAanvraagResponse>(
        { 
          success: false, 
          error: 'Ontbrekende verplichte velden: contract_id, verbruik_data, gegevens_data' 
        },
        { status: 400 }
      )
    }

    // Use service role key for public inserts (bypasses RLS)
    // This is safe because we validate the data server-side
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json<CreateAanvraagResponse>(
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
    
    // Genereer uniek aanvraagnummer via database functie
    const { data: nummerData, error: nummerError } = await supabase
      .rpc('generate_aanvraagnummer')
    
    let aanvraagnummer: string
    
    if (nummerError || !nummerData) {
      console.error('Error generating aanvraagnummer, using fallback:', nummerError)
      // Fallback: genereer handmatig met timestamp + random
      const jaar = new Date().getFullYear()
      const timestamp = Date.now().toString().slice(-6)
      aanvraagnummer = `PA-${jaar}-${timestamp}`
    } else {
      aanvraagnummer = nummerData as string
    }
    
    // Insert aanvraag
    const { data, error } = await supabase
      .from('contractaanvragen')
      .insert({
        aanvraagnummer,
        contract_id: body.contract_id,
        contract_type: body.contract_type,
        contract_naam: body.contract_naam,
        leverancier_id: body.leverancier_id,
        leverancier_naam: body.leverancier_naam,
        aanvraag_type: body.aanvraag_type,
        status: 'nieuw',
        verbruik_data: body.verbruik_data,
        gegevens_data: body.gegevens_data,
        iban: body.iban,
        rekening_op_andere_naam: body.rekening_op_andere_naam || false,
        rekeninghouder_naam: body.rekeninghouder_naam,
        heeft_verblijfsfunctie: body.heeft_verblijfsfunctie,
        gaat_verhuizen: body.gaat_verhuizen || false,
        wanneer_overstappen: body.wanneer_overstappen,
        contract_einddatum: body.contract_einddatum,
        ingangsdatum: body.ingangsdatum,
        is_klant_bij_leverancier: body.is_klant_bij_leverancier || false,
        herinnering_contract: body.herinnering_contract || false,
        nieuwsbrief: body.nieuwsbrief || false,
        heeft_andere_correspondentie_adres: body.heeft_andere_correspondentie_adres || false,
        correspondentie_adres: body.correspondentie_adres,
      })
      .select()
      .single()
    
    if (error) {
      // Als het een duplicate key error is, probeer opnieuw met een nieuw nummer
      if (error.code === '23505' && error.message.includes('aanvraagnummer')) {
        const jaar = new Date().getFullYear()
        const timestamp = Date.now().toString().slice(-6)
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        aanvraagnummer = `PA-${jaar}-${timestamp}${randomSuffix}`
        
        // Retry insert
        const { data: retryData, error: retryError } = await supabase
          .from('contractaanvragen')
          .insert({
            aanvraagnummer,
            contract_id: body.contract_id,
            contract_type: body.contract_type,
            contract_naam: body.contract_naam,
            leverancier_id: body.leverancier_id,
            leverancier_naam: body.leverancier_naam,
            aanvraag_type: body.aanvraag_type,
            status: 'nieuw',
            verbruik_data: body.verbruik_data,
            gegevens_data: body.gegevens_data,
            iban: body.iban,
            rekening_op_andere_naam: body.rekening_op_andere_naam || false,
            rekeninghouder_naam: body.rekeninghouder_naam,
            heeft_verblijfsfunctie: body.heeft_verblijfsfunctie,
            gaat_verhuizen: body.gaat_verhuizen || false,
            wanneer_overstappen: body.wanneer_overstappen,
            contract_einddatum: body.contract_einddatum,
            ingangsdatum: body.ingangsdatum,
            is_klant_bij_leverancier: body.is_klant_bij_leverancier || false,
            herinnering_contract: body.herinnering_contract || false,
            nieuwsbrief: body.nieuwsbrief || false,
            heeft_andere_correspondentie_adres: body.heeft_andere_correspondentie_adres || false,
            correspondentie_adres: body.correspondentie_adres,
          })
          .select()
          .single()
        
        if (retryError) {
          console.error('Error creating aanvraag (retry):', retryError)
          return NextResponse.json<CreateAanvraagResponse>(
            { success: false, error: 'Fout bij opslaan aanvraag: ' + retryError.message },
            { status: 500 }
          )
        }
        
        // Send confirmation email (fire and forget)
        ;(async () => {
          try {
            const { sendBevestigingEmail } = await import('@/lib/send-email-internal')
            console.log('📧 [create-retry] Triggering email send for aanvraag:', retryData.id, 'aanvraagnummer:', aanvraagnummer)
            await sendBevestigingEmail(retryData.id, aanvraagnummer)
            console.log('✅ [create-retry] Email sent successfully')
          } catch (error: any) {
            console.error('❌ [create-retry] Error sending confirmation email (non-blocking):', error)
          }
        })()

        return NextResponse.json<CreateAanvraagResponse>({
          success: true,
          aanvraag: retryData,
          aanvraagnummer,
        })
      }
      
      console.error('Error creating aanvraag:', error)
      return NextResponse.json<CreateAanvraagResponse>(
        { success: false, error: 'Fout bij opslaan aanvraag: ' + error.message },
        { status: 500 }
      )
    }
    
    // Send confirmation email synchronously and return logs to client
    const emailLogs: string[] = []
    const logToClient = (message: string) => {
      console.log(message)
      emailLogs.push(message)
    }

    logToClient('📧 [create] Triggering email send for aanvraag: ' + data.id + ' aanvraagnummer: ' + aanvraagnummer)
    
    let emailSuccess = false
    let emailError: any = null
    
    try {
      logToClient('📧 [create] Starting email send process...')
      const { sendBevestigingEmail } = await import('@/lib/send-email-internal')
      logToClient('📧 [create] Email function imported, calling sendBevestigingEmail...')
      
      // Override console.log in email function to capture logs
      const originalConsoleLog = console.log
      const originalConsoleError = console.error
      const originalConsoleWarn = console.warn
      
      console.log = (...args: any[]) => {
        originalConsoleLog(...args)
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        emailLogs.push(message)
      }
      
      console.error = (...args: any[]) => {
        originalConsoleError(...args)
        const message = '❌ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        emailLogs.push(message)
      }
      
      console.warn = (...args: any[]) => {
        originalConsoleWarn(...args)
        const message = '⚠️ ' + args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
        emailLogs.push(message)
      }
      
      try {
        const result = await sendBevestigingEmail(data.id, aanvraagnummer)
        emailSuccess = true
        logToClient('✅ [create] Email sent successfully for aanvraag: ' + data.id + ' Result: ' + JSON.stringify(result))
      } finally {
        // Restore original console functions
        console.log = originalConsoleLog
        console.error = originalConsoleError
        console.warn = originalConsoleWarn
      }
    } catch (error: any) {
      emailError = error
      logToClient('❌ [create] Error sending confirmation email: ' + error?.message)
      logToClient('❌ [create] Error details: ' + JSON.stringify({
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        code: error?.code,
        statusCode: error?.statusCode,
        cause: error?.cause,
      }, null, 2))
    }

    return NextResponse.json<CreateAanvraagResponse>({
      success: true,
      aanvraag: data,
      aanvraagnummer,
      emailLogs: emailLogs.length > 0 ? emailLogs : undefined,
      emailSuccess,
      emailError: emailError ? {
        message: emailError?.message,
        stack: emailError?.stack,
        name: emailError?.name,
      } : undefined,
    })
  } catch (error: any) {
    console.error('Unexpected error in create aanvraag:', error)
    return NextResponse.json<CreateAanvraagResponse>(
      { success: false, error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

