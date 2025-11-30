/**
 * Script to replace all FALLBACK records with real data
 * 
 * Usage:
 *   npx ts-node scripts/replace-all-fallback-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../.env.vercel'),
]

for (const envPath of envPaths) {
  try {
    const envFile = readFileSync(envPath, 'utf-8')
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          // Remove quotes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          // Handle escaped newlines and remove trailing newlines
          value = value.replace(/\\n/g, '').replace(/\n$/, '').trim()
          if (value) {
            process.env[key] = value
          }
        }
      }
    })
    console.log(`✅ Loaded environment from ${envPath}`)
  } catch (e) {
    // Try next file
  }
}

// Debug: Check if variables are loaded
console.log(`🔍 SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`)
console.log(`🔍 SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (' + process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...)' : 'Missing'}`)
console.log('')

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dxztyhwiwgrxjnlohapm.supabase.co'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('   Make sure SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL are set')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Fetch prices from EnergyZero API
 */
async function fetchFromEnergyZero(date: Date): Promise<any | null> {
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
      elektriciteit_gemiddeld_dag: avgDay,
      elektriciteit_gemiddeld_nacht: avgNight,
      elektriciteit_min_dag: Math.min(...electricityPrices),
      elektriciteit_max_dag: Math.max(...electricityPrices),
      gas_gemiddeld: avgGas,
      gas_min: Math.min(...gasPrices),
      gas_max: Math.max(...gasPrices),
      bron: 'ENERGYZERO',
    }
  } catch (error) {
    return null
  }
}

async function main() {
  console.log('🔄 Replacing all FALLBACK records with real data...')
  console.log('')

  // Find all FALLBACK records
  const { data: fallbackRecords, error } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .eq('bron', 'FALLBACK')
    .order('datum', { ascending: false })

  if (error) {
    console.error('❌ Error fetching FALLBACK records:', error)
    process.exit(1)
  }

  if (!fallbackRecords || fallbackRecords.length === 0) {
    console.log('✅ No FALLBACK records found - all data is real!')
    process.exit(0)
  }

  console.log(`📊 Found ${fallbackRecords.length} FALLBACK records to replace`)
  console.log('')

  let successCount = 0
  let failCount = 0

  for (const record of fallbackRecords) {
    const dateStr = record.datum
    const date = new Date(dateStr)

    console.log(`📅 Processing ${dateStr}...`)

    const prices = await fetchFromEnergyZero(date)

    if (!prices) {
      console.log(`   ❌ No data available from API`)
      failCount++
      continue
    }

    // Update database
    const { error: updateError } = await supabase
      .from('dynamic_prices')
      .update({
        ...prices,
        laatst_geupdate: new Date().toISOString(),
      })
      .eq('datum', dateStr)

    if (updateError) {
      console.log(`   ❌ Failed to update: ${updateError.message}`)
      failCount++
    } else {
      console.log(`   ✅ Updated: Elec €${prices.elektriciteit_gemiddeld_dag.toFixed(5)}/kWh, Gas €${prices.gas_gemiddeld.toFixed(5)}/m³`)
      successCount++
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log('')
  console.log('='.repeat(60))
  console.log('📊 Replacement Summary')
  console.log('='.repeat(60))
  console.log(`   ✅ Successfully replaced: ${successCount}`)
  console.log(`   ❌ Failed: ${failCount}`)
  console.log(`   📅 Total processed: ${fallbackRecords.length}`)
  console.log('='.repeat(60))

  // Verify no FALLBACK records remain
  const { count } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })
    .eq('bron', 'FALLBACK')

  if (count === 0) {
    console.log('')
    console.log('✅ All FALLBACK records have been replaced!')
  } else {
    console.log('')
    console.log(`⚠️  Warning: ${count} FALLBACK records still remain`)
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

