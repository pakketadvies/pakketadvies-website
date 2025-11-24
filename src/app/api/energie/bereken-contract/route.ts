import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { converteerGasAansluitwaardeVoorDatabase } from '@/lib/aansluitwaarde-schatting'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'
import { calculateDynamicContract } from '@/lib/dynamic-pricing/calculate-dynamic-contract'

/**
 * POST /api/energie/bereken-contract
 * 
 * Berekent de VOLLEDIGE energiekosten voor een specifiek contract inclusief:
 * - Leverancierstarieven (vast OF dynamisch)
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
      terugleveringJaar, // NIEUW: voor salderingsregeling
      
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
      tariefTerugleveringKwh, // NIEUW: kosten voor teruglevering (alleen vast)
      // Dynamische contract opslagen
      opslagElektriciteit, // Opslag stroom voor dynamisch (was: opslag_elektriciteit_normaal)
      opslagGas, // Opslag gas voor dynamisch
      opslagTeruglevering, // Opslag teruglevering voor dynamisch
      vastrechtStroomMaand,
      vastrechtGasMaand,
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
    
    const terugleveringKwh = terugleveringJaar || 0
    const totaalGas = gas || 0
    const isDynamisch = contractType === 'dynamisch'
    
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
    
    // ============================================
    // 4. LEVERANCIERSKOSTEN BEREKENEN
    // ============================================
    // Variables die we nodig hebben voor beide paden
    let kostenElektriciteit = 0
    let kostenGas = 0
    let nettoKwh = 0 // Voor energiebelasting (na saldering)
    let overschotKwh = 0 // Overschot teruglevering (alleen dynamisch)
    let opbrengstOverschot = 0 // Opbrengst van overschot (alleen dynamisch)
    let kostenTeruglevering = 0 // Terugleverkosten (alleen vast)
    let elektriciteitBreakdown: any = {}
    let gasBreakdown: any | null = null
    let terugleveringBreakdown: any | null = null
    
    if (isDynamisch) {
      // ============================================
      // DYNAMISCH CONTRACT BEREKENING
      // ============================================
      console.log('💱 DYNAMISCH CONTRACT - Berekenen met marktprijzen...')
      
      try {
        const dynamicPricesData = await getCurrentDynamicPrices()
        
        // Converteren naar het formaat dat de helper functie verwacht
        const dynamicPrices = {
          elektriciteit_gemiddeld_dag: dynamicPricesData.electricityDay,
          elektriciteit_gemiddeld_nacht: dynamicPricesData.electricityNight,
          gas_gemiddeld: dynamicPricesData.gas,
        }
        
        console.log('✅ Marktprijzen opgehaald (30-dagen gemiddelde):', {
          dag: dynamicPrices.elektriciteit_gemiddeld_dag.toFixed(5),
          nacht: dynamicPrices.elektriciteit_gemiddeld_nacht.toFixed(5),
          gas: dynamicPrices.gas_gemiddeld.toFixed(5),
          source: dynamicPricesData.source,
          note: 'Elektriciteit en Gas = 30-dagen gemiddelde',
        })
        
        // Gebruik helper functie voor berekening
        const result = calculateDynamicContract({
          elektriciteitNormaal,
          elektriciteitDal,
          gas,
          terugleveringJaar: terugleveringKwh,
          heeftDubbeleMeter,
          opslagElektriciteit: opslagElektriciteit || 0,
          opslagGas,
          opslagTeruglevering,
          dynamicPrices,
          vastrechtStroomMaand: vastrechtStroomMaand || 4.00,
          vastrechtGasMaand,
        })
        
        kostenElektriciteit = result.kostenElektriciteit
        kostenGas = result.kostenGas
        nettoKwh = result.nettoKwh
        overschotKwh = result.overschotKwh
        opbrengstOverschot = result.opbrengstOverschot
        elektriciteitBreakdown = result.elektriciteitBreakdown
        gasBreakdown = result.gasBreakdown
        terugleveringBreakdown = result.terugleveringBreakdown
        
        console.log('📊 Dynamisch contract berekening:', {
          kostenElektriciteit,
          kostenGas,
          nettoKwh,
          overschotKwh,
          opbrengstOverschot,
        })
      } catch (error) {
        console.error('❌ Kon dynamische contract niet berekenen:', error)
        return NextResponse.json(
          { error: 'Kon dynamische prijzen niet ophalen. Probeer het later opnieuw.' },
          { status: 500 }
        )
      }
    } else {
    
      // ============================================
      // VAST CONTRACT BEREKENING
      // ============================================
      console.log('📋 VAST CONTRACT - Berekenen met vaste tarieven...')
      
      // SALDERINGSREGELING voor vaste contracten
      let nettoElektriciteitNormaal = elektriciteitNormaal
      let nettoElektriciteitDal = elektriciteitDal || 0
      
      if (terugleveringKwh > 0) {
        if (!heeftDubbeleMeter) {
          // ENKELE METER: Teruglevering volledig aftrekken van totaal verbruik
          const totaalVerbruik = elektriciteitNormaal
          nettoElektriciteitNormaal = Math.max(0, totaalVerbruik - terugleveringKwh)
          nettoKwh = nettoElektriciteitNormaal
        } else {
          // DUBBELE METER: Teruglevering 50/50 verdelen tussen normaal en dal
          const terugleveringNormaal = terugleveringKwh / 2
          const terugleveringDal = terugleveringKwh / 2
          
          nettoElektriciteitNormaal = Math.max(0, elektriciteitNormaal - terugleveringNormaal)
          nettoElektriciteitDal = Math.max(0, (elektriciteitDal || 0) - terugleveringDal)
          nettoKwh = nettoElektriciteitNormaal + nettoElektriciteitDal
        }
      } else {
        nettoKwh = elektriciteitNormaal + (elektriciteitDal || 0)
      }
      
      // STRICT VALIDATIE: Zorg dat de juiste tarieven beschikbaar zijn
      if (!heeftDubbeleMeter && !tariefElektriciteitEnkel) {
        console.error('❌ FOUT: Enkele meter geselecteerd maar geen enkeltarief beschikbaar!')
        return NextResponse.json(
          { error: 'Enkeltarief niet beschikbaar voor dit contract. Neem contact op met support.' },
          { status: 400 }
        )
      }
      
      if (heeftDubbeleMeter && (!tariefElektriciteitNormaal || !tariefElektriciteitDal)) {
        console.error('❌ FOUT: Dubbele meter geselecteerd maar normaal of dal tarief ontbreekt!')
        return NextResponse.json(
          { error: 'Normaal- en daltarief niet beschikbaar voor dit contract. Neem contact op met support.' },
          { status: 400 }
        )
      }
      
      // BEREKEN LEVERANCIERSKOSTEN
      if (!heeftDubbeleMeter && tariefElektriciteitEnkel) {
        // ENKELE METER: gebruik enkeltarief met NETTO verbruik (na saldering)
        kostenElektriciteit = nettoKwh * tariefElektriciteitEnkel
        
        elektriciteitBreakdown = {
          type: 'enkel',
          enkel: {
            kwh: nettoKwh,
            tarief: tariefElektriciteitEnkel,
            bedrag: kostenElektriciteit
          }
        }
      } else if (heeftDubbeleMeter && tariefElektriciteitNormaal && tariefElektriciteitDal) {
        // DUBBELE METER: gebruik normaal + dal tarieven met NETTO verbruik (na saldering)
        const kostenNormaal = nettoElektriciteitNormaal * tariefElektriciteitNormaal
        const kostenDal = nettoElektriciteitDal * tariefElektriciteitDal
        kostenElektriciteit = kostenNormaal + kostenDal
        
        elektriciteitBreakdown = {
          type: 'dubbel',
          normaal: {
            kwh: nettoElektriciteitNormaal,
            tarief: tariefElektriciteitNormaal,
            bedrag: kostenNormaal
          },
          dal: {
            kwh: nettoElektriciteitDal,
            tarief: tariefElektriciteitDal,
            bedrag: kostenDal
          }
        }
      } else {
        console.error('❌ FOUT: Geen tarieven beschikbaar!')
        return NextResponse.json(
          { error: 'Geen tarieven beschikbaar voor dit contract.' },
          { status: 400 }
        )
      }
      
      // GAS BEREKENING
      kostenGas = totaalGas * (tariefGas || 0)
      gasBreakdown = totaalGas > 0 ? {
        m3: totaalGas,
        tarief: tariefGas || 0,
        bedrag: kostenGas
      } : null
      
      // TERUGLEVERKOSTEN (alleen bij vaste contracten)
      // Deze kosten worden berekend over de VOLLEDIGE teruglevering
      kostenTeruglevering = terugleveringKwh > 0 && tariefTerugleveringKwh 
        ? terugleveringKwh * tariefTerugleveringKwh 
        : 0
      
      terugleveringBreakdown = terugleveringKwh > 0 && tariefTerugleveringKwh ? {
        kwh: terugleveringKwh,
        tarief: tariefTerugleveringKwh,
        bedrag: kostenTeruglevering
      } : null
    }
    
    // VASTRECHT (voor beide types)
    const vastrechtStroom = (vastrechtStroomMaand || 4.00) * 12
    const vastrechtGas = totaalGas > 0 ? (vastrechtGasMaand || 4.00) * 12 : 0
    const kostenVastrecht = vastrechtStroom + vastrechtGas
    
    const subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht + kostenTeruglevering
    
    // 5. ENERGIEBELASTING BEREKENEN (correct gestaffeld)
    // 
    // BELANGRIJK: 
    // - EB wordt berekend over NETTO kWh (na saldering)
    // - EB STAFFELS worden ALTIJD gebruikt (ongeacht aansluitwaarde)
    // - EB VERMINDERING hangt af van aansluitwaarde (alleen bij ≤ 3x80A)
    //
    // Grootverbruik aansluitwaarde (> 3x80A of > G25): GEEN EB vermindering
    const grootverbruikAansluitwaardenElektra = ['3x100A', '3x125A', '3x160A', '3x200A']
    const isGrootverbruikAansluitwaarde = grootverbruikAansluitwaardenElektra.includes(aansluitwaardeElektriciteit)
    
    // EB STAFFELS ELEKTRICITEIT (ALTIJD 4 staffels gebruiken)
    // Gebruik NETTO kWh voor EB berekening (na saldering)
    let ebElektriciteit = 0
    const schijf1Max = overheidsTarieven.eb_elektriciteit_gv_schijf1_max || 2900
    const schijf2Max = overheidsTarieven.eb_elektriciteit_gv_schijf2_max || 10000
    const schijf3Max = overheidsTarieven.eb_elektriciteit_gv_schijf3_max || 50000
    
    // Voor breakdown: track welke staffels zijn gebruikt
    const staffelDetails: any = {}
    
    if (nettoKwh <= schijf1Max) {
      ebElektriciteit = nettoKwh * overheidsTarieven.eb_elektriciteit_gv_schijf1
      staffelDetails.schijf1 = {
        kwh: nettoKwh,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: ebElektriciteit
      }
    } else if (nettoKwh <= schijf2Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (nettoKwh - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      ebElektriciteit = bedrag1 + bedrag2
      
      staffelDetails.schijf1 = {
        kwh: schijf1Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: bedrag1
      }
      staffelDetails.schijf2 = {
        kwh: nettoKwh,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf2,
        bedrag: bedrag2
      }
    } else if (nettoKwh <= schijf3Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (nettoKwh - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
      ebElektriciteit = bedrag1 + bedrag2 + bedrag3
      
      staffelDetails.schijf1 = {
        kwh: schijf1Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: bedrag1
      }
      staffelDetails.schijf2 = {
        kwh: schijf2Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf2,
        bedrag: bedrag2
      }
      staffelDetails.schijf3 = {
        kwh: nettoKwh,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf3,
        bedrag: bedrag3
      }
    } else {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (schijf3Max - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
      const bedrag4 = (nettoKwh - schijf3Max) * overheidsTarieven.eb_elektriciteit_gv_schijf4
      ebElektriciteit = bedrag1 + bedrag2 + bedrag3 + bedrag4
      
      staffelDetails.schijf1 = {
        kwh: schijf1Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: bedrag1
      }
      staffelDetails.schijf2 = {
        kwh: schijf2Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf2,
        bedrag: bedrag2
      }
      staffelDetails.schijf3 = {
        kwh: schijf3Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf3,
        bedrag: bedrag3
      }
      staffelDetails.schijf4 = {
        kwh: nettoKwh,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf4,
        bedrag: bedrag4
      }
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
          elektriciteitDetails: elektriciteitBreakdown,
          gas: kostenGas,
          gasDetails: gasBreakdown,
          teruglevering: kostenTeruglevering,
          terugleveringDetails: terugleveringBreakdown,
          // Dynamisch contract overschot info
          overschotKwh: overschotKwh || 0,
          opbrengstOverschot: opbrengstOverschot || 0,
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
          staffels: staffelDetails,
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
          elektriciteitTotaal: elektriciteitNormaal + (elektriciteitDal || 0),
          elektriciteitNormaal: elektriciteitNormaal,
          elektriciteitDal: elektriciteitDal || 0,
          nettoKwh: nettoKwh, // Na saldering
          overschotKwh: overschotKwh || 0, // Overschot teruglevering (alleen dynamisch)
          gas: totaalGas,
          teruglevering: terugleveringKwh,
        },
        aansluitwaarden: {
          elektriciteit: aansluitwaardeElektriciteit,
          gas: aansluitwaardeGas || 'N/A',
        },
        netbeheerder: netbeheerderNaam,
        isGrootverbruik: isGrootverbruikAansluitwaarde,
        contractType: contractType,
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

