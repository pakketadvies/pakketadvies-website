import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Contract } from '@/types/admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the original contract with all details
    const { data: contract, error: contractError } = await supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('id', id)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { success: false, error: 'Contract niet gevonden' },
        { status: 404 }
      )
    }

    // Create new contract with "Kopie van" prefix
    const newContractData = {
      leverancier_id: contract.leverancier_id,
      naam: `Kopie van ${contract.naam}`,
      type: contract.type,
      beschrijving: contract.beschrijving,
      actief: false, // Set inactive by default for safety
      aanbevolen: false, // Reset flags
      populair: false,
      volgorde: contract.volgorde,
      zichtbaar_bij_teruglevering: contract.zichtbaar_bij_teruglevering,
      target_audience: contract.target_audience,
      tonen_op_homepage: false, // Don't show on homepage by default
    }

    const { data: newContract, error: insertError } = await supabase
      .from('contracten')
      .insert(newContractData)
      .select()
      .single()

    if (insertError || !newContract) {
      return NextResponse.json(
        { success: false, error: 'Fout bij aanmaken contract: ' + insertError?.message },
        { status: 500 }
      )
    }

    // Copy type-specific details
    if (contract.type === 'vast') {
      const { data: details } = await supabase
        .from('contract_details_vast')
        .select('*')
        .eq('contract_id', id)
        .single()

      if (details) {
        const { error: detailsError } = await supabase
          .from('contract_details_vast')
          .insert({
            contract_id: newContract.id,
            looptijd: details.looptijd,
            tarief_elektriciteit_enkel: details.tarief_elektriciteit_enkel,
            tarief_elektriciteit_normaal: details.tarief_elektriciteit_normaal,
            tarief_elektriciteit_dal: details.tarief_elektriciteit_dal,
            tarief_gas: details.tarief_gas,
            tarief_teruglevering_kwh: details.tarief_teruglevering_kwh,
            vastrecht_stroom_maand: details.vastrecht_stroom_maand,
            vastrecht_gas_maand: details.vastrecht_gas_maand,
            vaste_kosten_maand: details.vaste_kosten_maand,
            groene_energie: details.groene_energie,
            prijsgarantie: details.prijsgarantie,
            opzegtermijn: details.opzegtermijn,
            verbruik_type: details.verbruik_type,
            voorwaarden: details.voorwaarden,
            bijzonderheden: details.bijzonderheden,
            rating: details.rating,
            aantal_reviews: details.aantal_reviews,
          })

        if (detailsError) {
          // Rollback: delete the contract if details insert fails
          await supabase.from('contracten').delete().eq('id', newContract.id)
          return NextResponse.json(
            { success: false, error: 'Fout bij kopiëren details: ' + detailsError.message },
            { status: 500 }
          )
        }
      }
    } else if (contract.type === 'dynamisch') {
      const { data: details } = await supabase
        .from('contract_details_dynamisch')
        .select('*')
        .eq('contract_id', id)
        .single()

      if (details) {
        const { error: detailsError } = await supabase
          .from('contract_details_dynamisch')
          .insert({
            contract_id: newContract.id,
            opslag_elektriciteit: details.opslag_elektriciteit,
            opslag_gas: details.opslag_gas,
            opslag_teruglevering: details.opslag_teruglevering,
            vastrecht_stroom_maand: details.vastrecht_stroom_maand,
            vastrecht_gas_maand: details.vastrecht_gas_maand,
            index_naam: details.index_naam,
            max_prijs_cap: details.max_prijs_cap,
            groene_energie: details.groene_energie,
            opzegtermijn: details.opzegtermijn,
            verbruik_type: details.verbruik_type,
            voorwaarden: details.voorwaarden,
            bijzonderheden: details.bijzonderheden,
            rating: details.rating,
            aantal_reviews: details.aantal_reviews,
          })

        if (detailsError) {
          await supabase.from('contracten').delete().eq('id', newContract.id)
          return NextResponse.json(
            { success: false, error: 'Fout bij kopiëren details: ' + detailsError.message },
            { status: 500 }
          )
        }
      }
    } else if (contract.type === 'maatwerk') {
      const { data: details } = await supabase
        .from('contract_details_maatwerk')
        .select('*')
        .eq('contract_id', id)
        .single()

      if (details) {
        const { error: detailsError } = await supabase
          .from('contract_details_maatwerk')
          .insert({
            contract_id: newContract.id,
            looptijd: details.looptijd,
            tarief_elektriciteit_enkel: details.tarief_elektriciteit_enkel,
            tarief_elektriciteit_normaal: details.tarief_elektriciteit_normaal,
            tarief_elektriciteit_dal: details.tarief_elektriciteit_dal,
            tarief_gas: details.tarief_gas,
            tarief_teruglevering_kwh: details.tarief_teruglevering_kwh,
            vastrecht_stroom_maand: details.vastrecht_stroom_maand,
            vastrecht_gas_maand: details.vastrecht_gas_maand,
            vaste_kosten_maand: details.vaste_kosten_maand,
            groene_energie: details.groene_energie,
            prijsgarantie: details.prijsgarantie,
            opzegtermijn: details.opzegtermijn,
            verbruik_type: details.verbruik_type,
            min_verbruik_elektriciteit: details.min_verbruik_elektriciteit,
            min_verbruik_gas: details.min_verbruik_gas,
            custom_tekst: details.custom_tekst,
            contact_email: details.contact_email,
            contact_telefoon: details.contact_telefoon,
            voorwaarden: details.voorwaarden,
            bijzonderheden: details.bijzonderheden,
            rating: details.rating,
            aantal_reviews: details.aantal_reviews,
          })

        if (detailsError) {
          await supabase.from('contracten').delete().eq('id', newContract.id)
          return NextResponse.json(
            { success: false, error: 'Fout bij kopiëren details: ' + detailsError.message },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      contractId: newContract.id,
      message: 'Contract succesvol gedupliceerd',
    })
  } catch (error: any) {
    console.error('Duplicate contract error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Onbekende fout' },
      { status: 500 }
    )
  }
}

