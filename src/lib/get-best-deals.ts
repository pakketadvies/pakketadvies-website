import { createClient } from '@/lib/supabase/server'
import { calculateContractCosts } from '@/lib/bereken-contract-internal'
import { berekenEnecoModelContractKosten } from '@/lib/energie-berekening'
import { unstable_cache } from 'next/cache'
import { converteerGasAansluitwaardeVoorDatabase } from '@/lib/aansluitwaarde-schatting'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'
import { calculateDynamicContract } from '@/lib/dynamic-pricing/calculate-dynamic-contract'

/**
 * Helper function to fetch shared/cached data that's reused across all contract calculations
 * This optimizes performance by fetching once instead of per contract
 */
async function fetchSharedCalculationData(
  supabase: any,
  postcode: string,
  aansluitwaardeElektriciteit: string,
  aansluitwaardeGas: string
) {
  console.log('🔵 [fetchSharedCalculationData] START - postcode:', postcode, 'elektriciteit:', aansluitwaardeElektriciteit, 'gas:', aansluitwaardeGas)
  
  // 1. Overheidstarieven (always the same for 2025)
  console.log('🔵 [fetchSharedCalculationData] Fetching overheidsTarieven...')
  const { data: overheidsTarieven, error: tarievenError } = await supabase
    .from('tarieven_overheid')
    .select('*')
    .eq('jaar', 2025)
    .eq('actief', true)
    .single()

  if (tarievenError || !overheidsTarieven) {
    console.error('❌ [fetchSharedCalculationData] Error fetching overheidsTarieven:', tarievenError)
    throw new Error('Energiebelasting tarieven niet gevonden voor 2025')
  }
  console.log('✅ [fetchSharedCalculationData] OverheidsTarieven fetched')

  // 2. Netbeheerder lookup (for fixed postcode '1000AA')
  console.log('🔵 [fetchSharedCalculationData] Looking up netbeheerder for postcode:', postcode)
  const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()
  const { data: postcodeData, error: postcodeError } = await supabase
    .from('postcode_netbeheerders')
    .select('netbeheerder_id')
    .lte('postcode_van', cleanedPostcode)
    .gte('postcode_tot', cleanedPostcode)
    .limit(1)
    .single()

  if (postcodeError || !postcodeData) {
    console.error('❌ [fetchSharedCalculationData] Error looking up postcode:', postcodeError)
    throw new Error('Netbeheerder niet gevonden voor deze postcode')
  }

  const netbeheerderId = postcodeData.netbeheerder_id
  console.log('✅ [fetchSharedCalculationData] Netbeheerder found:', netbeheerderId)

  // 3. Aansluitwaarden (fetch once)
  // Voor gas: converteer eerst naar database formaat (gebruik standaard verbruik van 1200 m³ voor homepage)
  console.log('🔵 [fetchSharedCalculationData] Fetching aansluitwaarden...')
  const gasAansluitwaardeVoorDatabase = converteerGasAansluitwaardeVoorDatabase(aansluitwaardeGas, 1200)
  
  const [elektraAansluitwaardeResult, gasAansluitwaardeResult] = await Promise.all([
    supabase
      .from('aansluitwaarden_elektriciteit')
      .select('id, is_kleinverbruik')
      .eq('code', aansluitwaardeElektriciteit)
      .single(),
    supabase
      .from('aansluitwaarden_gas')
      .select('id, is_kleinverbruik')
      .eq('code', gasAansluitwaardeVoorDatabase)
      .single(),
  ])

  const elektraAansluitwaarde = elektraAansluitwaardeResult.data
  const gasAansluitwaarde = gasAansluitwaardeResult.data

  if (!elektraAansluitwaarde) {
    console.error('❌ [fetchSharedCalculationData] Elektra aansluitwaarde not found')
    throw new Error(`Ongeldige aansluitwaarde elektriciteit: ${aansluitwaardeElektriciteit}`)
  }
  console.log('✅ [fetchSharedCalculationData] Aansluitwaarden fetched')

  // 4. Netbeheertarieven (fetch once for this postcode/aansluitwaarden combination)
  const [elektriciteitTariefResult, gasTariefResult] = await Promise.all([
    supabase
      .from('netbeheer_tarieven_elektriciteit')
      .select('all_in_tarief_jaar')
      .eq('netbeheerder_id', netbeheerderId)
      .eq('jaar', 2025)
      .eq('actief', true)
      .eq('aansluitwaarde_id', elektraAansluitwaarde.id)
      .single(),
    gasAansluitwaarde
      ? supabase
          .from('netbeheer_tarieven_gas')
          .select('all_in_tarief_jaar')
          .eq('netbeheerder_id', netbeheerderId)
          .eq('jaar', 2025)
          .eq('actief', true)
          .eq('aansluitwaarde_id', gasAansluitwaarde.id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  let netbeheerElektriciteit = elektriciteitTariefResult.data?.all_in_tarief_jaar || 430
  if (isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
    netbeheerElektriciteit = 0
  }

  let netbeheerGas = gasTariefResult.data?.all_in_tarief_jaar || 245
  if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
    netbeheerGas = 0
  }
  
  console.log('✅ [fetchSharedCalculationData] All shared data fetched successfully - netbeheerElektriciteit:', netbeheerElektriciteit, 'netbeheerGas:', netbeheerGas)

  return {
    overheidsTarieven,
    netbeheerderId,
    elektraAansluitwaarde,
    gasAansluitwaarde,
    netbeheerElektriciteit,
    netbeheerGas,
  }
}

/**
 * Optimized contract cost calculation using pre-fetched shared data
 * This avoids redundant database queries for each contract
 */
async function calculateContractCostsOptimized(
  contract: any,
  details: any,
  sharedData: Awaited<ReturnType<typeof fetchSharedCalculationData>>,
  verbruik: {
    elektriciteitNormaal: number
    elektriciteitDal: number
    gas: number
    terugleveringJaar: number
    aansluitwaardeElektriciteit: string
    aansluitwaardeGas: string
    heeftDubbeleMeter: boolean
  }
): Promise<{ maandbedrag: number } | null> {
  console.log('🔵 [calculateContractCostsOptimized] START - contract:', contract.id, 'type:', contract.type)
  try {
    const {
      overheidsTarieven,
      elektraAansluitwaarde,
      netbeheerElektriciteit,
      netbeheerGas,
    } = sharedData

    const { elektriciteitNormaal, elektriciteitDal, gas, terugleveringJaar, heeftDubbeleMeter } = verbruik
    const terugleveringKwh = terugleveringJaar || 0
    const totaalGas = gas || 0
    const isDynamisch = contract.type === 'dynamisch'
    const isVastOfMaatwerk = contract.type === 'vast' || contract.type === 'maatwerk'

    // LEVERANCIERSKOSTEN
    let kostenElektriciteit = 0
    let kostenGas = 0
    let nettoKwh = 0
    let overschotKwh = 0
    let opbrengstOverschot = 0
    let kostenTeruglevering = 0

    if (isDynamisch) {
      const dynamicPricesData = await getCurrentDynamicPrices()
      const dynamicPrices = {
        elektriciteit_gemiddeld_dag: dynamicPricesData.electricityDay,
        elektriciteit_gemiddeld_nacht: dynamicPricesData.electricityNight,
        gas_gemiddeld: dynamicPricesData.gas,
      }

      const opslagElektriciteit = details.opslag_elektriciteit_normaal || details.opslag_elektriciteit || 0
      const opslagGas = details.opslag_gas || 0
      const opslagTeruglevering = details.opslag_teruglevering || 0
      const vastrechtStroomMaand = details.vastrecht_stroom_maand || 4.00
      const vastrechtGasMaand = details.vastrecht_gas_maand || 4.00

      const result = calculateDynamicContract({
        elektriciteitNormaal,
        elektriciteitDal,
        gas,
        terugleveringJaar: terugleveringKwh,
        heeftDubbeleMeter,
        opslagElektriciteit,
        opslagGas,
        opslagTeruglevering,
        dynamicPrices,
        vastrechtStroomMaand,
        vastrechtGasMaand,
      })

      kostenElektriciteit = result.kostenElektriciteit
      kostenGas = result.kostenGas
      nettoKwh = result.nettoKwh
      overschotKwh = result.overschotKwh
      opbrengstOverschot = result.opbrengstOverschot
    } else if (isVastOfMaatwerk) {
      // Saldering logica (same as calculateContractCosts)
      let nettoElektriciteitNormaal = elektriciteitNormaal
      let nettoElektriciteitDal = elektriciteitDal || 0

      if (terugleveringKwh > 0) {
        if (!heeftDubbeleMeter) {
          const totaalVerbruik = elektriciteitNormaal
          nettoElektriciteitNormaal = Math.max(0, totaalVerbruik - terugleveringKwh)
          nettoKwh = nettoElektriciteitNormaal
        } else {
          const terugleveringNormaal = terugleveringKwh / 2
          const terugleveringDal = terugleveringKwh / 2
          let normaal_na_aftrek = elektriciteitNormaal - terugleveringNormaal
          let dal_na_aftrek = (elektriciteitDal || 0) - terugleveringDal

          if (normaal_na_aftrek < 0) {
            const overschot_normaal = -normaal_na_aftrek
            dal_na_aftrek = Math.max(0, dal_na_aftrek - overschot_normaal)
            normaal_na_aftrek = 0
          } else if (dal_na_aftrek < 0) {
            const overschot_dal = -dal_na_aftrek
            normaal_na_aftrek = Math.max(0, normaal_na_aftrek - overschot_dal)
            dal_na_aftrek = 0
          }

          nettoElektriciteitNormaal = Math.max(0, normaal_na_aftrek)
          nettoElektriciteitDal = Math.max(0, dal_na_aftrek)
          nettoKwh = nettoElektriciteitNormaal + nettoElektriciteitDal
        }
      } else {
        nettoKwh = elektriciteitNormaal + (elektriciteitDal || 0)
      }

      const tariefElektriciteitNormaal = details.tarief_elektriciteit_normaal || 0
      const tariefElektriciteitDal = details.tarief_elektriciteit_dal
      const tariefElektriciteitEnkel = details.tarief_elektriciteit_enkel
      const tariefGas = details.tarief_gas || 0
      const tariefTerugleveringKwh = details.tarief_teruglevering_kwh || 0

      // Bereken leverancierskosten
      if (!heeftDubbeleMeter && tariefElektriciteitEnkel) {
        kostenElektriciteit = nettoKwh * tariefElektriciteitEnkel
      } else if (heeftDubbeleMeter && tariefElektriciteitNormaal && tariefElektriciteitDal) {
        kostenElektriciteit = (nettoElektriciteitNormaal * tariefElektriciteitNormaal) +
                            (nettoElektriciteitDal * tariefElektriciteitDal)
      }

      kostenGas = totaalGas * tariefGas
      kostenTeruglevering = terugleveringKwh > 0 && tariefTerugleveringKwh 
        ? terugleveringKwh * tariefTerugleveringKwh 
        : 0
    }

    // Vastrecht
    const vastrechtStroomMaand = details.vastrecht_stroom_maand || 4.00
    const vastrechtGasMaand = details.vastrecht_gas_maand || 4.00
    const vastrechtStroom = vastrechtStroomMaand * 12
    const vastrechtGas = totaalGas > 0 ? vastrechtGasMaand * 12 : 0
    const kostenVastrecht = vastrechtStroom + vastrechtGas

    const subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht + kostenTeruglevering

    // ENERGIEBELASTING (using pre-fetched overheidsTarieven)
    const isGrootverbruikAansluitwaardeElektra = elektraAansluitwaarde ? !elektraAansluitwaarde.is_kleinverbruik : false

    let ebElektriciteit = 0
    const schijf1Max = overheidsTarieven.eb_elektriciteit_gv_schijf1_max || 2900
    const schijf2Max = overheidsTarieven.eb_elektriciteit_gv_schijf2_max || 10000
    const schijf3Max = overheidsTarieven.eb_elektriciteit_gv_schijf3_max || 50000

    if (nettoKwh <= schijf1Max) {
      ebElektriciteit = nettoKwh * overheidsTarieven.eb_elektriciteit_gv_schijf1
    } else if (nettoKwh <= schijf2Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (nettoKwh - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      ebElektriciteit = bedrag1 + bedrag2
    } else if (nettoKwh <= schijf3Max) {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (nettoKwh - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
      ebElektriciteit = bedrag1 + bedrag2 + bedrag3
    } else {
      const bedrag1 = schijf1Max * overheidsTarieven.eb_elektriciteit_gv_schijf1
      const bedrag2 = (schijf2Max - schijf1Max) * overheidsTarieven.eb_elektriciteit_gv_schijf2
      const bedrag3 = (schijf3Max - schijf2Max) * overheidsTarieven.eb_elektriciteit_gv_schijf3
      const bedrag4 = (nettoKwh - schijf3Max) * overheidsTarieven.eb_elektriciteit_gv_schijf4
      ebElektriciteit = bedrag1 + bedrag2 + bedrag3 + bedrag4
    }

    let ebGas = 0
    if (totaalGas > 0) {
      const schijf1Max = overheidsTarieven.eb_gas_schijf1_max || 1000
      if (totaalGas <= schijf1Max) {
        ebGas = totaalGas * overheidsTarieven.eb_gas_schijf1
      } else {
        ebGas = schijf1Max * overheidsTarieven.eb_gas_schijf1 +
                (totaalGas - schijf1Max) * overheidsTarieven.eb_gas_schijf2
      }
    }

    const verminderingEB = !isGrootverbruikAansluitwaardeElektra 
      ? overheidsTarieven.vermindering_eb_elektriciteit 
      : 0

    const subtotaalEnergiebelasting = ebElektriciteit + ebGas - verminderingEB
    const subtotaalNetbeheer = netbeheerElektriciteit + netbeheerGas

    // TOTALEN
    const totaalJaarExclBtw = subtotaalLeverancier + subtotaalEnergiebelasting + subtotaalNetbeheer
    const btw = totaalJaarExclBtw * (overheidsTarieven.btw_percentage / 100)
    const totaalJaarInclBtw = totaalJaarExclBtw + btw

    const maandbedragInclBtw = totaalJaarInclBtw / 12
    console.log('✅ [calculateContractCostsOptimized] SUCCESS - contract:', contract.id, 'maandbedrag:', maandbedragInclBtw)

    return { maandbedrag: maandbedragInclBtw }
  } catch (error: any) {
    console.error(`❌ [calculateContractCostsOptimized] ERROR for contract ${contract.id}:`, error)
    console.error(`❌ [calculateContractCostsOptimized] Error stack:`, error?.stack)
    return null
  }
}

/**
 * Internal implementation (not cached)
 */
async function getBestDealsInternal(limit: number = 5, type: 'alle' | 'vast' | 'dynamisch' = 'alle') {
  console.log('🔵 [getBestDealsInternal] START - limit:', limit, 'type:', type)
  try {
    const supabase = await createClient()
    console.log('✅ [getBestDealsInternal] Supabase client created')
    
    // Get all active contracts with leverancier info that are marked to show on homepage
    let query = supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('actief', true)
      .eq('tonen_op_homepage', true) // Only get contracts marked for homepage
    
    // Filter by type if specified
    if (type !== 'alle') {
      query = query.eq('type', type)
    }
    
    const { data: contracten, error } = await query
      .order('aanbevolen', { ascending: false }) // Aanbevolen first
      .order('populair', { ascending: false }) // Then populair
      .order('volgorde', { ascending: true })
      .limit(limit * 2) // Get more to sort by rating/price later

    if (error) {
      console.error('Error fetching contracten:', error)
      return { contracten: [], averagePrice: 0 }
    }

    if (!contracten || contracten.length === 0) {
      console.log('⚠️ [getBestDealsInternal] No contracten found in database')
      return { contracten: [], averagePrice: 0 }
    }
    
    console.log('✅ [getBestDealsInternal] Found', contracten.length, 'contracts in database')

    // Fetch details for each contract based on type
    const contractenWithDetails = await Promise.all(
      contracten.map(async (contract: any) => {
        if (contract.type === 'vast') {
          const { data: details } = await supabase
            .from('contract_details_vast')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_vast: details }
        } else if (contract.type === 'dynamisch') {
          const { data: details } = await supabase
            .from('contract_details_dynamisch')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_dynamisch: details }
        } else if (contract.type === 'maatwerk') {
          const { data: details } = await supabase
            .from('contract_details_maatwerk')
            .select('*')
            .eq('contract_id', contract.id)
            .single()
          
          return { ...contract, details_maatwerk: details }
        }
        
        return contract
      })
    )

    // Filter out contracts without details
    const validContracten = contractenWithDetails.filter((c: any) => {
      if (c.type === 'vast') return !!c.details_vast
      if (c.type === 'dynamisch') return !!c.details_dynamisch
      if (c.type === 'maatwerk') return !!c.details_maatwerk
      return false
    })

    // Calculate prices using optimized calculation with shared data
    // Using typical MKB usage: 6000 kWh/year (4000 normaal + 2000 dal), 1200 m³/year
    const defaultElektriciteitNormaal = 4000 // kWh/year
    const defaultElektriciteitDal = 2000 // kWh/year
    const defaultGas = 1200 // m³/year
    const defaultPostcode = '1000AA' // Amsterdam as default
    const heeftEnkeleMeter = false // Default: dubbele meter
    const defaultAansluitwaardeElektriciteit = '3x25A'
    const defaultAansluitwaardeGas = 'G6'

    // OPTIMIZATION: Fetch shared data once instead of per contract
    console.log('🔵 [getBestDealsInternal] Fetching shared calculation data...')
    let sharedData
    try {
      sharedData = await fetchSharedCalculationData(
        supabase,
        defaultPostcode,
        defaultAansluitwaardeElektriciteit,
        defaultAansluitwaardeGas
      )
      console.log('✅ [getBestDealsInternal] Shared data fetched successfully')
    } catch (error: any) {
      console.error('❌ [getBestDealsInternal] Error fetching shared data:', error)
      throw error
    }

    // Calculate Eneco model contract costs for comparison (baseline for savings)
    console.log('🔵 [getBestDealsInternal] Calculating Eneco model costs...')
    const enecoModelKosten = await berekenEnecoModelContractKosten(
      defaultElektriciteitNormaal,
      defaultElektriciteitDal,
      defaultGas,
      heeftEnkeleMeter,
      supabase,
      defaultAansluitwaardeElektriciteit,
      defaultAansluitwaardeGas
    )
    const enecoModelMaandbedrag = enecoModelKosten?.maandbedrag || 0
    console.log('✅ [getBestDealsInternal] Eneco model maandbedrag:', enecoModelMaandbedrag)

    // Calculate prices for each contract using optimized calculation with shared data
    console.log('🔵 [getBestDealsInternal] Calculating prices for', validContracten.length, 'contracts...')
    const contractenMetPrijzen = await Promise.all(
      validContracten.map(async (contract: any) => {
        const details = contract.details_vast || contract.details_dynamisch || contract.details_maatwerk || {}
        
        try {
          // Use optimized calculation function with pre-fetched shared data
          const result = await calculateContractCostsOptimized(
            contract,
            details,
            sharedData,
            {
              elektriciteitNormaal: defaultElektriciteitNormaal,
              elektriciteitDal: defaultElektriciteitDal,
              gas: defaultGas,
              terugleveringJaar: 0,
              aansluitwaardeElektriciteit: defaultAansluitwaardeElektriciteit,
              aansluitwaardeGas: defaultAansluitwaardeGas,
              heeftDubbeleMeter: true,
            }
          )

          if (result) {
            const maandbedrag = Math.round(result.maandbedrag || 0)
            
            // Calculate savings compared to Eneco model contract
            const besparing = enecoModelMaandbedrag > 0 && maandbedrag < enecoModelMaandbedrag
              ? Math.round(enecoModelMaandbedrag - maandbedrag)
              : 0
            
            console.log('✅ [getBestDealsInternal] Contract', contract.id, '- maandbedrag:', maandbedrag, 'besparing:', besparing)
            return {
              ...contract,
              estimatedMaandbedrag: maandbedrag > 0 ? maandbedrag : 150,
              estimatedBesparing: besparing,
              rating: details.rating || 0,
            }
          } else {
            console.warn('⚠️ [getBestDealsInternal] Contract', contract.id, '- calculateContractCostsOptimized returned null')
          }
        } catch (error) {
          console.error(`❌ [getBestDealsInternal] Error calculating price for contract ${contract.id}:`, error)
        }

        // Fallback: simplified estimate if calculation fails
        console.warn('⚠️ [getBestDealsInternal] Contract', contract.id, '- using fallback estimate')
        return {
          ...contract,
          estimatedMaandbedrag: 150, // Fallback to reasonable default
          estimatedBesparing: 0,
          rating: details.rating || 0,
        }
      })
    )
    console.log('✅ [getBestDealsInternal] Calculated prices for', contractenMetPrijzen.length, 'contracts')

    // Calculate average price (use Eneco model as average if available)
    const averagePrice = enecoModelMaandbedrag > 0 
      ? enecoModelMaandbedrag 
      : (validContracten.length > 0 
          ? Math.round(contractenMetPrijzen.reduce((sum: number, c: any) => sum + c.estimatedMaandbedrag, 0) / validContracten.length)
          : 0)

    // Sort by: aanbevolen > rating > price
    contractenMetPrijzen.sort((a: any, b: any) => {
      // First: aanbevolen
      if (a.aanbevolen && !b.aanbevolen) return -1
      if (!a.aanbevolen && b.aanbevolen) return 1
      
      // Second: rating
      if (a.rating !== b.rating) return b.rating - a.rating
      
      // Third: price (lower is better)
      return a.estimatedMaandbedrag - b.estimatedMaandbedrag
    })

    // Take top N contracts
    const topContracten = contractenMetPrijzen.slice(0, limit)
    console.log('✅ [getBestDealsInternal] Returning', topContracten.length, 'top contracts, averagePrice:', averagePrice)

    return { 
      contracten: topContracten,
      averagePrice 
    }
  } catch (error: any) {
    console.error('❌ [getBestDealsInternal] ERROR:', error)
    console.error('❌ [getBestDealsInternal] Error stack:', error?.stack)
    return { contracten: [], averagePrice: 0 }
  }
}

/**
 * Cached version of getBestDeals for homepage performance
 * Cache is invalidated after 5 minutes or can be manually invalidated using tags
 */
export const getBestDeals = unstable_cache(
  async (limit: number = 5, type: 'alle' | 'vast' | 'dynamisch' = 'alle') => {
    console.log('🔵 [getBestDeals] Called with limit:', limit, 'type:', type)
    try {
      const result = await getBestDealsInternal(limit, type)
      console.log('✅ [getBestDeals] Result:', result.contracten.length, 'contracts, averagePrice:', result.averagePrice)
      return result
    } catch (error: any) {
      console.error('❌ [getBestDeals] ERROR:', error)
      console.error('❌ [getBestDeals] Error stack:', error?.stack)
      // Return empty result on error instead of throwing
      return { contracten: [], averagePrice: 0 }
    }
  },
  ['getBestDeals'], // cache key prefix - includes function name
  {
    revalidate: 300, // 5 minutes
    tags: ['best-deals'], // for manual cache invalidation
  }
)

