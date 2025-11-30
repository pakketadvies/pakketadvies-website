/**
 * Script to load ALL available historical energy prices
 * 
 * Strategy:
 * 1. Start from today and go backwards
 * 2. Try EnergyZero API for each date
 * 3. Load as much historical data as available
 * 4. Stop when we hit dates with no data available
 * 
 * Usage:
 *   npx ts-node scripts/load-all-available-historical-prices.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_66788a47001b20bcb6275c4e8b2453e474d0efc0'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dxztyhwiwgrxjnlohapm.supabase.co'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

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
  source: string
  date: string
}

/**
 * Fetch prices from EnergyZero API
 */
async function fetchFromEnergyZero(date: Date): Promise<EnergyPrices | null> {
  try {
    const dateStr = date.toISOString().split('T')[0]
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    const [electricityResponse, gasResponse] = await Promise.all([
      fetch(`https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`, {
        headers: { 'Accept': 'application/json' },
      }),
      fetch(`https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`, {
        headers: { 'Accept': 'application/json' },
      })
    ])

    if (!electricityResponse.ok || !gasResponse.ok) {
      return null
    }

    const [electricityData, gasData] = await Promise.all([
      electricityResponse.json(),
      gasResponse.json()
    ])

    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    const gasPrices = gasData.Prices?.map((p: any) => p.price) || []

    if (electricityPrices.length === 0 || gasPrices.length === 0) {
      return null
    }

    // Process electricity
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

    const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length

    return {
      electricity: {
        average: avgElectricity,
        day: avgDay,
        night: avgNight,
        min: Math.min(...electricityPrices),
        max: Math.max(...electricityPrices),
      },
      gas: {
        average: avgGas,
        min: Math.min(...gasPrices),
        max: Math.max(...gasPrices),
      },
      source: 'ENERGYZERO',
      date: dateStr,
    }
  } catch (error) {
    return null
  }
}

/**
 * Save prices to database
 */
async function savePrices(prices: EnergyPrices): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('dynamic_prices')
      .upsert({
        datum: prices.date,
        elektriciteit_gemiddeld_dag: prices.electricity.day,
        elektriciteit_gemiddeld_nacht: prices.electricity.night,
        elektriciteit_min_dag: prices.electricity.min,
        elektriciteit_max_dag: prices.electricity.max,
        gas_gemiddeld: prices.gas.average,
        gas_min: prices.gas.min,
        gas_max: prices.gas.max,
        bron: prices.source,
        laatst_geupdate: new Date().toISOString(),
        is_voorspelling: false,
      }, {
        onConflict: 'datum'
      })

    return !error
  } catch (error) {
    return false
  }
}

/**
 * Sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main function - loads data going backwards from today
 */
async function main() {
  console.log('🚀 Loading all available historical prices')
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  const today = new Date()
  const maxDaysBack = 5 * 365 // 5 years
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 30 // Stop after 30 consecutive failures

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  console.log('📅 Starting from today and going backwards...')
  console.log('   Will stop after 30 consecutive days with no data')
  console.log('')

  // Process dates going backwards from today
  for (let daysBack = 0; daysBack < maxDaysBack; daysBack++) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysBack)
    const dateStr = date.toISOString().split('T')[0]

    // Check if already exists
    const { data: existing } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('datum', dateStr)
      .single()

    if (existing) {
      if (daysBack % 100 === 0) {
        console.log(`   ⏭️  ${dateStr}: Already exists (${daysBack} days back)`)
      }
      skipCount++
      consecutiveFailures = 0 // Reset counter if we find existing data
      continue
    }

    // Fetch prices
    const prices = await fetchFromEnergyZero(date)
    
    if (!prices) {
      failCount++
      consecutiveFailures++
      
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log('')
        console.log(`⚠️  Stopping: ${maxConsecutiveFailures} consecutive days with no data`)
        console.log(`   Last successful date: ${daysBack - consecutiveFailures} days ago`)
        break
      }
      
      if (daysBack % 50 === 0) {
        console.log(`   ❌ ${dateStr}: No data (${daysBack} days back, ${consecutiveFailures} consecutive failures)`)
      }
      
      await sleep(100) // Small delay even on failures
      continue
    }

    // Save to database
    const saved = await savePrices(prices)
    
    if (saved) {
      successCount++
      consecutiveFailures = 0 // Reset on success
      
      if (successCount % 50 === 0 || daysBack < 100) {
        console.log(`   ✅ ${dateStr}: Saved (€${prices.electricity.average.toFixed(5)}/kWh, €${prices.gas.average.toFixed(5)}/m³) [${daysBack} days back]`)
      }
    } else {
      failCount++
      consecutiveFailures++
    }

    // Rate limiting
    await sleep(200)
    
    // Progress update every 100 days
    if (daysBack > 0 && daysBack % 100 === 0) {
      console.log(`   📊 Progress: ${daysBack} days processed, ${successCount} saved, ${failCount} failed, ${skipCount} skipped`)
    }
  }

  // Summary
  console.log('')
  console.log('='.repeat(60))
  console.log('📊 Import Summary')
  console.log('='.repeat(60))
  console.log(`   ✅ Successfully imported: ${successCount}`)
  console.log(`   ⏭️  Skipped (already exists): ${skipCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📅 Total days processed: ${successCount + failCount + skipCount}`)
  console.log('='.repeat(60))
  
  // Check what we have in database now
  const { count } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })
  
  console.log('')
  console.log(`📊 Total records in database: ${count || 0}`)
  
  // Get date range
  const { data: oldest } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: true })
    .limit(1)
    .single()
  
  const { data: newest } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: false })
    .limit(1)
    .single()
  
  if (oldest && newest) {
    console.log(`📅 Date range in database: ${oldest.datum} to ${newest.datum}`)
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

