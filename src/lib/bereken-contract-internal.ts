/**
 * Internal function to calculate contract costs
 * This is the same logic as the API route but can be called directly from server-side code
 */

import { createClient } from '@supabase/supabase-js'
import { converteerGasAansluitwaardeVoorDatabase } from '@/lib/aansluitwaarde-schatting'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'
import { calculateDynamicContract } from '@/lib/dynamic-pricing/calculate-dynamic-contract'
import { isGrootverbruikElektriciteitAansluitwaarde, isGrootverbruikGasAansluitwaarde } from '@/lib/verbruik-type'

interface BerekenContractInput {
  // Verbruik
  elektriciteitNormaal: number
  elektriciteitDal: number
  gas: number
  terugleveringJaar: number
  
  // Aansluitwaarden
  aansluitwaardeElektriciteit: string
  aansluitwaardeGas: string
  
  // Postcode
  postcode: string
  
  // Contract details
  contractType: 'vast' | 'dynamisch' | 'maatwerk'
  tariefElektriciteitNormaal?: number
  tariefElektriciteitDal?: number
  tariefElektriciteitEnkel?: number
  tariefGas?: number
  tariefTerugleveringKwh?: number
  // Dynamische contract opslagen
  opslagElektriciteit?: number
  opslagGas?: number
  opslagTeruglevering?: number
  vastrechtStroomMaand?: number
  vastrechtGasMaand?: number
  heeftDubbeleMeter: boolean
}

export async function calculateContractCosts(
  input: BerekenContractInput,
  supabase: any
): Promise<{ success: boolean; breakdown?: any; error?: string }> {
  try {
    const {
      elektriciteitNormaal,
      elektriciteitDal,
      gas,
      terugleveringJaar,
      aansluitwaardeElektriciteit,
      aansluitwaardeGas,
      postcode,
      contractType,
      tariefElektriciteitNormaal,
      tariefElektriciteitDal,
      tariefElektriciteitEnkel,
      tariefGas,
      tariefTerugleveringKwh,
      opslagElektriciteit,
      opslagGas,
      opslagTeruglevering,
      vastrechtStroomMaand,
      vastrechtGasMaand,
      heeftDubbeleMeter,
    } = input

    // Validatie
    if (!elektriciteitNormaal || !postcode || !aansluitwaardeElektriciteit) {
      return { success: false, error: 'Ontbrekende verplichte velden' }
    }

    const terugleveringKwh = terugleveringJaar || 0
    const totaalGas = gas || 0
    const isDynamisch = contractType === 'dynamisch'
    const isVastOfMaatwerk = contractType === 'vast' || contractType === 'maatwerk'

    // 1. NETBEHEERDER LOOKUP
    const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase()
    const { data: postcodeData, error: postcodeError } = await supabase
      .from('postcode_netbeheerders')
      .select('netbeheerder_id')
      .lte('postcode_van', cleanedPostcode)
      .gte('postcode_tot', cleanedPostcode)
      .limit(1)
      .single()

    if (postcodeError || !postcodeData) {
      return { success: false, error: 'Netbeheerder niet gevonden voor deze postcode' }
    }

    const netbeheerderId = postcodeData.netbeheerder_id

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
      return { success: false, error: 'Energiebelasting tarieven niet gevonden voor 2025' }
    }

    // 3. NETBEHEERTARIEVEN
    const { data: elektraAansluitwaarde } = await supabase
      .from('aansluitwaarden_elektriciteit')
      .select('id, is_kleinverbruik')
      .eq('code', aansluitwaardeElektriciteit)
      .single()

    if (!elektraAansluitwaarde) {
      return { success: false, error: `Ongeldige aansluitwaarde elektriciteit: ${aansluitwaardeElektriciteit}` }
    }

    const { data: elektriciteitTarief } = await supabase
      .from('netbeheer_tarieven_elektriciteit')
      .select('all_in_tarief_jaar')
      .eq('netbeheerder_id', netbeheerderId)
      .eq('jaar', 2025)
      .eq('actief', true)
      .eq('aansluitwaarde_id', elektraAansluitwaarde.id)
      .single()

    let netbeheerElektriciteit = elektriciteitTarief?.all_in_tarief_jaar || 430
    if (isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)) {
      netbeheerElektriciteit = 0
    }

    // Gas netbeheer
    const gasAansluitwaardeVoorDatabase = aansluitwaardeGas 
      ? converteerGasAansluitwaardeVoorDatabase(aansluitwaardeGas, totaalGas)
      : converteerGasAansluitwaardeVoorDatabase('G6', totaalGas)

    let netbeheerGas = 0
    if (totaalGas > 0) {
      const { data: gasAansluitwaarde } = await supabase
        .from('aansluitwaarden_gas')
        .select('id, is_kleinverbruik')
        .eq('code', gasAansluitwaardeVoorDatabase)
        .single()

      if (gasAansluitwaarde) {
        const { data: gasTarief } = await supabase
          .from('netbeheer_tarieven_gas')
          .select('all_in_tarief_jaar')
          .eq('netbeheerder_id', netbeheerderId)
          .eq('jaar', 2025)
          .eq('actief', true)
          .eq('aansluitwaarde_id', gasAansluitwaarde.id)
          .single()

        netbeheerGas = gasTarief?.all_in_tarief_jaar || 245
        if (aansluitwaardeGas && isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)) {
          netbeheerGas = 0
        }
      }
    }

    // 4. LEVERANCIERSKOSTEN
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

      const result = calculateDynamicContract({
        elektriciteitNormaal,
        elektriciteitDal,
        gas,
        terugleveringJaar: terugleveringKwh,
        heeftDubbeleMeter,
        opslagElektriciteit: opslagElektriciteit || 0,
        opslagGas: opslagGas || 0,
        opslagTeruglevering: opslagTeruglevering || 0,
        dynamicPrices,
        vastrechtStroomMaand: vastrechtStroomMaand || 4.00,
        vastrechtGasMaand: vastrechtGasMaand || 0,
      })

      kostenElektriciteit = result.kostenElektriciteit
      kostenGas = result.kostenGas
      nettoKwh = result.nettoKwh
      overschotKwh = result.overschotKwh
      opbrengstOverschot = result.opbrengstOverschot
    } else if (isVastOfMaatwerk) {
      // Saldering
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

      // Bereken leverancierskosten
      if (!heeftDubbeleMeter && tariefElektriciteitEnkel) {
        kostenElektriciteit = nettoKwh * tariefElektriciteitEnkel
      } else if (heeftDubbeleMeter && tariefElektriciteitNormaal && tariefElektriciteitDal) {
        kostenElektriciteit = (nettoElektriciteitNormaal * tariefElektriciteitNormaal) +
                            (nettoElektriciteitDal * tariefElektriciteitDal)
      }

      kostenGas = totaalGas * (tariefGas || 0)
      kostenTeruglevering = terugleveringKwh > 0 && tariefTerugleveringKwh 
        ? terugleveringKwh * tariefTerugleveringKwh 
        : 0
    }

    // Vastrecht
    const vastrechtStroom = (vastrechtStroomMaand || 4.00) * 12
    const vastrechtGas = totaalGas > 0 ? (vastrechtGasMaand || 4.00) * 12 : 0
    const kostenVastrecht = vastrechtStroom + vastrechtGas

    const subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht + kostenTeruglevering

    // 5. ENERGIEBELASTING
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

    // 7. TOTALEN
    const totaalJaarExclBtw = subtotaalLeverancier + subtotaalEnergiebelasting + subtotaalNetbeheer
    const btw = totaalJaarExclBtw * (overheidsTarieven.btw_percentage / 100)
    const totaalJaarInclBtw = totaalJaarExclBtw + btw

    const maandbedragExclBtw = totaalJaarExclBtw / 12
    const maandbedragInclBtw = totaalJaarInclBtw / 12

    return {
      success: true,
      breakdown: {
        leverancier: {
          elektriciteit: kostenElektriciteit,
          gas: kostenGas,
          teruglevering: kostenTeruglevering,
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
    }
  } catch (error: any) {
    console.error('Error in calculateContractCosts:', error)
    return { success: false, error: error.message || 'Fout bij berekenen energiekosten' }
  }
}

