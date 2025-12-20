export type ConsumerEstimateInput = {
  householdSize: number
  hasGas: boolean
  hasSolar: boolean
  hasSmartMeter: boolean
}

export type ConsumerEstimateOutput = {
  electricityNormalKwh: number
  electricityOffPeakKwh: number
  gasM3: number
  meterType: 'slim' | 'oud'
}

/**
 * Simple deterministic estimation for consumer wizard.
 * Goal: fast, predictable, and "good enough" with easy manual adjustment afterwards.
 */
export function estimateConsumerUsage(input: ConsumerEstimateInput): ConsumerEstimateOutput {
  const size = clampInt(input.householdSize, 1, 6)

  // Typical yearly electricity (kWh) by household size (NL-like heuristic)
  const baseElectricityBySize: Record<number, number> = {
    1: 1800,
    2: 2700,
    3: 3300,
    4: 4000,
    5: 4700,
    6: 5400,
  }

  // Typical yearly gas (m3) by household size (very rough; depends heavily on home/insulation)
  const baseGasBySize: Record<number, number> = {
    1: 800,
    2: 1000,
    3: 1200,
    4: 1400,
    5: 1600,
    6: 1800,
  }

  let totalKwh = baseElectricityBySize[size]
  let gasM3 = input.hasGas ? baseGasBySize[size] : 0

  // Solar households tend to have slightly higher consumption (more electric usage), but net differs.
  // We keep it simple: do not change base consumption; solar effect is handled by "teruglevering" later.
  if (input.hasSolar) {
    totalKwh = Math.round(totalKwh * 1.05)
  }

  const offPeakRatio = 0.35
  const electricityOffPeakKwh = Math.round(totalKwh * offPeakRatio)
  const electricityNormalKwh = Math.max(0, totalKwh - electricityOffPeakKwh)

  return {
    electricityNormalKwh,
    electricityOffPeakKwh,
    gasM3,
    meterType: input.hasSmartMeter ? 'slim' : 'oud',
  }
}

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  const v = Math.round(value)
  return Math.min(max, Math.max(min, v))
}


