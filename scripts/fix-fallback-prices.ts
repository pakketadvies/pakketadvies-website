/**
 * Script to fix fallback prices for November 30, 29, 28
 * Fetches real prices from EnergyZero API and updates the database
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchPricesFromEnergyZero(dateStr: string) {
  const nextDay = new Date(dateStr)
  nextDay.setDate(nextDay.getDate() + 1)
  const nextDayStr = nextDay.toISOString().split('T')[0]

  try {
    const [electricityResponse, gasResponse] = await Promise.all([
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
    ])

    if (!electricityResponse.ok || !gasResponse.ok) {
      throw new Error(`API request failed for ${dateStr}`)
    }

    const [electricityData, gasData] = await Promise.all([
      electricityResponse.json(),
      gasResponse.json(),
    ])

    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    const gasPrices = gasData.Prices?.map((p: any) => p.price) || []

    if (electricityPrices.length === 0 || gasPrices.length === 0) {
      throw new Error(`No price data for ${dateStr}`)
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

    const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length

    return {
      elektriciteit_gemiddeld_dag: avgDay,
      elektriciteit_gemiddeld_nacht: avgNight,
      elektriciteit_min_dag: Math.min(...electricityPrices),
      elektriciteit_max_dag: Math.max(...electricityPrices),
      gas_gemiddeld: avgGas,
      gas_min: Math.min(...gasPrices),
      gas_max: Math.max(...gasPrices),
    }
  } catch (error) {
    console.error(`Error fetching prices for ${dateStr}:`, error)
    return null
  }
}

async function fixFallbackPrices() {
  const dates = ['2025-11-30', '2025-11-29', '2025-11-28']

  console.log('🔄 Starting fallback price fix...')

  for (const dateStr of dates) {
    console.log(`\n📅 Processing ${dateStr}...`)

    // Check if record exists and is FALLBACK
    const { data: existing } = await supabase
      .from('dynamic_prices')
      .select('*')
      .eq('datum', dateStr)
      .single()

    if (!existing) {
      console.log(`⚠️  No record found for ${dateStr}, skipping...`)
      continue
    }

    if (existing.bron !== 'FALLBACK') {
      console.log(`✅ ${dateStr} already has real data (${existing.bron}), skipping...`)
      continue
    }

    // Fetch real prices
    const prices = await fetchPricesFromEnergyZero(dateStr)

    if (!prices) {
      console.log(`❌ Failed to fetch prices for ${dateStr}`)
      continue
    }

    // Update database
    const { error } = await supabase
      .from('dynamic_prices')
      .update({
        ...prices,
        bron: 'ENERGYZERO',
        laatst_geupdate: new Date().toISOString(),
      })
      .eq('datum', dateStr)

    if (error) {
      console.error(`❌ Failed to update ${dateStr}:`, error)
    } else {
      console.log(`✅ Successfully updated ${dateStr}`)
      console.log(`   Electricity: €${prices.elektriciteit_gemiddeld_dag.toFixed(5)}/kWh`)
      console.log(`   Gas: €${prices.gas_gemiddeld.toFixed(5)}/m³`)
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log('\n✅ Done!')
}

// Run if executed directly
if (require.main === module) {
  fixFallbackPrices()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { fixFallbackPrices }

