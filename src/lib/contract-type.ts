import type { ContractOptie } from '@/types/calculator'
import type { VerbruikData } from '@/types/calculator'

/**
 * Bepaalt het contract type (particulier of zakelijk) op basis van:
 * 1. target_audience van het contract (prioriteit)
 * 2. addressType uit verbruik data (fallback)
 * 3. 'zakelijk' als laatste fallback
 */
export function bepaalContractType(
  contract: ContractOptie | null | undefined,
  verbruik: VerbruikData | null | undefined
): 'particulier' | 'zakelijk' {
  // Prioriteit 1: target_audience van contract
  if (contract?.targetAudience) {
    if (contract.targetAudience === 'particulier') {
      return 'particulier'
    }
    if (contract.targetAudience === 'zakelijk') {
      return 'zakelijk'
    }
    // Als 'both', gebruik addressType uit verbruik
    if (contract.targetAudience === 'both' && verbruik?.addressType) {
      return verbruik.addressType
    }
  }

  // Prioriteit 2: addressType uit verbruik
  if (verbruik?.addressType) {
    return verbruik.addressType
  }

  // Fallback: standaard zakelijk
  return 'zakelijk'
}

