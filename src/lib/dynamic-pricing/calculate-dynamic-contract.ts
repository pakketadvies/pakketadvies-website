/**
 * Helper functies voor berekening van dynamische contracten
 * 
 * Deze functies implementeren de volledige logica voor dynamische contracten
 * met saldering, teruglevering en overschot situaties.
 */

export interface DynamicPrices {
  elektriciteit_gemiddeld_dag: number
  elektriciteit_gemiddeld_nacht: number
  gas_gemiddeld: number
}

export interface DynamicContractCalculationInput {
  // Verbruik
  elektriciteitNormaal: number
  elektriciteitDal: number | undefined
  gas: number | undefined
  terugleveringJaar: number
  heeftDubbeleMeter: boolean
  
  // Opslagen
  opslagElektriciteit: number
  opslagGas: number | undefined
  opslagTeruglevering: number | undefined
  
  // Marktprijzen
  dynamicPrices: DynamicPrices
  
  // Vastrecht
  vastrechtStroomMaand: number
  vastrechtGasMaand: number | undefined
}

export interface DynamicContractCalculationResult {
  // Elektriciteit
  kostenElektriciteit: number
  nettoKwh: number // Voor energiebelasting
  overschotKwh: number // Overschot teruglevering
  opbrengstOverschot: number // Opbrengst van overschot
  
  // Gas
  kostenGas: number
  
  // Breakdown
  elektriciteitBreakdown: any
  gasBreakdown: any | null
  
  // Teruglevering breakdown (voor UI)
  terugleveringBreakdown: any | null
}

/**
 * Bereken dynamisch contract kosten
 */
export function calculateDynamicContract(
  input: DynamicContractCalculationInput
): DynamicContractCalculationResult {
  const {
    elektriciteitNormaal,
    elektriciteitDal,
    gas,
    terugleveringJaar,
    heeftDubbeleMeter,
    opslagElektriciteit,
    opslagGas,
    opslagTeruglevering,
    dynamicPrices,
    vastrechtStroomMaand,
    vastrechtGasMaand,
  } = input

  // ============================================
  // 1. BEREKEN SPOTPRIJZEN
  // ============================================
  const S_dag = dynamicPrices.elektriciteit_gemiddeld_dag
  const S_nacht = dynamicPrices.elektriciteit_gemiddeld_nacht
  const S_enkel = (S_dag + S_nacht) / 2
  const P_gas = dynamicPrices.gas_gemiddeld

  // ============================================
  // 2. BEREKEN TARIEVEN (spotprijs + opslag)
  // ============================================
  const P_dag = S_dag + opslagElektriciteit
  const P_nacht = S_nacht + opslagElektriciteit
  const P_enkel = S_enkel + opslagElektriciteit
  const P_teruglever = S_enkel + (opslagTeruglevering || 0)
  const P_gas_totaal = P_gas + (opslagGas || 0)

  // ============================================
  // 3. ELEKTRICITEIT BEREKENING MET SALDERING
  // ============================================
  let nettoKwh = 0
  let kostenElektriciteit = 0
  let overschotKwh = 0
  let elektriciteitBreakdown: any = {}

  const Z_kWh = terugleveringJaar || 0

  if (!heeftDubbeleMeter) {
    // === ENKEL TARIEF ===
    const E_enkel = elektriciteitNormaal
    const E_tot = E_enkel

    if (Z_kWh <= E_tot) {
      // Geen overschot: alles wordt gesaldeerd
      nettoKwh = Math.max(E_enkel - Z_kWh, 0)
      overschotKwh = 0
      kostenElektriciteit = nettoKwh * P_enkel
    } else {
      // Overschot: volledige teruglevering
      nettoKwh = 0
      overschotKwh = Z_kWh - E_tot
      const opbrengstOverschot = overschotKwh * P_teruglever
      kostenElektriciteit = -opbrengstOverschot
    }

    elektriciteitBreakdown = {
      type: 'enkel',
      enkel: {
        kwh: E_enkel,
        nettoKwh,
        overschotKwh,
        tarief: P_enkel,
        bedrag: nettoKwh > 0 ? nettoKwh * P_enkel : 0,
      },
    }
  } else {
    // === DUBBEL TARIEF ===
    const E_tot = elektriciteitNormaal + (elektriciteitDal || 0)

    if (Z_kWh <= E_tot) {
      // Geen overschot: verdeel teruglevering 50/50
      const Z_normaal = Z_kWh / 2
      const Z_dal = Z_kWh / 2

      // Trek teruglevering af van beide tarieven
      let E_normaal_na_aftrek = elektriciteitNormaal - Z_normaal
      let E_dal_na_aftrek = (elektriciteitDal || 0) - Z_dal

      // Als een van beide negatief wordt, gebruik overschot om andere verder te verminderen
      if (E_normaal_na_aftrek < 0) {
        // Overschot bij normaal, haal af van dal
        const overschot_normaal = -E_normaal_na_aftrek
        E_dal_na_aftrek = Math.max(0, E_dal_na_aftrek - overschot_normaal)
        E_normaal_na_aftrek = 0
      } else if (E_dal_na_aftrek < 0) {
        // Overschot bij dal, haal af van normaal
        const overschot_dal = -E_dal_na_aftrek
        E_normaal_na_aftrek = Math.max(0, E_normaal_na_aftrek - overschot_dal)
        E_dal_na_aftrek = 0
      }

      // Zet beide op minimum 0 (extra veiligheid)
      const E_normaal_netto = Math.max(0, E_normaal_na_aftrek)
      const E_dal_netto = Math.max(0, E_dal_na_aftrek)

      nettoKwh = E_normaal_netto + E_dal_netto
      overschotKwh = 0

      kostenElektriciteit = (E_normaal_netto * P_dag) + (E_dal_netto * P_nacht)

      elektriciteitBreakdown = {
        type: 'dubbel',
        normaal: {
          kwh: elektriciteitNormaal,
          nettoKwh: E_normaal_netto,
          teruglevering: Z_normaal,
          tarief: P_dag,
          bedrag: E_normaal_netto * P_dag,
        },
        dal: {
          kwh: elektriciteitDal || 0,
          nettoKwh: E_dal_netto,
          teruglevering: Z_dal,
          tarief: P_nacht,
          bedrag: E_dal_netto * P_nacht,
        },
      }
    } else {
      // Overschot: volledige teruglevering
      overschotKwh = Z_kWh - E_tot
      nettoKwh = 0

      const opbrengstOverschot = overschotKwh * P_teruglever
      kostenElektriciteit = -opbrengstOverschot

      elektriciteitBreakdown = {
        type: 'dubbel',
        normaal: {
          kwh: elektriciteitNormaal,
          nettoKwh: 0,
          teruglevering: elektriciteitNormaal,
          tarief: P_dag,
          bedrag: 0,
        },
        dal: {
          kwh: elektriciteitDal || 0,
          nettoKwh: 0,
          teruglevering: elektriciteitDal || 0,
          tarief: P_nacht,
          bedrag: 0,
        },
        overschot: {
          kwh: overschotKwh,
          tarief: P_teruglever,
          opbrengst: opbrengstOverschot,
        },
      }
    }
  }

  // ============================================
  // 4. GAS BEREKENING
  // ============================================
  const totaalGas = gas || 0
  const kostenGas = totaalGas * P_gas_totaal
  const gasBreakdown = totaalGas > 0
    ? {
        m3: totaalGas,
        tarief: P_gas_totaal,
        bedrag: kostenGas,
      }
    : null

  // ============================================
  // 5. TERUGLEVERING BREAKDOWN (voor UI)
  // ============================================
  const opbrengstOverschot = overschotKwh > 0 ? overschotKwh * P_teruglever : 0
  const terugleveringBreakdown =
    overschotKwh > 0
      ? {
          kwh: overschotKwh,
          tarief: P_teruglever,
          opbrengst: opbrengstOverschot,
        }
      : null

  return {
    kostenElektriciteit,
    nettoKwh,
    overschotKwh,
    opbrengstOverschot,
    kostenGas,
    elektriciteitBreakdown,
    gasBreakdown,
    terugleveringBreakdown,
  }
}

