/**
 * Script to check what prices are currently in Supabase
 * 
 * Usage:
 *   npx ts-node scripts/check-supabase-prices.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local or .env.vercel
try {
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
          const [key, ...valueParts] = trimmed.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
            process.env[key.trim()] = value
          }
        }
      })
      console.log(`✅ Loaded environment from ${envPath}`)
      break
    } catch (e) {
      // Try next file
    }
  }
} catch (error) {
  console.warn('⚠️  Could not load .env files, using system environment variables')
}

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log('🔍 Checking prices in Supabase...')
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  const today = new Date()
  const oneMonthAgo = new Date(today)
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)

  const startDate = oneMonthAgo.toISOString().split('T')[0]
  const endDate = today.toISOString().split('T')[0]

  console.log(`📅 Fetching data from ${startDate} to ${endDate}`)
  console.log('')

  // Fetch data
  const { data: prices, error } = await supabase
    .from('dynamic_prices')
    .select('*')
    .gte('datum', startDate)
    .lte('datum', endDate)
    .order('datum', { ascending: false })

  if (error) {
    console.error('❌ Error fetching data:', error)
    process.exit(1)
  }

  if (!prices || prices.length === 0) {
    console.log('⚠️  No data found for the last month')
    console.log('')
    console.log('💡 Tip: Run the historical import script:')
    console.log('   npx ts-node scripts/load-all-available-historical-prices.ts')
    process.exit(0)
  }

  console.log(`✅ Found ${prices.length} records for the last month`)
  console.log('')
  console.log('='.repeat(100))
  console.log('📊 PRICE DATA (Last 30 days)')
  console.log('='.repeat(100))
  console.log('')

  // Display in table format
  console.log(
    'Datum'.padEnd(12) +
    'Elektriciteit (€/kWh)'.padEnd(25) +
    'Gas (€/m³)'.padEnd(20) +
    'Bron'.padEnd(15) +
    'Updated'
  )
  console.log('-'.repeat(100))

  prices.forEach((p: any) => {
    const datum = p.datum
    const elec = p.elektriciteit_gemiddeld_dag?.toFixed(5) || 'N/A'
    const gas = p.gas_gemiddeld?.toFixed(5) || 'N/A'
    const bron = p.bron || 'N/A'
    const updated = p.laatst_geupdate 
      ? new Date(p.laatst_geupdate).toLocaleString('nl-NL')
      : 'N/A'

    console.log(
      datum.padEnd(12) +
      elec.padEnd(25) +
      gas.padEnd(20) +
      bron.padEnd(15) +
      updated
    )
  })

  console.log('')
  console.log('='.repeat(100))
  console.log('')

  // Statistics
  const validElec = prices.filter((p: any) => p.elektriciteit_gemiddeld_dag != null)
  const validGas = prices.filter((p: any) => p.gas_gemiddeld != null)

  if (validElec.length > 0) {
    const avgElec = validElec.reduce((sum: number, p: any) => sum + p.elektriciteit_gemiddeld_dag, 0) / validElec.length
    const minElec = Math.min(...validElec.map((p: any) => p.elektriciteit_gemiddeld_dag))
    const maxElec = Math.max(...validElec.map((p: any) => p.elektriciteit_gemiddeld_dag))
    
    console.log('📊 Elektriciteit Statistieken:')
    console.log(`   Gemiddeld: €${avgElec.toFixed(5)}/kWh`)
    console.log(`   Minimum: €${minElec.toFixed(5)}/kWh`)
    console.log(`   Maximum: €${maxElec.toFixed(5)}/kWh`)
    console.log(`   Aantal records: ${validElec.length}`)
    console.log('')
  }

  if (validGas.length > 0) {
    const avgGas = validGas.reduce((sum: number, p: any) => sum + p.gas_gemiddeld, 0) / validGas.length
    const minGas = Math.min(...validGas.map((p: any) => p.gas_gemiddeld))
    const maxGas = Math.max(...validGas.map((p: any) => p.gas_gemiddeld))
    
    console.log('📊 Gas Statistieken:')
    console.log(`   Gemiddeld: €${avgGas.toFixed(5)}/m³`)
    console.log(`   Minimum: €${minGas.toFixed(5)}/m³`)
    console.log(`   Maximum: €${maxGas.toFixed(5)}/m³`)
    console.log(`   Aantal records: ${validGas.length}`)
    console.log('')
  }

  // Check total records
  const { count } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })

  console.log('='.repeat(100))
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
  console.log('='.repeat(100))
}

main().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

