/**
 * Schat de aansluitwaarde voor elektriciteit en gas op basis van verbruik
 * 
 * Deze schattingen zijn gebaseerd op typische verbruikspatronen:
 * - Elektriciteit: gemiddelde belasting per jaar
 * - Gas: typische aansluitwaarden per verbruiksklasse
 */

export interface AansluitwaardeSchatting {
  elektriciteit: string
  gas: string
  elektriciteitToelichting: string
  gasToelichting: string
}

/**
 * Schat de elektrische aansluitwaarde op basis van jaarverbruik
 * 
 * Formule: Aansluitwaarde gebaseerd op piekvermogen en jaarverbruik
 * - Tot 5.000 kWh: 3x25A (kleinverbruik particulier)
 * - 5.001 - 15.000 kWh: 3x35A (klein zakelijk)
 * - 15.001 - 30.000 kWh: 3x50A (middelgroot zakelijk)
 * - 30.001 - 50.000 kWh: 3x63A (groot zakelijk)
 * - Boven 50.000 kWh: 3x80A (zeer groot zakelijk)
 */
export function schatElektriciteitAansluitwaarde(jaarverbruikKwh: number): {
  waarde: string
  toelichting: string
} {
  if (jaarverbruikKwh <= 5000) {
    return {
      waarde: '3x25A',
      toelichting: 'Kleinverbruik (huishoudelijk of zeer klein zakelijk)',
    }
  } else if (jaarverbruikKwh <= 15000) {
    return {
      waarde: '3x35A',
      toelichting: 'Klein zakelijk (bijv. kantoor, kleine winkel)',
    }
  } else if (jaarverbruikKwh <= 30000) {
    return {
      waarde: '3x50A',
      toelichting: 'Middelgroot zakelijk (bijv. horeca, productie)',
    }
  } else if (jaarverbruikKwh <= 50000) {
    return {
      waarde: '3x63A',
      toelichting: 'Groot zakelijk (bijv. grote productie, winkelketen)',
    }
  } else {
    return {
      waarde: '3x80A',
      toelichting: 'Zeer groot zakelijk (bijv. grote industrie)',
    }
  }
}

/**
 * Schat de gas aansluitwaarde op basis van jaarverbruik
 * 
 * Formule: Aansluitwaarde gebaseerd op m³ per jaar
 * - Tot 2.500 m³: G4 of G6 (kleinverbruik particulier)
 * - 2.501 - 10.000 m³: G10 (klein zakelijk)
 * - 10.001 - 25.000 m³: G16 (middelgroot zakelijk)
 * - Boven 25.000 m³: G25 (groot zakelijk)
 */
export function schatGasAansluitwaarde(jaarverbruikM3: number): {
  waarde: string
  toelichting: string
} {
  if (jaarverbruikM3 <= 2500) {
    return {
      waarde: 'G6',
      toelichting: 'Kleinverbruik (huishoudelijk of zeer klein zakelijk)',
    }
  } else if (jaarverbruikM3 <= 10000) {
    return {
      waarde: 'G10',
      toelichting: 'Klein zakelijk (bijv. kantoor met cv)',
    }
  } else if (jaarverbruikM3 <= 25000) {
    return {
      waarde: 'G16',
      toelichting: 'Middelgroot zakelijk (bijv. grote horeca)',
    }
  } else {
    return {
      waarde: 'G25',
      toelichting: 'Groot zakelijk (bijv. grote productie)',
    }
  }
}

/**
 * Schat alle aansluitwaarden op basis van verbruik
 */
export function schatAansluitwaarden(
  elektriciteitJaar: number,
  gasJaar: number | null
): AansluitwaardeSchatting {
  const elektriciteit = schatElektriciteitAansluitwaarde(elektriciteitJaar)
  const gas = gasJaar !== null && gasJaar > 0
    ? schatGasAansluitwaarde(gasJaar)
    : { waarde: 'G6', toelichting: 'Standaard (kleinverbruik)' }

  return {
    elektriciteit: elektriciteit.waarde,
    gas: gas.waarde,
    elektriciteitToelichting: elektriciteit.toelichting,
    gasToelichting: gas.toelichting,
  }
}

