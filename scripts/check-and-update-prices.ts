/**
 * Script to check current prices in Supabase and update if needed
 * 
 * Usage:
 *   npx ts-node scripts/check-and-update-prices.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local
try {
  const envPath = resolve(__dirname, '../.env.local')
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    }
  })
} catch (error) {
  console.warn('⚠️  Could not load .env.local, using environment variables from system')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Make sure these are set in .env.local or as environment variables')
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

    console.log(`   📡 Fetching from EnergyZero API for ${dateStr}...`)

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
      console.error(`   ❌ Electricity API failed: ${electricityResponse.status}`)
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
      console.error(`   ❌ Gas API failed: ${gasResponse.status}`)
      return null
    }

    const gasData = await gasResponse.json()

    // Process electricity data
    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    if (electricityPrices.length === 0) {
      console.error(`   ❌ No electricity prices in response`)
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
      console.error(`   ❌ No gas prices in response`)
      return null
    }
    
    const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
    const minGas = Math.min(...gasPrices)
    const maxGas = Math.max(...gasPrices)

    console.log(`   ✅ Fetched: Elec €${avgElectricity.toFixed(5)}/kWh, Gas €${avgGas.toFixed(5)}/m³`)

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
    console.error(`   ❌ Error fetching EnergyZero for ${date.toISOString().split('T')[0]}:`, error)
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
      console.error(`   ❌ Failed to save: ${error.message}`)
      return false
    }

    return true
  } catch (error) {
    console.error(`   ❌ Error saving:`, error)
    return false
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking and updating prices in Supabase...')
  console.log('')

  // Check what's in the database
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  console.log('📊 Checking recent prices (last 7 days)...')
  const { data: recentPrices, error: fetchError } = await supabase
    .from('dynamic_prices')
    .select('datum, elektriciteit_gemiddeld_dag, gas_gemiddeld, bron, laatst_geupdate')
    .gte('datum', sevenDaysAgo.toISOString().split('T')[0])
    .lte('datum', today.toISOString().split('T')[0])
    .order('datum', { ascending: false })

  if (fetchError) {
    console.error('❌ Error fetching data:', fetchError)
    process.exit(1)
  }

  console.log(`   Found ${recentPrices?.length || 0} records in database`)
  if (recentPrices && recentPrices.length > 0) {
    console.log('   Recent prices:')
    recentPrices.slice(0, 5).forEach((p: any) => {
      console.log(`     ${p.datum}: Elec €${p.elektriciteit_gemiddeld_dag?.toFixed(5) || 'N/A'}/kWh, Gas €${p.gas_gemiddeld?.toFixed(5) || 'N/A'}/m³ (${p.bron})`)
    })
  }
  console.log('')

  // Update last 7 days
  console.log('🔄 Updating last 7 days with fresh data from API...')
  console.log('')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    console.log(`📅 Processing ${dateStr}...`)

    const prices = await fetchFromEnergyZero(date)
    
    if (!prices) {
      console.log(`   ❌ Failed to fetch prices`)
      failCount++
      continue
    }

    const saved = await savePrices(prices)
    
    if (saved) {
      console.log(`   ✅ Saved successfully`)
      successCount++
    } else {
      console.log(`   ❌ Failed to save`)
      failCount++
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
    console.log('')
  }

  // Summary
  console.log('='.repeat(60))
  console.log('📊 Update Summary')
  console.log('='.repeat(60))
  console.log(`   ✅ Successfully updated: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log('='.repeat(60))

  // Check total records
  const { count } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })

  console.log('')
  console.log(`📊 Total records in database: ${count || 0}`)
}

// Run script
main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

