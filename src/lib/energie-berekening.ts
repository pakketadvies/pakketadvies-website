// Utility functions for energy cost calculations
// Based on Sepa Green offerte analysis

import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

export interface EnergieKostenInput {
  // Verbruik
  elektriciteitNormaal: number // kWh/jaar
  elektriciteitDal?: number // kWh/jaar (optioneel, dubbele meter)
  gas: number // m³/jaar
  teruglevering?: number // kWh/jaar (optioneel, voor zonnepanelen)
  
  // Contract tarieven (EXCLUSIEF belastingen en netbeheer)
  tariefElektriciteitNormaal: number // EUR/kWh
  tariefElektriciteitDal?: number // EUR/kWh
  tariefGas: number // EUR/m³
  vastrecht: number // EUR/jaar
  
  // Aansluitwaarden
  aansluitwaardeElektriciteit: string // '3x25A', '3x80A', etc.
  aansluitwaardeGas: string // 'G4', 'G25', etc.
  
  // Netbeheerder (uit postcode lookup)
  netbeheerderId: string
  
  // Jaar voor tarieven
  jaar?: number // Default 2025
}

export interface EnergieKostenBreakdown {
  leverancier: {
    elektriciteit: number
    gas: number
    vastrecht: number
    subtotaal: number
  }
  overheidsheffingen: {
    energiebelastingElektriciteit: number
    energiebelastingGas: number
    ode: number
    vermindering: number
    subtotaal: number
  }
  netbeheer: {
    elektriciteit: number
    gas: number
    subtotaal: number
  }
  totaalExclBtw: number
  btw: number
  totaalInclBtw: number
  maandbedragExclBtw: number
  maandbedragInclBtw: number
}

/**
 * Bereken energiebelasting elektriciteit met schijven
 */
export function berekenEnergiebelastingElektriciteit(
  verbruikKwh: number,
  isGrootverbruik: boolean,
  tarieven: any
): number {
  let totaal = 0

  if (isGrootverbruik) {
    // Grootverbruik: 4 schijven (zoals Sepa offerte)
    const schijf1Max = tarieven.eb_elektriciteit_gv_schijf1_max || 2900
    const schijf2Max = tarieven.eb_elektriciteit_gv_schijf2_max || 10000
    const schijf3Max = tarieven.eb_elektriciteit_gv_schijf3_max || 50000

    if (verbruikKwh <= schijf1Max) {
      totaal = verbruikKwh * tarieven.eb_elektriciteit_gv_schijf1
    } else if (verbruikKwh <= schijf2Max) {
      totaal =
        schijf1Max * tarieven.eb_elektriciteit_gv_schijf1 +
        (verbruikKwh - schijf1Max) * tarieven.eb_elektriciteit_gv_schijf2
    } else if (verbruikKwh <= schijf3Max) {
      totaal =
        schijf1Max * tarieven.eb_elektriciteit_gv_schijf1 +
        (schijf2Max - schijf1Max) * tarieven.eb_elektriciteit_gv_schijf2 +
        (verbruikKwh - schijf2Max) * tarieven.eb_elektriciteit_gv_schijf3
    } else {
      totaal =
        schijf1Max * tarieven.eb_elektriciteit_gv_schijf1 +
        (schijf2Max - schijf1Max) * tarieven.eb_elektriciteit_gv_schijf2 +
        (schijf3Max - schijf2Max) * tarieven.eb_elektriciteit_gv_schijf3 +
        (verbruikKwh - schijf3Max) * tarieven.eb_elektriciteit_gv_schijf4
    }
  } else {
    // Kleinverbruik: 2 schijven
    const schijf1Max = tarieven.eb_elektriciteit_kv_schijf1_max || 10000

    if (verbruikKwh <= schijf1Max) {
      totaal = verbruikKwh * tarieven.eb_elektriciteit_kv_schijf1
    } else {
      totaal =
        schijf1Max * tarieven.eb_elektriciteit_kv_schijf1 +
        (verbruikKwh - schijf1Max) * tarieven.eb_elektriciteit_kv_schijf2
    }
  }

  return totaal
}

/**
 * Bereken energiebelasting gas met schijven
 */
export function berekenEnergiebelastingGas(
  verbruikM3: number,
  tarieven: any
): number {
  const schijf1Max = tarieven.eb_gas_schijf1_max || 1000

  if (verbruikM3 <= schijf1Max) {
    return verbruikM3 * tarieven.eb_gas_schijf1
  }

  return (
    schijf1Max * tarieven.eb_gas_schijf1 +
    (verbruikM3 - schijf1Max) * tarieven.eb_gas_schijf2
  )
}

/**
 * Hoofdfunctie: Bereken volledige energiekosten
 */
export async function berekenEnergieKosten(
  input: EnergieKostenInput,
  supabase: any
): Promise<EnergieKostenBreakdown> {
  const jaar = input.jaar || 2025

  // 1. Haal overheidstarieven op
  const { data: overheidsTarieven, error: tarievenError } = await supabase
    .from('tarieven_overheid')
    .select('*')
    .eq('jaar', jaar)
    .eq('actief', true)
    .single()

  if (tarievenError || !overheidsTarieven) {
    throw new Error(`Geen overheidstarieven gevonden voor ${jaar}`)
  }

  // 2. Bepaal of het grootverbruik is
  const isGrootverbruikElektriciteit = input.aansluitwaardeElektriciteit.includes('80A') || 
                                        input.aansluitwaardeElektriciteit.startsWith('>3x')
  
  // 3. Haal netbeheertarieven op
  const [elektriciteitTarief, gasTarief] = await Promise.all([
    supabase
      .from('netbeheer_tarieven_elektriciteit')
      .select('*, aansluitwaarde:aansluitwaarden_elektriciteit(code)')
      .eq('netbeheerder_id', input.netbeheerderId)
      .eq('jaar', jaar)
      .eq('actief', true)
      .eq('aansluitwaarden_elektriciteit.code', input.aansluitwaardeElektriciteit)
      .single(),
    supabase
      .from('netbeheer_tarieven_gas')
      .select('*, aansluitwaarde:aansluitwaarden_gas(code)')
      .eq('netbeheerder_id', input.netbeheerderId)
      .eq('jaar', jaar)
      .eq('actief', true)
      .eq('aansluitwaarden_gas.code', input.aansluitwaardeGas)
      .single()
  ])

  if (elektriciteitTarief.error) {
    console.warn(`Geen netbeheertarief elektriciteit gevonden voor ${input.aansluitwaardeElektriciteit}`)
  }
  if (gasTarief.error) {
    console.warn(`Geen netbeheertarief gas gevonden voor ${input.aansluitwaardeGas}`)
  }

  // 4. LEVERANCIERSKOSTEN (exclusief belastingen)
  const totaalElektriciteitKwh = input.elektriciteitNormaal + (input.elektriciteitDal || 0)
  
  const leverancierElektriciteit =
    input.elektriciteitNormaal * input.tariefElektriciteitNormaal +
    (input.elektriciteitDal && input.tariefElektriciteitDal
      ? input.elektriciteitDal * input.tariefElektriciteitDal
      : 0)
  
  const leverancierGas = input.gas * input.tariefGas
  const leverancierVastrecht = input.vastrecht

  // 5. OVERHEIDSHEFFINGEN
  const energiebelastingElektriciteit = berekenEnergiebelastingElektriciteit(
    totaalElektriciteitKwh,
    isGrootverbruikElektriciteit,
    overheidsTarieven
  )

  const energiebelastingGas = berekenEnergiebelastingGas(
    input.gas,
    overheidsTarieven
  )

  const ode =
    totaalElektriciteitKwh * (overheidsTarieven.ode_elektriciteit || 0) +
    input.gas * (overheidsTarieven.ode_gas || 0)

  const vermindering = !isGrootverbruikElektriciteit
    ? overheidsTarieven.vermindering_eb_elektriciteit || 0
    : 0

  // 6. NETBEHEERKOSTEN
  const netbeheerElektriciteit = elektriciteitTarief.data?.all_in_tarief_jaar || 0
  const netbeheerGas = gasTarief.data?.all_in_tarief_jaar || 0

  // 7. TOTALEN
  const leverancierSubtotaal =
    leverancierElektriciteit + leverancierGas + leverancierVastrecht

  const overheidsheffingenSubtotaal =
    energiebelastingElektriciteit +
    energiebelastingGas +
    ode -
    vermindering

  const netbeheerSubtotaal = netbeheerElektriciteit + netbeheerGas

  const totaalExclBtw =
    leverancierSubtotaal + overheidsheffingenSubtotaal + netbeheerSubtotaal

  const btw = totaalExclBtw * (overheidsTarieven.btw_percentage / 100)
  const totaalInclBtw = totaalExclBtw + btw

  return {
    leverancier: {
      elektriciteit: leverancierElektriciteit,
      gas: leverancierGas,
      vastrecht: leverancierVastrecht,
      subtotaal: leverancierSubtotaal,
    },
    overheidsheffingen: {
      energiebelastingElektriciteit,
      energiebelastingGas,
      ode,
      vermindering,
      subtotaal: overheidsheffingenSubtotaal,
    },
    netbeheer: {
      elektriciteit: netbeheerElektriciteit,
      gas: netbeheerGas,
      subtotaal: netbeheerSubtotaal,
    },
    totaalExclBtw,
    btw,
    totaalInclBtw,
    maandbedragExclBtw: totaalExclBtw / 12,
    maandbedragInclBtw: totaalInclBtw / 12,
  }
}

/**
 * Interface voor Eneco modeltarieven
 */
export interface ModelTarieven {
  tarief_elektriciteit_normaal: number // €/kWh (inclusief EB en BTW)
  tarief_elektriciteit_dal: number     // €/kWh (inclusief EB en BTW)
  tarief_elektriciteit_enkel: number  // €/kWh (inclusief EB en BTW)
  tarief_gas: number                   // €/m³ (inclusief EB en BTW)
  vastrecht_stroom_maand: number      // €/maand (inclusief BTW)
  vastrecht_gas_maand: number          // €/maand (inclusief BTW)
}

/**
 * Haal actieve Eneco modeltarieven op uit Supabase
 * Deze tarieven zijn inclusief Energiebelasting en BTW
 */
export async function getModelTarieven(
  supabase: any
): Promise<ModelTarieven | null> {
  console.log('🔍 [GET-MODEL-TARIEVEN] Ophalen actieve modeltarieven uit Supabase...')
  
  const { data, error } = await supabase
    .from('model_tarieven')
    .select('*')
    .eq('actief', true)
    .single()

  if (error || !data) {
    console.error('❌ [GET-MODEL-TARIEVEN] Error:', error)
    return null
  }

  const tarieven = {
    tarief_elektriciteit_normaal: parseFloat(data.tarief_elektriciteit_normaal),
    tarief_elektriciteit_dal: parseFloat(data.tarief_elektriciteit_dal),
    tarief_elektriciteit_enkel: parseFloat(data.tarief_elektriciteit_enkel),
    tarief_gas: parseFloat(data.tarief_gas),
    vastrecht_stroom_maand: parseFloat(data.vastrecht_stroom_maand),
    vastrecht_gas_maand: parseFloat(data.vastrecht_gas_maand),
  }
  
  console.log('✅ [GET-MODEL-TARIEVEN] Opgehaalde tarieven:', JSON.stringify(tarieven, null, 2))
  console.log('📊 [GET-MODEL-TARIEVEN] Raw data uit Supabase:', {
    id: data.id,
    vastrecht_stroom_maand: data.vastrecht_stroom_maand,
    vastrecht_gas_maand: data.vastrecht_gas_maand,
    updated_at: data.updated_at,
  })

  return tarieven
}

/**
 * Bereken Eneco modelcontract kosten (inclusief EB, BTW en netbeheer)
 * Deze functie berekent de totale kosten voor het Eneco modelcontract
 * als baseline voor besparingsberekening
 * 
 * Netbeheerkosten worden WEL meegenomen zodat de vergelijking met contractkosten
 * op dezelfde basis gebeurt (beide inclusief netbeheer).
 */
export async function berekenEnecoModelContractKosten(
  verbruikElektriciteitNormaal: number, // kWh/jaar
  verbruikElektriciteitDal: number,     // kWh/jaar
  verbruikGas: number,                    // m³/jaar
  heeftEnkeleMeter: boolean,
  supabase: any,
  aansluitwaardeElektriciteit: string = '3x25A', // NIEUW: voor netbeheer
  aansluitwaardeGas: string = 'G6'              // NIEUW: voor netbeheer
): Promise<{ jaarbedrag: number; maandbedrag: number } | null> {
  console.log('🔵 [BEREKEN-ENECO-MODEL] Start berekening met:', {
    verbruikElektriciteitNormaal,
    verbruikElektriciteitDal,
    verbruikGas,
    heeftEnkeleMeter,
    aansluitwaardeElektriciteit,
    aansluitwaardeGas,
  })
  
  const modelTarieven = await getModelTarieven(supabase)
  
  if (!modelTarieven) {
    console.error('❌ [BEREKEN-ENECO-MODEL] Geen modeltarieven gevonden')
    return null
  }

  console.log('📊 [BEREKEN-ENECO-MODEL] Gebruikte modeltarieven:', JSON.stringify(modelTarieven, null, 2))

  // Bepaal welk tarief te gebruiken voor elektriciteit
  let tariefElektriciteit: number
  if (heeftEnkeleMeter) {
    tariefElektriciteit = modelTarieven.tarief_elektriciteit_enkel
    console.log('🔧 [BEREKEN-ENECO-MODEL] Enkele meter, tarief:', tariefElektriciteit)
  } else {
    // Voor dubbeltarief: gebruik gewogen gemiddelde van normaal en dal
    const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
    if (totaalElektriciteit > 0) {
      const gewichtNormaal = verbruikElektriciteitNormaal / totaalElektriciteit
      const gewichtDal = verbruikElektriciteitDal / totaalElektriciteit
      tariefElektriciteit = 
        (modelTarieven.tarief_elektriciteit_normaal * gewichtNormaal) +
        (modelTarieven.tarief_elektriciteit_dal * gewichtDal)
      console.log('🔧 [BEREKEN-ENECO-MODEL] Dubbele meter, gewogen tarief:', tariefElektriciteit, `(normaal: ${gewichtNormaal}, dal: ${gewichtDal})`)
    } else {
      tariefElektriciteit = modelTarieven.tarief_elektriciteit_normaal
      console.log('🔧 [BEREKEN-ENECO-MODEL] Geen verbruik, fallback naar normaal tarief:', tariefElektriciteit)
    }
  }

  // Bereken leverancierskosten (tarieven zijn inclusief EB en BTW)
  const totaalElektriciteit = verbruikElektriciteitNormaal + verbruikElektriciteitDal
  const leverancierElektriciteit = totaalElektriciteit * tariefElektriciteit
  const leverancierGas = verbruikGas * modelTarieven.tarief_gas
  
  console.log('💰 [BEREKEN-ENECO-MODEL] Leverancierskosten:', {
    leverancierElektriciteit,
    leverancierGas,
  })
  
  // Vastrecht per jaar (maandbedrag * 12)
  const vastrechtStroomJaar = modelTarieven.vastrecht_stroom_maand * 12
  const vastrechtGasJaar = modelTarieven.vastrecht_gas_maand * 12
  
  console.log('💰 [BEREKEN-ENECO-MODEL] Vastrecht:', {
    vastrecht_stroom_maand: modelTarieven.vastrecht_stroom_maand,
    vastrecht_stroom_jaar: vastrechtStroomJaar,
    vastrecht_gas_maand: modelTarieven.vastrecht_gas_maand,
    vastrecht_gas_jaar: vastrechtGasJaar,
  })
  
  // Netbeheerkosten toevoegen (vereenvoudigd, zoals op resultatenpagina)
  // Netbeheerkosten zijn exclusief BTW in database, dus we moeten BTW toevoegen
  // Dit is een vereenvoudigde inschatting, de volledige berekening gebeurt in berekenEnergieKosten
  let netbeheerElektriciteitExclBtw = 430.00 // Standaard voor 3x25A (excl. BTW)
  if (aansluitwaardeElektriciteit && isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
    netbeheerElektriciteitExclBtw = 0 // Grootverbruik apart
  }

  let netbeheerGasExclBtw = verbruikGas > 0 ? 245.00 : 0 // Standaard voor G6 (excl. BTW)
  if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
    netbeheerGasExclBtw = 0 // Grootverbruik apart
  }
  
  // BTW over netbeheerkosten (21%)
  const netbeheerKostenExclBtw = netbeheerElektriciteitExclBtw + netbeheerGasExclBtw
  const btwNetbeheer = netbeheerKostenExclBtw * 0.21
  const netbeheerKostenInclBtw = netbeheerKostenExclBtw + btwNetbeheer
  
  console.log('💰 [BEREKEN-ENECO-MODEL] Netbeheerkosten:', {
    netbeheerElektriciteitExclBtw,
    netbeheerGasExclBtw,
    netbeheerKostenExclBtw,
    btwNetbeheer,
    netbeheerKostenInclBtw,
  })
  
  // Totaal per jaar (inclusief EB, BTW en netbeheer incl. BTW)
  const jaarbedrag = leverancierElektriciteit + leverancierGas + vastrechtStroomJaar + vastrechtGasJaar + netbeheerKostenInclBtw
  
  // Maandbedrag
  const maandbedrag = jaarbedrag / 12

  const result = {
    jaarbedrag: Math.round(jaarbedrag),
    maandbedrag: Math.round(maandbedrag),
  }
  
  console.log('✅ [BEREKEN-ENECO-MODEL] EINDRESULTAAT:', {
    jaarbedrag: result.jaarbedrag,
    maandbedrag: result.maandbedrag,
    breakdown: {
      leverancierElektriciteit,
      leverancierGas,
      vastrechtStroomJaar,
      vastrechtGasJaar,
      netbeheerKostenInclBtw,
      totaal: jaarbedrag,
    },
  })

  return result
}

