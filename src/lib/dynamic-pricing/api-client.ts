/**
 * Dynamic Energy Pricing API Clients
 * 
 * Fetches real-time electricity and gas prices from:
 * 1. EnergyZero API (primary) - Dutch dynamic energy provider
 * 2. ENTSOE API (fallback) - European TSO platform
 * 
 * All prices returned are in €/kWh (electricity) and €/m³ (gas)
 * Prices are EXCLUDING BTW and EXCLUDING energiebelasting
 */

interface EnergyPrices {
  electricity: {
    average: number
    day: number
    night: number
    min: number
    max: number
  }
  gas: {
    average: number
    min: number
    max: number
  }
  source: 'ENERGYZERO' | 'ENTSOE'
  date: string
}

/**
 * Fetch prices from EnergyZero API
 * Free, no authentication required
 * Returns day-ahead prices for Dutch market
 */
async function fetchFromEnergyZero(date: Date): Promise<EnergyPrices | null> {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    // Fetch electricity prices
    const electricityResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!electricityResponse.ok) {
      console.warn(`EnergyZero electricity API failed: ${electricityResponse.status}`)
      return null
    }

    const electricityData = await electricityResponse.json()

    // Fetch gas prices
    const gasResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }
      }
    )

    if (!gasResponse.ok) {
      console.warn(`EnergyZero gas API failed: ${gasResponse.status}`)
      return null
    }

    const gasData = await gasResponse.json()

    // Process electricity data (hourly prices)
    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    if (electricityPrices.length === 0) {
      console.warn('No electricity prices returned from EnergyZero')
      return null
    }

    // Split into day (6-23) and night (23-6) periods
    const dayPrices = electricityPrices.filter((_: number, i: number) => {
      const hour = i % 24
      return hour >= 6 && hour < 23
    })
    const nightPrices = electricityPrices.filter((_: number, i: number) => {
      const hour = i % 24
      return hour < 6 || hour >= 23
    })

    const avgElectricity = electricityPrices.reduce((a: number, b: number) => a + b, 0) / electricityPrices.length
    const avgDay = dayPrices.length > 0 
      ? dayPrices.reduce((a: number, b: number) => a + b, 0) / dayPrices.length 
      : avgElectricity
    const avgNight = nightPrices.length > 0
      ? nightPrices.reduce((a: number, b: number) => a + b, 0) / nightPrices.length
      : avgElectricity
    const minElectricity = Math.min(...electricityPrices)
    const maxElectricity = Math.max(...electricityPrices)

    // Process gas data
    const gasPrices = gasData.Prices?.map((p: any) => p.price) || []
    const avgGas = gasPrices.length > 0
      ? gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
      : 0.80 // Fallback
    const minGas = gasPrices.length > 0 ? Math.min(...gasPrices) : avgGas
    const maxGas = gasPrices.length > 0 ? Math.max(...gasPrices) : avgGas

    console.log('✅ EnergyZero prices fetched successfully', {
      date: dateStr,
      electricity: avgElectricity.toFixed(5),
      gas: avgGas.toFixed(5)
    })

    return {
      electricity: {
        average: avgElectricity,
        day: avgDay,
        night: avgNight,
        min: minElectricity,
        max: maxElectricity,
      },
      gas: {
        average: avgGas,
        min: minGas,
        max: maxGas,
      },
      source: 'ENERGYZERO',
      date: dateStr,
    }
  } catch (error) {
    console.error('EnergyZero API error:', error)
    return null
  }
}

/**
 * Fetch prices from ENTSOE API (fallback)
 * Requires API key: ENTSOE_API_KEY environment variable
 */
async function fetchFromENTSOE(date: Date): Promise<EnergyPrices | null> {
  const apiKey = process.env.ENTSOE_API_KEY

  if (!apiKey) {
    console.warn('ENTSOE_API_KEY not configured, skipping ENTSOE fallback')
    return null
  }

  try {
    // ENTSOE uses specific date format: YYYYMMDD0000
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
    const startPeriod = `${dateStr}0000`
    
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const endDateStr = nextDay.toISOString().split('T')[0].replace(/-/g, '')
    const endPeriod = `${endDateStr}0000`

    // Day-ahead prices (document type A44)
    const url = `https://web-api.tp.entsoe.eu/api?` +
      `securityToken=${apiKey}&` +
      `documentType=A44&` +
      `in_Domain=10YNL----------L&` + // Netherlands
      `out_Domain=10YNL----------L&` +
      `periodStart=${startPeriod}&` +
      `periodEnd=${endPeriod}`

    const response = await fetch(url, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.warn(`ENTSOE API failed: ${response.status}`)
      return null
    }

    const xmlData = await response.text()
    
    // Parse XML (simplified - in production use proper XML parser)
    // Extract price points from XML
    const priceMatches = xmlData.matchAll(/<price\.amount>([\d.]+)<\/price\.amount>/g)
    const prices = Array.from(priceMatches).map(m => parseFloat(m[1]) / 1000) // Convert MWh to kWh

    if (prices.length === 0) {
      console.warn('No prices found in ENTSOE response')
      return null
    }

    const avgElectricity = prices.reduce((a, b) => a + b, 0) / prices.length
    const minElectricity = Math.min(...prices)
    const maxElectricity = Math.max(...prices)

    // ENTSOE doesn't provide gas prices, use estimated fallback
    const gasPrice = 0.80

    console.log('✅ ENTSOE prices fetched successfully', {
      date: date.toISOString().split('T')[0],
      electricity: avgElectricity.toFixed(5),
      dataPoints: prices.length
    })

    return {
      electricity: {
        average: avgElectricity,
        day: avgElectricity, // ENTSOE doesn't split day/night
        night: avgElectricity * 0.8, // Estimate: night ~20% cheaper
        min: minElectricity,
        max: maxElectricity,
      },
      gas: {
        average: gasPrice,
        min: gasPrice,
        max: gasPrice,
      },
      source: 'ENTSOE',
      date: date.toISOString().split('T')[0],
    }
  } catch (error) {
    console.error('ENTSOE API error:', error)
    return null
  }
}

/**
 * Main function: Fetch day-ahead prices with fallback strategy
 * 1. Try EnergyZero (easiest, most reliable)
 * 2. Fallback to ENTSOE if EnergyZero fails
 * 3. Return hardcoded fallback if all fails
 */
export async function fetchDayAheadPrices(date: Date = new Date()): Promise<EnergyPrices> {
  // Try EnergyZero first
  const energyZeroPrices = await fetchFromEnergyZero(date)
  if (energyZeroPrices) {
    return energyZeroPrices
  }

  console.warn('⚠️ EnergyZero failed, trying ENTSOE fallback...')

  // Fallback to ENTSOE
  const entsoePrices = await fetchFromENTSOE(date)
  if (entsoePrices) {
    return entsoePrices
  }

  console.error('❌ All pricing sources failed')
  
  // Don't return fallback data - throw error instead
  // This ensures we never save FALLBACK data to the database
  throw new Error('Failed to fetch prices from all available sources')
}

/**
 * Fetch historical average (last 7 days)
 * Useful for trend analysis
 */
export async function fetchHistoricalAverage(): Promise<{ electricity: number; gas: number }> {
  const promises = []
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    promises.push(fetchDayAheadPrices(date))
  }

  const results = await Promise.all(promises)
  
  const avgElectricity = results.reduce((sum, r) => sum + r.electricity.average, 0) / results.length
  const avgGas = results.reduce((sum, r) => sum + r.gas.average, 0) / results.length

  return {
    electricity: avgElectricity,
    gas: avgGas,
  }
}

