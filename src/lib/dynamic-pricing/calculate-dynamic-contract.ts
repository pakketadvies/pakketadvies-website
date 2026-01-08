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
  
  // TERUGLEVERING: Altijd €0,02/kWh voor dynamische contracten
  const P_teruglever = S_enkel + 0.02
  
  const P_gas_totaal = P_gas + (opslagGas || 0)

  // ============================================
  // 3. ELEKTRICITEIT BEREKENING MET 30/70 SALDERING
  // ============================================
  // NIEUW: 30% eigen verbruik, 70% teruglevering
  const Z_totaal = terugleveringJaar || 0
  const eigenVerbruikKwh = Z_totaal * 0.30  // 30% direct gebruikt
  const terugleveringKwh = Z_totaal * 0.70  // 70% terug aan net
  
  let nettoKwh = 0
  let kostenElektriciteit = 0
  let overschotKwh = 0
  let elektriciteitBreakdown: any = {}

  if (!heeftDubbeleMeter) {
    // === ENKEL TARIEF met 30/70 SALDERING ===
    const E_enkel = elektriciteitNormaal
    
    // Trek eigenverbruik (30%) af van verbruik
    const E_na_eigenverbruik = Math.max(0, E_enkel - eigenVerbruikKwh)
    
    // Bereken netto verbruik en kosten
    nettoKwh = E_na_eigenverbruik
    kostenElektriciteit = nettoKwh * P_enkel
    
    // Teruglevering (70%) levert altijd geld op
    const opbrengstTeruglevering = terugleveringKwh * P_teruglever
    kostenElektriciteit = kostenElektriciteit - opbrengstTeruglevering
    
    // Als kosten negatief zijn, is er overschot
    overschotKwh = kostenElektriciteit < 0 ? terugleveringKwh : 0

    elektriciteitBreakdown = {
      type: 'enkel',
      enkel: {
        kwh: E_enkel,
        nettoKwh,
        overschotKwh,
        tarief: P_enkel,
        bedrag: kostenElektriciteit > 0 ? kostenElektriciteit : 0,
      },
    }
  }   else {
    // === DUBBEL TARIEF met 30/70 SALDERING ===
    const E_tot = elektriciteitNormaal + (elektriciteitDal || 0)
    
    // Trek eigenverbruik (30%) af van totaal verbruik
    // Verdeel proportioneel over dag en nacht
    const ratioNormaal = E_tot > 0 ? elektriciteitNormaal / E_tot : 0.5
    const ratioDal = E_tot > 0 ? (elektriciteitDal || 0) / E_tot : 0.5
    
    const eigenVerbruikNormaal = eigenVerbruikKwh * ratioNormaal
    const eigenVerbruikDal = eigenVerbruikKwh * ratioDal
    
    const E_normaal_na_eigen = Math.max(0, elektriciteitNormaal - eigenVerbruikNormaal)
    const E_dal_na_eigen = Math.max(0, (elektriciteitDal || 0) - eigenVerbruikDal)
    
    nettoKwh = E_normaal_na_eigen + E_dal_na_eigen
    
    // Bereken kosten
    const kostenNormaal = E_normaal_na_eigen * P_dag
    const kostenDal = E_dal_na_eigen * P_nacht
    kostenElektriciteit = kostenNormaal + kostenDal
    
    // Teruglevering (70%) levert altijd geld op
    const opbrengstTeruglevering = terugleveringKwh * P_teruglever
    kostenElektriciteit = kostenElektriciteit - opbrengstTeruglevering
    
    // Als kosten negatief zijn, is er overschot
    overschotKwh = kostenElektriciteit < 0 ? terugleveringKwh : 0

    elektriciteitBreakdown = {
      type: 'dubbel',
      normaal: {
        kwh: elektriciteitNormaal,
        nettoKwh: E_normaal_na_eigen,
        teruglevering: terugleveringKwh * ratioNormaal,
        tarief: P_dag,
        bedrag: kostenNormaal,
      },
      dal: {
        kwh: elektriciteitDal || 0,
        nettoKwh: E_dal_na_eigen,
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
  const opbrengstOverschot = terugleveringKwh * P_teruglever
  const terugleveringBreakdown = {
    kwh: terugleveringKwh,
    tarief: P_teruglever,
    opbrengst: opbrengstOverschot,
  }

  return {
    kostenElektriciteit,
    nettoKwh,
    overschotKwh,
    opbrengstOverschot,
    kostenGas,
    eigenVerbruikKwh,
    terugleveringKwh,
    elektriciteitBreakdown,
    gasBreakdown,
    terugleveringBreakdown,
  }
}

