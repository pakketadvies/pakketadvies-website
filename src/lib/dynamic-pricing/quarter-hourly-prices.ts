/**
 * Quarter-Hourly Electricity Prices
 * 
 * Fetches and generates quarter-hourly (15-minute) electricity prices
 * from various sources with intelligent interpolation
 */

interface QuarterHourlyPrice {
  hour: number
  quarter: number // 0, 1, 2, 3 (00, 15, 30, 45 minutes)
  timestamp: string
  price: number
  time: string // HH:MM format
}

/**
 * Parse ENTSOE XML to extract quarter-hourly prices with timestamps
 */
export async function fetchQuarterHourlyFromENTSOE(date: Date): Promise<QuarterHourlyPrice[] | null> {
  const apiKey = process.env.ENTSOE_API_KEY

  if (!apiKey) {
    return null
  }

  try {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
    const startPeriod = `${dateStr}0000`
    
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const endDateStr = nextDay.toISOString().split('T')[0].replace(/-/g, '')
    const endPeriod = `${endDateStr}0000`

    const url = `https://web-api.tp.entsoe.eu/api?` +
      `securityToken=${apiKey}&` +
      `documentType=A44&` +
      `in_Domain=10YNL----------L&` +
      `out_Domain=10YNL----------L&` +
      `periodStart=${startPeriod}&` +
      `periodEnd=${endPeriod}`

    const response = await fetch(url, {
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return null
    }

    const xmlData = await response.text()
    
    // Parse XML to extract time series with timestamps
    // ENTSOE XML structure: <TimeSeries><Period><Point position="1" price.amount="..."/>
    const timeSeriesMatches = xmlData.matchAll(/<TimeSeries>[\s\S]*?<\/TimeSeries>/g)
    const quarterHourlyPrices: QuarterHourlyPrice[] = []
    
    for (const timeSeriesMatch of timeSeriesMatches) {
      const timeSeries = timeSeriesMatch[0]
      
      // Extract start time
      const startMatch = timeSeries.match(/<start>(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})Z<\/start>/)
      if (!startMatch) continue
      
      const startTime = new Date(startMatch[1] + 'Z')
      
      // Extract resolution (should be PT15M for quarter-hourly)
      const resolutionMatch = timeSeries.match(/<resolution>PT(\d+)M<\/resolution>/)
      const resolutionMinutes = resolutionMatch ? parseInt(resolutionMatch[1]) : 60
      
      // Extract price points
      const pointMatches = timeSeries.matchAll(/<Point position="(\d+)"[\s\S]*?price\.amount="([\d.]+)"/g)
      
      for (const pointMatch of pointMatches) {
        const position = parseInt(pointMatch[1]) - 1 // 0-indexed
        const price = parseFloat(pointMatch[2]) / 1000 // Convert MWh to kWh
        
        const pointTime = new Date(startTime)
        pointTime.setMinutes(pointTime.getMinutes() + (position * resolutionMinutes))
        
        const hour = pointTime.getUTCHours()
        const quarter = Math.floor(pointTime.getUTCMinutes() / 15)
        
        quarterHourlyPrices.push({
          hour,
          quarter,
          timestamp: pointTime.toISOString(),
          price,
          time: `${String(hour).padStart(2, '0')}:${String(quarter * 15).padStart(2, '0')}`,
        })
      }
    }
    
    // Sort by timestamp
    quarterHourlyPrices.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    
    if (quarterHourlyPrices.length >= 96) {
      console.log(`✅ Fetched ${quarterHourlyPrices.length} quarter-hourly prices from ENTSOE`)
      return quarterHourlyPrices
    }
    
    return null
  } catch (error) {
    console.error('ENTSOE quarter-hourly fetch error:', error)
    return null
  }
}

/**
 * Interpolate hourly prices to quarter-hourly prices
 * Uses realistic market patterns: gradual transitions between hours
 */
export function interpolateHourlyToQuarterHourly(
  hourlyPrices: Array<{ hour: number; price: number; timestamp?: string }>,
  dateStr: string
): QuarterHourlyPrice[] {
  const quarterHourlyPrices: QuarterHourlyPrice[] = []
  
  for (let i = 0; i < hourlyPrices.length; i++) {
    const currentHour = hourlyPrices[i]
    const nextHour = hourlyPrices[i + 1] || currentHour // Use same price for last hour
    
    const currentPrice = currentHour.price
    const nextPrice = nextHour.price
    
    // Calculate price change per quarter
    const priceDelta = nextPrice - currentPrice
    
    // Create 4 quarter-hour records for this hour
    for (let q = 0; q < 4; q++) {
      let price: number
      
      // Use cubic interpolation for smoother transitions
      // This creates a more realistic price curve
      const t = q / 4 // 0, 0.25, 0.5, 0.75
      
      // Cubic interpolation: smooth curve between current and next hour
      // This mimics real market behavior where prices don't jump instantly
      // Use smoothstep for natural transitions
      const smoothT = t * t * (3 - 2 * t) // Smoothstep function
      price = currentPrice + (priceDelta * smoothT)
      
      // Add deterministic variation based on hour and quarter
      // This creates realistic intra-hour price fluctuations without randomness
      // Variation pattern: slight increase in Q1, peak in Q2, decrease in Q3, stable in Q4
      const variationPattern = [0.005, 0.01, 0.007, 0.002] // Small percentage variations
      const variation = variationPattern[q] * price * (Math.sin(currentHour.hour * Math.PI / 12) * 0.5 + 0.5)
      price = price + variation
      
      const timestamp = new Date(`${dateStr}T${String(currentHour.hour).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}:00Z`)
      
      quarterHourlyPrices.push({
        hour: currentHour.hour,
        quarter: q,
        timestamp: timestamp.toISOString(),
        price: Math.max(0, price), // Ensure non-negative
        time: `${String(currentHour.hour).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}`,
      })
    }
  }
  
  return quarterHourlyPrices
}

/**
 * Main function: Get quarter-hourly prices with fallback strategy
 * 1. Try ENTSOE API (96 real quarter-hourly prices)
 * 2. Fallback to EnergyZero hourly + interpolation (24 → 96 prices)
 */
export async function getQuarterHourlyPrices(date: Date): Promise<QuarterHourlyPrice[]> {
  const dateStr = date.toISOString().split('T')[0]
  
  // Try ENTSOE first (real quarter-hourly data)
  const entsoePrices = await fetchQuarterHourlyFromENTSOE(date)
  if (entsoePrices && entsoePrices.length >= 96) {
    return entsoePrices
  }
  
  // Fallback: Fetch hourly from EnergyZero and interpolate
  try {
    const nextDay = new Date(dateStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    
    const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}T00:00:00Z&tillDate=${nextDayStr}T00:00:00Z&interval=4&usageType=1&inclBtw=false`
    
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 }
    })
    
    if (response.ok) {
      const data = await response.json()
      const prices = data.Prices || []
      
      if (prices.length >= 24) {
        // Transform to hourly format
        const hourlyPrices = prices
          .map((p: any) => {
            const dateStr = p.readingDate || p.from
            if (!dateStr) return null
            
            const date = new Date(dateStr)
            if (isNaN(date.getTime())) return null
            
            const hour = date.getUTCHours()
            if (typeof p.price !== 'number' || isNaN(p.price)) return null
            
            return {
              hour,
              price: p.price,
              timestamp: date.toISOString(),
            }
          })
          .filter((item: any) => item !== null)
          .sort((a: any, b: any) => a.hour - b.hour)
        
        if (hourlyPrices.length >= 24) {
          // Interpolate to quarter-hourly
          const quarterHourly = interpolateHourlyToQuarterHourly(hourlyPrices, dateStr)
          console.log(`✅ Interpolated ${hourlyPrices.length} hourly prices to ${quarterHourly.length} quarter-hourly prices`)
          return quarterHourly
        }
      }
    }
  } catch (error) {
    console.error('Error fetching hourly prices for interpolation:', error)
  }
  
  // Ultimate fallback: return empty array (should not happen)
  console.warn('⚠️ Could not fetch quarter-hourly prices from any source')
  return []
}

