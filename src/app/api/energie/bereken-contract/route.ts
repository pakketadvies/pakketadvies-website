import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { converteerGasAansluitwaardeVoorDatabase } from '@/lib/aansluitwaarde-schatting'

/**
 * POST /api/energie/bereken-contract
 * 
 * Berekent de VOLLEDIGE energiekosten voor een specifiek contract inclusief:
 * - Leverancierstarieven
 * - Energiebelasting (correct gestaffeld)
 * - Netbeheerkosten (per netbeheerder + aansluitwaarde)
 * - EB vermindering
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      // Verbruik
      elektriciteitNormaal,
      elektriciteitDal,
      gas,
      
      // Aansluitwaarden
      aansluitwaardeElektriciteit,
      aansluitwaardeGas,
      
      // Postcode (voor netbeheerder lookup)
      postcode,
      
      // Contract details
      contractType,
      tariefElektriciteitNormaal,
      tariefElektriciteitDal,
      tariefElektriciteitEnkel,
      tariefGas,
      vastrechtMaand,
      heeftDubbeleMeter,
    } = body
    
    // Validatie
    if (!elektriciteitNormaal || !postcode || !aansluitwaardeElektriciteit) {
      return NextResponse.json(
        { error: 'Ontbrekende verplichte velden' },
        { status: 400 }
      )
    }
    
    const supabase = await createClient()
    const totaalElektriciteit = elektriciteitNormaal + (elektriciteitDal || 0)
    const totaalGas = gas || 0
    
    // 1. NETBEHEERDER LOOKUP op basis van postcode
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()
    const { data: postcodeData, error: postcodeError } = await supabase
      .from('postcode_netbeheerders')
      .select('netbeheerder_id')
      .lte('postcode_van', cleanedPostcode)
      .gte('postcode_tot', cleanedPostcode)
      .limit(1)
      .single()
    
    if (postcodeError || !postcodeData) {
      console.error('Netbeheerder lookup failed:', postcodeError)
      return NextResponse.json(
        { error: 'Netbeheerder niet gevonden voor deze postcode' },
        { status: 404 }
      )
    }
    
    const netbeheerderId = postcodeData.netbeheerder_id
    
    // Haal netbeheerder naam op
    const { data: netbeheerderData } = await supabase
      .from('netbeheerders')
      .select('naam')
      .eq('id', netbeheerderId)
      .single()
    
    const netbeheerderNaam = netbeheerderData?.naam || 'Onbekend'
    
    // 2. OVERHEIDSTARIEVEN 2025
    const { data: overheidsTarieven, error: tarievenError } = await supabase
      .from('tarieven_overheid')
      .select('*')
      .eq('jaar', 2025)
      .eq('actief', true)
      .single()
    
    if (tarievenError || !overheidsTarieven) {
      console.error('Overheidstarieven niet gevonden:', tarievenError)
      return NextResponse.json(
        { error: 'Energiebelasting tarieven niet gevonden voor 2025' },
        { status: 404 }
      )
    }
    
    // 3. NETBEHEERTARIEVEN ophalen
    console.log('🔍 Zoek netbeheertarief elektriciteit:', {
      netbeheerderId,
      aansluitwaarde: aansluitwaardeElektriciteit
    })
    
    // STAP 1: Haal eerst de aansluitwaarde_id op
    const { data: elektraAansluitwaarde, error: elektraAansluitwaardeError } = await supabase
      .from('aansluitwaarden_elektriciteit')
      .select('id')
      .eq('code', aansluitwaardeElektriciteit)
      .single()
    
    if (elektraAansluitwaardeError || !elektraAansluitwaarde) {
      console.error('❌ Aansluitwaarde elektriciteit niet gevonden:', aansluitwaardeElektriciteit, elektraAansluitwaardeError)
      return NextResponse.json(
        { error: `Ongeldige aansluitwaarde elektriciteit: ${aansluitwaardeElektriciteit}` },
        { status: 400 }
      )
    }
    
    // STAP 2: Haal tarief op met aansluitwaarde_id
    const { data: elektriciteitTarief, error: elektraError } = await supabase
      .from('netbeheer_tarieven_elektriciteit')
      .select('all_in_tarief_jaar')
      .eq('netbeheerder_id', netbeheerderId)
      .eq('jaar', 2025)
      .eq('actief', true)
      .eq('aansluitwaarde_id', elektraAansluitwaarde.id)
      .single()
    
    console.log('📊 Netbeheertarief elektriciteit result:', {
      aansluitwaardeId: elektraAansluitwaarde.id,
      data: elektriciteitTarief,
      error: elektraError
    })
    
    let netbeheerElektriciteit = elektriciteitTarief?.all_in_tarief_jaar || 0
    if (elektraError || !elektriciteitTarief) {
      console.error(`❌ KRITIEKE FOUT: Geen netbeheertarief elektriciteit gevonden voor ${aansluitwaardeElektriciteit}:`, elektraError)
      console.error('   Netbeheerder:', netbeheerderId)
      console.error('   Aansluitwaarde ID:', elektraAansluitwaarde.id)
      console.error('   Dit betekent dat de database nog niet correct is gevuld!')
      // Fallback naar gemiddelde
      netbeheerElektriciteit = 430
    }
    
    console.log('🔍 Zoek netbeheertarief gas:', {
      netbeheerderId,
      aansluitwaardeInput: aansluitwaardeGas,
      gasVerbruik: totaalGas
    })
    
    // Converteer G6 naar de juiste variant op basis van verbruik
    const gasAansluitwaardeVoorDatabase = aansluitwaardeGas 
      ? converteerGasAansluitwaardeVoorDatabase(aansluitwaardeGas, totaalGas)
      : converteerGasAansluitwaardeVoorDatabase('G6', totaalGas)
    
    console.log('🔄 Gas aansluitwaarde conversie:', {
      origineel: aansluitwaardeGas || 'G6',
      geconverteerd: gasAansluitwaardeVoorDatabase
    })
    
    // STAP 1: Haal eerst de aansluitwaarde_id op
    const { data: gasAansluitwaarde, error: gasAansluitwaardeError } = await supabase
      .from('aansluitwaarden_gas')
      .select('id')
      .eq('code', gasAansluitwaardeVoorDatabase)
      .single()
    
    if (gasAansluitwaardeError || !gasAansluitwaarde) {
      console.error('❌ Aansluitwaarde gas niet gevonden:', gasAansluitwaardeVoorDatabase, gasAansluitwaardeError)
      // Voor gas is het OK als er geen aansluiting is
      if (totaalGas === 0) {
        console.log('   Gas verbruik is 0, geen probleem')
      } else {
        return NextResponse.json(
          { error: `Ongeldige aansluitwaarde gas: ${gasAansluitwaardeVoorDatabase}` },
          { status: 400 }
        )
      }
    }
    
    // STAP 2: Haal tarief op met aansluitwaarde_id (alleen als we gas hebben)
    let netbeheerGas = 0
    if (totaalGas > 0 && gasAansluitwaarde) {
      const { data: gasTarief, error: gasError } = await supabase
        .from('netbeheer_tarieven_gas')
        .select('all_in_tarief_jaar')
        .eq('netbeheerder_id', netbeheerderId)
        .eq('jaar', 2025)
        .eq('actief', true)
        .eq('aansluitwaarde_id', gasAansluitwaarde.id)
        .single()
      
      console.log('📊 Netbeheertarief gas result:', {
        aansluitwaardeId: gasAansluitwaarde.id,
        data: gasTarief,
        error: gasError
      })
      
      netbeheerGas = gasTarief?.all_in_tarief_jaar || 0
      if (gasError || !gasTarief) {
        console.error(`❌ KRITIEKE FOUT: Geen netbeheertarief gas gevonden voor ${gasAansluitwaardeVoorDatabase}:`, gasError)
        console.error('   Netbeheerder:', netbeheerderId)
        console.error('   Aansluitwaarde ID:', gasAansluitwaarde.id)
        console.error('   Dit betekent dat de database nog niet correct is gevuld!')
        // Fallback naar gemiddelde
        netbeheerGas = 245
      }
    }
    
    console.log('💰 Netbeheerkosten totaal:', {
      elektriciteit: netbeheerElektriciteit,
      gas: netbeheerGas,
      totaal: netbeheerElektriciteit + netbeheerGas
    })
    
    // 4. LEVERANCIERSKOSTEN BEREKENEN
    let kostenElektriciteit = 0
    if (heeftDubbeleMeter && tariefElektriciteitNormaal && tariefElektriciteitDal) {
      kostenElektriciteit = 
        (elektriciteitNormaal * tariefElektriciteitNormaal) +
        ((elektriciteitDal || 0) * tariefElektriciteitDal)
    } else if (tariefElektriciteitEnkel) {
      kostenElektriciteit = totaalElektriciteit * tariefElektriciteitEnkel
    } else if (tariefElektriciteitNormaal) {
      // Fallback: gebruik normaal tarief voor alles
      kostenElektriciteit = totaalElektriciteit * tariefElektriciteitNormaal
    }
    
    const kostenGas = totaalGas * (tariefGas || 0)
    
    // Vastrecht: €8.25/maand voor STROOM + €8.25/maand voor GAS (alleen als er gas is)
    // Standaard Sepa: €99/jaar stroom + €99/jaar gas = €198/jaar totaal
    const vastrechtStroom = (vastrechtMaand || 8.25) * 12
    const vastrechtGas = totaalGas > 0 ? (vastrechtMaand || 8.25) * 12 : 0
    const kostenVastrecht = vastrechtStroom + vastrechtGas
    
    const subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht
    
    // 5. ENERGIEBELASTING BEREKENEN (correct gestaffeld)
    // 
    // BELANGRIJK: 
    // - EB STAFFELS worden ALTIJD gebruikt (ongeacht aansluitwaarde)
    // - EB VERMINDERING hangt af van aansluitwaarde (alleen bij ≤ 3x80A)
    //
    // Grootverbruik aansluitwaarde (> 3x80A of > G25): GEEN EB vermindering
    const grootverbruikAansluitwaardenElektra = ['3x100A', '3x125A', '3x160A', '3x200A']
    const isGrootverbruikAansluitwaarde = grootverbruikAansluitwaardenElektra.includes(aansluitwaardeElektriciteit)
    
    // EB STAFFELS ELEKTRICITEIT (ALTIJD 4 staffels gebruiken)
    let ebElektriciteit = 0
    const schijf1Max = overheidsTarieven.eb_elektriciteit_gv_schijf1_max || 2900
    const schijf2Max = overheidsTarieven.eb_elektriciteit_gv_schijf2_max || 10000
    const schijf3Max = overheidsTarieven.eb_elektriciteit_gv_schijf3_max || 50000
    
    if (totaalElektriciteit <= schijf1Max) {
      ebElektriciteit = totaalElektriciteit * overheidsTarieven.eb_elektriciteit_gv_schijf1
    } else if (totaalElektriciteit <= schijf2Max) {
      ebElektriciteit =
        schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1 +
        (totaalElektriciteit - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
    } else if (totaalElektriciteit <= schijf3Max) {
      ebElektriciteit =
        schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1 +
        (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2 +
        (totaalElektriciteit - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
    } else {
      ebElektriciteit =
        schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1 +
        (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2 +
        (schijf3Max - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3 +
        (totaalElektriciteit - schijf3Max) * overheidsTarieven.eb_elektriciteit_gv_schijf4
    }
    
    // Energiebelasting gas (2 schijven)
    let ebGas = 0
    if (totaalGas > 0) {
      const schijf1Max = overheidsTarieven.eb_gas_schijf1_max || 1000
      
      if (totaalGas <= schijf1Max) {
        ebGas = totaalGas * overheidsTarieven.eb_gas_schijf1
      } else {
        ebGas =
          schijf1Max * overheidsTarieven.eb_gas_schijf1 +
          (totaalGas - schijf1Max) * overheidsTarieven.eb_gas_schijf2
      }
    }
    
    // Vermindering EB: ALLEEN bij kleinverbruik AANSLUITWAARDE (niet verbruik!)
    // 3x63A krijgt WEL vermindering (want ≤ 3x80A)
    const verminderingEB = !isGrootverbruikAansluitwaarde 
      ? overheidsTarieven.vermindering_eb_elektriciteit 
      : 0
    
    const subtotaalEnergiebelasting = ebElektriciteit + ebGas - verminderingEB
    
    // 6. NETBEHEERKOSTEN
    const subtotaalNetbeheer = netbeheerElektriciteit + netbeheerGas
    
    // 7. TOTALEN
    const totaalJaarExclBtw = subtotaalLeverancier + subtotaalEnergiebelasting + subtotaalNetbeheer
    const btw = totaalJaarExclBtw * (overheidsTarieven.btw_percentage / 100)
    const totaalJaarInclBtw = totaalJaarExclBtw + btw
    
    const maandbedragExclBtw = totaalJaarExclBtw / 12
    const maandbedragInclBtw = totaalJaarInclBtw / 12
    
    // Return gedetailleerde breakdown
    return NextResponse.json({
      success: true,
      breakdown: {
        leverancier: {
          elektriciteit: kostenElektriciteit,
          gas: kostenGas,
          vastrechtStroom: vastrechtStroom,
          vastrechtGas: vastrechtGas,
          vastrecht: kostenVastrecht,
          subtotaal: subtotaalLeverancier,
        },
        energiebelasting: {
          elektriciteit: ebElektriciteit,
          gas: ebGas,
          vermindering: verminderingEB,
          subtotaal: subtotaalEnergiebelasting,
        },
        netbeheer: {
          elektriciteit: netbeheerElektriciteit,
          gas: netbeheerGas,
          subtotaal: subtotaalNetbeheer,
          netbeheerder: netbeheerderNaam,
        },
        totaal: {
          jaarExclBtw: totaalJaarExclBtw,
          jaarInclBtw: totaalJaarInclBtw,
          maandExclBtw: maandbedragExclBtw,
          maandInclBtw: maandbedragInclBtw,
          btw: btw,
        },
      },
      metadata: {
        verbruik: {
          elektriciteitTotaal: totaalElektriciteit,
          elektriciteitNormaal,
          elektriciteitDal: elektriciteitDal || 0,
          gas: totaalGas,
        },
        aansluitwaarden: {
          elektriciteit: aansluitwaardeElektriciteit,
          gas: aansluitwaardeGas || 'N/A',
        },
        netbeheerder: netbeheerderNaam,
        isGrootverbruik: isGrootverbruikElektriciteit,
      },
    })
    
  } catch (error: any) {
    console.error('Error in energie/bereken-contract:', error)
    return NextResponse.json(
      { error: 'Fout bij berekenen energiekosten', details: error.message },
      { status: 500 }
    )
  }
}

