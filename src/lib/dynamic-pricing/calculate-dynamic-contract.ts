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
  
  // Saldering details (voor UI)
  eigenVerbruikKwh: number // 30% van opwekking
  terugleveringKwh: number // 70% van opwekking
  
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
  
  // TERUGLEVERING: Spotprijs MINUS opslag_teruglevering (zoals Energiek.nl)
  // Dit is het NETTO tarief dat je krijgt voor ALLE teruglevering
  const P_teruglever = S_enkel - (opslagTeruglevering || 0)
  
  const P_gas_totaal = P_gas + (opslagGas || 0)

  // ============================================
  // 3. ELEKTRICITEIT BEREKENING (ZOALS ENERGIEK.NL)
  // ============================================
  // GEEN 30/70 split! De meter ziet al het netto.
  // "terugleveringJaar" is wat de meter ziet dat naar het net gaat.
  const terugleveringKwh = terugleveringJaar || 0
  
  let nettoKwh = 0
  let kostenElektriciteit = 0
  let overschotKwh = 0
  let elektriciteitBreakdown: any = {}

  if (!heeftDubbeleMeter) {
    // === ENKEL TARIEF ===
    const E_enkel = elektriciteitNormaal
    
    // Kosten voor verbruik (van net)
    const kostenVerbruik = E_enkel * P_enkel
    
    // Opbrengst voor teruglevering (naar net)
    const opbrengstTeruglevering = terugleveringKwh * P_teruglever
    
    // Netto kosten
    kostenElektriciteit = kostenVerbruik - opbrengstTeruglevering
    
    // Voor energiebelasting: netto verbruik
    nettoKwh = Math.max(0, E_enkel - terugleveringKwh)
    
    // Overschot voor weergave (als teruglevering > verbruik)
    overschotKwh = Math.max(0, terugleveringKwh - E_enkel)

    elektriciteitBreakdown = {
      type: 'enkel',
      enkel: {
        kwh: E_enkel,
        nettoKwh,
        overschotKwh,
        tarief: P_enkel,
        bedrag: kostenVerbruik,
      },
    }
  }   else {
    // === DUBBEL TARIEF ===
    const E_normaal = elektriciteitNormaal
    const E_dal = elektriciteitDal || 0
    const E_totaal = E_normaal + E_dal
    
    // Kosten voor verbruik (van net)
    const kostenNormaal = E_normaal * P_dag
    const kostenDal = E_dal * P_nacht
    const kostenVerbruik = kostenNormaal + kostenDal
    
    // Opbrengst voor teruglevering (naar net)
    // Bij dubbel tarief gebruiken we gemiddelde spotprijs voor teruglevering
    const opbrengstTeruglevering = terugleveringKwh * P_teruglever
    
    // Netto kosten
    kostenElektriciteit = kostenVerbruik - opbrengstTeruglevering
    
    // Voor energiebelasting: netto verbruik
    nettoKwh = Math.max(0, E_totaal - terugleveringKwh)
    
    // Overschot voor weergave
    overschotKwh = Math.max(0, terugleveringKwh - E_totaal)

    // Verdeel teruglevering proportioneel over dag/nacht voor weergave
    const ratioNormaal = E_totaal > 0 ? E_normaal / E_totaal : 0.5
    const ratioDal = E_totaal > 0 ? E_dal / E_totaal : 0.5

      elektriciteitBreakdown = {
        type: 'dubbel',
        normaal: {
          kwh: E_normaal,
        nettoKwh: Math.max(0, E_normaal - (terugleveringKwh * ratioNormaal)),
        teruglevering: terugleveringKwh * ratioNormaal,
          tarief: P_dag,
        bedrag: kostenNormaal,
        },
        dal: {
          kwh: E_dal,
        nettoKwh: Math.max(0, E_dal - (terugleveringKwh * ratioDal)),
        teruglevering: terugleveringKwh * ratioDal,
          tarief: P_nacht,
        bedrag: kostenDal,
        },
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
  const opbrengstTeruglevering = terugleveringKwh * P_teruglever
  const terugleveringBreakdown = {
    kwh: terugleveringKwh,
    tarief: P_teruglever,
    opbrengst: opbrengstTeruglevering,
  }

  return {
    kostenElektriciteit,
    nettoKwh,
    overschotKwh,
    opbrengstOverschot: 0, // Geen aparte overschot vergoeding meer
    kostenGas,
    eigenVerbruikKwh: 0, // Niet meer relevant
    terugleveringKwh,
    elektriciteitBreakdown,
    gasBreakdown,
    terugleveringBreakdown,
  }
}

