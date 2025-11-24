import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { converteerGasAansluitwaardeVoorDatabase } from '@/lib/aansluitwaarde-schatting'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'

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
      tariefTerugleveringKwh, // NIEUW: kosten voor teruglevering
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
    
    // ============================================
    // STAP 0: SALDERINGSREGELING TOEPASSEN
    // ============================================
    // Als er teruglevering is (zonnepanelen), dan moet dit van het verbruik af
    const terugleveringKwh = terugleveringJaar || 0
    let nettoElektriciteitNormaal = elektriciteitNormaal
    let nettoElektriciteitDal = elektriciteitDal || 0
    
    if (terugleveringKwh > 0) {
      if (!heeftDubbeleMeter) {
        // ENKELE METER: Teruglevering volledig aftrekken van totaal verbruik
        const totaalVerbruik = elektriciteitNormaal
        nettoElektriciteitNormaal = Math.max(0, totaalVerbruik - terugleveringKwh)
        console.log('🔋 Saldering enkele meter:', {
          verbruik: totaalVerbruik,
          teruglevering: terugleveringKwh,
          netto: nettoElektriciteitNormaal
        })
      } else {
        // DUBBELE METER: Teruglevering 50/50 verdelen tussen normaal en dal
        const terugleveringNormaal = terugleveringKwh / 2
        const terugleveringDal = terugleveringKwh / 2
        
        nettoElektriciteitNormaal = Math.max(0, elektriciteitNormaal - terugleveringNormaal)
        nettoElektriciteitDal = Math.max(0, (elektriciteitDal || 0) - terugleveringDal)
        
        console.log('🔋 Saldering dubbele meter:', {
          verbruikNormaal: elektriciteitNormaal,
          verbruikDal: elektriciteitDal || 0,
          teruglevering: terugleveringKwh,
          terugleveringNormaal,
          terugleveringDal,
          nettoNormaal: nettoElektriciteitNormaal,
          nettoDal: nettoElektriciteitDal
        })
      }
    }
    
    const totaalElektriciteit = nettoElektriciteitNormaal + nettoElektriciteitDal
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
    let elektriciteitBreakdown: any = {}
    
    // ============================================
    // DYNAMISCHE CONTRACTEN: MARKTPRIJZEN OPHALEN
    // ============================================
    // Als tarieven zeer laag zijn (< €0.01), dan is het waarschijnlijk een opslag
    // voor een dynamisch contract. We halen dan de actuele marktprijzen op.
    const isDynamisch = contractType === 'dynamisch' || 
                        (tariefElektriciteitNormaal > 0 && tariefElektriciteitNormaal < 0.01) ||
                        (tariefElektriciteitEnkel > 0 && tariefElektriciteitEnkel < 0.01)
    
    let actualElektricityTariff = tariefElektriciteitNormaal
    let actualElektricityTariffDal = tariefElektriciteitDal
    let actualElektricityTariffEnkel = tariefElektriciteitEnkel
    let actualGasTariff = tariefGas
    let dynamicPriceSource = ''
    
    if (isDynamisch) {
      console.log('💱 DYNAMISCH CONTRACT GEDETECTEERD - Ophalen marktprijzen...')
      
      try {
        const dynamicPrices = await getCurrentDynamicPrices()
        
        console.log('✅ Marktprijzen opgehaald:', {
          electricity: dynamicPrices.electricity.toFixed(5),
          electricityDay: dynamicPrices.electricityDay.toFixed(5),
          electricityNight: dynamicPrices.electricityNight.toFixed(5),
          gas: dynamicPrices.gas.toFixed(5),
          source: dynamicPrices.source,
          lastUpdated: dynamicPrices.lastUpdated
        })
        
        // Marktprijs + opslag van leverancier
        actualElektricityTariff = dynamicPrices.electricityDay + (tariefElektriciteitNormaal || 0)
        actualElektricityTariffDal = dynamicPrices.electricityNight + (tariefElektriciteitDal || 0)
        actualElektricityTariffEnkel = dynamicPrices.electricity + (tariefElektriciteitEnkel || 0)
        actualGasTariff = dynamicPrices.gas + (tariefGas || 0)
        dynamicPriceSource = dynamicPrices.source
        
        console.log('📊 Totale tarieven (markt + opslag):', {
          elektriciteitNormaal: actualElektricityTariff.toFixed(5),
          elektriciteitDal: actualElektricityTariffDal.toFixed(5),
          elektriciteitEnkel: actualElektricityTariffEnkel.toFixed(5),
          gas: actualGasTariff.toFixed(5)
        })
      } catch (error) {
        console.error('❌ Kon dynamische prijzen niet ophalen, gebruik vaste tarieven:', error)
        // Fallback: gebruik de oorspronkelijke tarieven (opslag)
      }
    }
    
    console.log('💡 Elektriciteit tarieven ontvangen:', {
      heeftDubbeleMeter,
      isDynamisch,
      tariefElektriciteitEnkel: actualElektricityTariffEnkel,
      tariefElektriciteitNormaal: actualElektricityTariff,
      tariefElektriciteitDal: actualElektricityTariffDal,
      elektriciteitNormaal,
      elektriciteitDal,
      totaalElektriciteit
    })
    
    // STRICT VALIDATIE: Zorg dat de juiste tarieven beschikbaar zijn
    if (!heeftDubbeleMeter && !actualElektricityTariffEnkel) {
      console.error('❌ FOUT: Enkele meter geselecteerd maar geen enkeltarief beschikbaar!', {
        heeftDubbeleMeter,
        tariefElektriciteitEnkel,
        tariefElektriciteitNormaal
      })
      return NextResponse.json(
        { error: 'Enkeltarief niet beschikbaar voor dit contract. Neem contact op met support.' },
        { status: 400 }
      )
    }
    
    if (heeftDubbeleMeter && (!tariefElektriciteitNormaal || !tariefElektriciteitDal)) {
      console.error('❌ FOUT: Dubbele meter geselecteerd maar normaal of dal tarief ontbreekt!', {
        heeftDubbeleMeter,
        tariefElektriciteitNormaal,
        tariefElektriciteitDal
      })
      return NextResponse.json(
        { error: 'Normaal- en daltarief niet beschikbaar voor dit contract. Neem contact op met support.' },
        { status: 400 }
      )
    }
    
    // Prioriteit: Check eerst of het een enkele meter is en enkeltarief gebruikt moet worden
    if (!heeftDubbeleMeter && tariefElektriciteitEnkel) {
      // ENKELE METER: gebruik enkeltarief met NETTO verbruik (na saldering)
      kostenElektriciteit = totaalElektriciteit * tariefElektriciteitEnkel
      
      console.log('✅ Gebruik ENKELTARIEF (na saldering):', {
        kwh: totaalElektriciteit,
        tarief: tariefElektriciteitEnkel,
        kosten: kostenElektriciteit
      })
      
      elektriciteitBreakdown = {
        type: 'enkel',
        enkel: {
          kwh: totaalElektriciteit,
          tarief: tariefElektriciteitEnkel,
          bedrag: kostenElektriciteit
        }
      }
    } else if (heeftDubbeleMeter && tariefElektriciteitNormaal && tariefElektriciteitDal) {
      // DUBBELE METER: gebruik normaal + dal tarieven met NETTO verbruik (na saldering)
      const kostenNormaal = nettoElektriciteitNormaal * tariefElektriciteitNormaal
      const kostenDal = nettoElektriciteitDal * tariefElektriciteitDal
      kostenElektriciteit = kostenNormaal + kostenDal
      
      console.log('✅ Gebruik DUBBEL TARIEF (na saldering):', {
        normaal: { kwh: nettoElektriciteitNormaal, tarief: tariefElektriciteitNormaal, kosten: kostenNormaal },
        dal: { kwh: nettoElektriciteitDal, tarief: tariefElektriciteitDal, kosten: kostenDal },
        totaal: kostenElektriciteit
      })
      
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
    } else if (tariefElektriciteitEnkel) {
      // Fallback 1: gebruik enkeltarief (voor als metertype onbekend is)
      kostenElektriciteit = totaalElektriciteit * tariefElektriciteitEnkel
      
      console.log('⚠️ Fallback ENKELTARIEF (metertype onbekend):', {
        kwh: totaalElektriciteit,
        tarief: tariefElektriciteitEnkel,
        kosten: kostenElektriciteit
      })
      
      elektriciteitBreakdown = {
        type: 'enkel',
        enkel: {
          kwh: totaalElektriciteit,
          tarief: tariefElektriciteitEnkel,
          bedrag: kostenElektriciteit
        }
      }
    } else if (tariefElektriciteitNormaal) {
      // Fallback 2: gebruik normaal tarief voor alles (laatste redmiddel)
      kostenElektriciteit = totaalElektriciteit * tariefElektriciteitNormaal
      
      console.log('⚠️ Fallback NORMAAL TARIEF (laatste redmiddel):', {
        kwh: totaalElektriciteit,
        tarief: tariefElektriciteitNormaal,
        kosten: kostenElektriciteit
      })
      
      elektriciteitBreakdown = {
        type: 'enkel',
        enkel: {
          kwh: totaalElektriciteit,
          tarief: tariefElektriciteitNormaal,
          bedrag: kostenElektriciteit
        }
      }
    } else {
      // Geen enkel tarief beschikbaar - dit zou nooit moeten gebeuren
      console.error('❌ KRITIEKE FOUT: Geen enkele tarief beschikbaar!', {
        tariefElektriciteitEnkel,
        tariefElektriciteitNormaal,
        tariefElektriciteitDal
      })
      return NextResponse.json(
        { error: 'Geen tarieven beschikbaar voor dit contract. Neem contact op met support.' },
        { status: 500 }
      )
    }
    
    const kostenGas = totaalGas * (tariefGas || 0)
    const gasBreakdown = totaalGas > 0 ? {
      m3: totaalGas,
      tarief: tariefGas || 0,
      bedrag: kostenGas
    } : null
    
    // TERUGLEVERKOSTEN (alleen bij vaste contracten met zonnepanelen)
    // Deze kosten worden berekend over de VOLLEDIGE teruglevering, niet netto
    const kostenTeruglevering = terugleveringKwh > 0 && tariefTerugleveringKwh 
      ? terugleveringKwh * tariefTerugleveringKwh 
      : 0
    
    const terugleveringBreakdown = terugleveringKwh > 0 ? {
      kwh: terugleveringKwh,
      tarief: tariefTerugleveringKwh || 0,
      bedrag: kostenTeruglevering
    } : null
    
    console.log('💰 Terugleverkosten:', {
      teruglevering: terugleveringKwh,
      tarief: tariefTerugleveringKwh,
      kosten: kostenTeruglevering
    })
    
    // Vastrecht: €8.25/maand voor STROOM + €8.25/maand voor GAS (alleen als er gas is)
    // 6. VASTRECHT (apart voor stroom en gas)
    // Standaard: €4/maand per aansluiting = €48/jaar
    const vastrechtStroom = (vastrechtStroomMaand || 4.00) * 12
    const vastrechtGas = totaalGas > 0 ? (vastrechtGasMaand || 4.00) * 12 : 0
    const kostenVastrecht = vastrechtStroom + vastrechtGas
    
    const subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht + kostenTeruglevering
    
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
    
    // Voor breakdown: track welke staffels zijn gebruikt
    const staffelDetails: any = {}
    
    if (totaalElektriciteit <= schijf1Max) {
      ebElektriciteit = totaalElektriciteit * overheidsTarieven.eb_elektriciteit_gv_schijf1
      staffelDetails.schijf1 = {
        kwh: totaalElektriciteit,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: ebElektriciteit
      }
    } else if (totaalElektriciteit <= schijf2Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (totaalElektriciteit - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      ebElektriciteit = bedrag1 + bedrag2
      
      staffelDetails.schijf1 = {
        kwh: schijf1Max,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf1,
        bedrag: bedrag1
      }
      staffelDetails.schijf2 = {
        kwh: totaalElektriciteit,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf2,
        bedrag: bedrag2
      }
    } else if (totaalElektriciteit <= schijf3Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (totaalElektriciteit - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
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
        kwh: totaalElektriciteit,
        tarief: overheidsTarieven.eb_elektriciteit_gv_schijf3,
        bedrag: bedrag3
      }
    } else {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (schijf3Max - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
      const bedrag4 = (totaalElektriciteit - schijf3Max) * overheidsTarieven.eb_elektriciteit_gv_schijf4
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
        kwh: totaalElektriciteit,
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
          elektriciteitTotaal: totaalElektriciteit,
          elektriciteitNormaal: nettoElektriciteitNormaal,
          elektriciteitDal: nettoElektriciteitDal,
          gas: totaalGas,
          teruglevering: terugleveringKwh,
        },
        aansluitwaarden: {
          elektriciteit: aansluitwaardeElektriciteit,
          gas: aansluitwaardeGas || 'N/A',
        },
        netbeheerder: netbeheerderNaam,
        isGrootverbruik: isGrootverbruikAansluitwaarde,
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

