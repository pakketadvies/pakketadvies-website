/**
 * Script to load ALL historical dynamic energy prices (5 years)
 * 
 * This script will:
 * 1. Load prices from 5 years ago to today
 * 2. Skip dates that already exist (except recent 7 days which are always updated)
 * 3. Use EnergyZero API with rate limiting
 * 
 * Usage:
 *   npx ts-node scripts/load-all-historical-prices.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY')
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
  source: 'ENERGYZERO' | 'ENTSOE' | 'FALLBACK'
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

    // Fetch electricity prices
    const electricityResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!electricityResponse.ok) {
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
      }
    )

    if (!gasResponse.ok) {
      return null
    }

    const gasData = await gasResponse.json()

    // Process electricity data
    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    if (electricityPrices.length === 0) {
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
    if (gasPrices.length === 0) {
      return null
    }
    
    const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
    const minGas = Math.min(...gasPrices)
    const maxGas = Math.max(...gasPrices)

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
    console.error(`Error fetching EnergyZero for ${date.toISOString().split('T')[0]}:`, error)
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

    if (error) {
      console.error(`❌ Failed to save prices for ${prices.date}:`, error.message)
      return false
    }

    return true
  } catch (error) {
    console.error(`❌ Error saving prices for ${prices.date}:`, error)
    return false
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting complete historical price import (5 years)')
  console.log('')

  // Calculate date range: 5 years ago to today
  const today = new Date()
  const fiveYearsAgo = new Date(today)
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  console.log(`📅 Date range: ${fiveYearsAgo.toISOString().split('T')[0]} to ${today.toISOString().split('T')[0]}`)
  console.log('')

  // Generate all dates
  const dates: Date[] = []
  const currentDate = new Date(fiveYearsAgo)
  while (currentDate <= today) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log(`📅 Total days to process: ${dates.length}`)
  console.log('')

  let successCount = 0
  let failCount = 0
  let skipCount = 0

  // Process dates in batches to avoid overwhelming the API
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds

  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE)
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE)

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} days)...`)

    const batchPromises = batch.map(async (date) => {
      const dateStr = date.toISOString().split('T')[0]
      
      // Check if already exists
      const { data: existing } = await supabase
        .from('dynamic_prices')
        .select('datum, laatst_geupdate')
        .eq('datum', dateStr)
        .single()

      // Always update recent dates (last 7 days) to ensure accuracy
      const dateObj = new Date(dateStr)
      const daysDiff = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
      const isRecent = daysDiff <= 7

      if (existing && !isRecent) {
        console.log(`   ⏭️  ${dateStr}: Already exists (${daysDiff} days ago), skipping`)
        skipCount++
        return
      }

      if (existing && isRecent) {
        console.log(`   🔄 ${dateStr}: Exists but is recent, updating...`)
      }

      // Fetch prices
      const prices = await fetchFromEnergyZero(date)
      
      if (!prices) {
        console.log(`   ❌ ${dateStr}: Failed to fetch prices`)
        failCount++
        return
      }

      // Save to database
      const saved = await savePrices(prices)
      
      if (saved) {
        console.log(`   ✅ ${dateStr}: Saved (€${prices.electricity.average.toFixed(5)}/kWh, €${prices.gas.average.toFixed(5)}/m³)`)
        successCount++
      } else {
        console.log(`   ❌ ${dateStr}: Failed to save`)
        failCount++
      }

      // Rate limiting: small delay between requests
      await sleep(100)
    })

    await Promise.all(batchPromises)

    // Delay between batches
    if (i + BATCH_SIZE < dates.length) {
      await sleep(DELAY_BETWEEN_BATCHES)
    }

    console.log('')
  }

  // Summary
  console.log('='.repeat(60))
  console.log('📊 Import Summary')
  console.log('='.repeat(60))
  console.log(`   ✅ Successfully imported: ${successCount}`)
  console.log(`   ⏭️  Skipped (already exists): ${skipCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📅 Total processed: ${dates.length}`)
  console.log('='.repeat(60))
}

// Run script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

