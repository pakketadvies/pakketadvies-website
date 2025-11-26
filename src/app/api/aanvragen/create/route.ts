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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
    
    return NextResponse.json<CreateAanvraagResponse>({
      success: true,
      aanvraag: data,
      aanvraagnummer,
    })
  } catch (error: any) {
    console.error('Unexpected error in create aanvraag:', error)
    return NextResponse.json<CreateAanvraagResponse>(
      { success: false, error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

