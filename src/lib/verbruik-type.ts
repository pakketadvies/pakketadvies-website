/**
 * Bepaalt of een gebruiker grootverbruik heeft op basis van aansluitwaarden
 * 
 * Regels:
 * - Elektriciteit: > 3x80A = grootverbruik
 * - Gas: > G25 = grootverbruik
 * - Als EITHER elektriciteit OF gas grootverbruik is, dan is de gebruiker grootverbruiker
 */
export function isGrootverbruik(
  aansluitwaardeElektriciteit?: string,
  aansluitwaardeGas?: string
): boolean {
  // Elektriciteit: > 3x80A is grootverbruik
  const isGrootverbruikElektriciteit = aansluitwaardeElektriciteit 
    ? isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)
    : false
  
  // Gas: > G25 is grootverbruik
  const isGrootverbruikGas = aansluitwaardeGas
    ? isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)
    : false
  
  // Als EITHER grootverbruik is, dan is de gebruiker grootverbruiker
  return isGrootverbruikElektriciteit || isGrootverbruikGas
}

/**
 * Check of elektriciteit aansluitwaarde grootverbruik is
 * > 3x80A = grootverbruik
 */
export function isGrootverbruikElektriciteitAansluitwaarde(aansluitwaarde: string): boolean {
  // Alle waarden ≤ 3x80A zijn kleinverbruik
  const kleinverbruikWaarden = [
    '1x25A', '1x35A', '1x40A',
    '3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A'
  ]
  
  return !kleinverbruikWaarden.includes(aansluitwaarde)
}

/**
 * Check of gas aansluitwaarde grootverbruik is
 * > G25 = grootverbruik
 */
export function isGrootverbruikGasAansluitwaarde(aansluitwaarde: string): boolean {
  // Alle waarden ≤ G25 zijn kleinverbruik
  const kleinverbruikWaarden = [
    'G4', 'G6', 'G6_LAAG', 'G6_MIDDEN', 'G6_HOOG',
    'G10', 'G16', 'G25'
  ]
  
  return !kleinverbruikWaarden.includes(aansluitwaarde)
}

