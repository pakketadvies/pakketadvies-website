/**
 * Script to fetch hourly energy prices for the past year (1-12-2024 to 1-12-2025)
 * and insert them into Supabase hourly_prices table
 * 
 * Usage: node scripts/load-yearly-hourly-prices.mjs
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Make sure you have a .env.local file with these variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fetchHourlyPricesForDate(dateStr) {
  try {
    const nextDay = new Date(dateStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    
    const fromDateISO = `${dateStr}T00:00:00Z`
    const tillDateISO = `${nextDayStr}T00:00:00Z`
    
    const response = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${encodeURIComponent(fromDateISO)}&tillDate=${encodeURIComponent(tillDateISO)}&interval=4&usageType=1&inclBtw=false`,
      { headers: { Accept: 'application/json' } }
    )
    
    if (!response.ok) {
      console.error(`  ⚠️  API error for ${dateStr}: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    const prices = data.Prices || []
    
    if (prices.length === 0) {
      console.warn(`  ⚠️  No prices for ${dateStr}`)
      return null
    }
    
    // Transform to hourly format
    const hourlyRecords = prices.map((p) => {
      const date = new Date(p.from)
      const hour = date.getHours()
      const quarter = Math.floor(date.getMinutes() / 15)
      
      return {
        datum: dateStr,
        uur: hour,
        kwartier: quarter,
        prijs: parseFloat(p.price.toFixed(5)),
        timestamp: p.from,
        bron: 'ENERGYZERO',
      }
    })
    
    return hourlyRecords
  } catch (error) {
    console.error(`  ❌ Error fetching ${dateStr}:`, error.message)
    return null
  }
}

async function insertHourlyPrices(records) {
  if (!records || records.length === 0) return { inserted: 0, updated: 0 }
  
  try {
    // Use upsert to handle conflicts
    const { data, error } = await supabase
      .from('hourly_prices')
      .upsert(records, {
        onConflict: 'datum,uur,kwartier',
        ignoreDuplicates: false,
      })
      .select()
    
    if (error) {
      throw error
    }
    
    return { inserted: records.length, updated: 0 }
  } catch (error) {
    console.error('  ❌ Error inserting records:', error.message)
    return { inserted: 0, updated: 0, error: error.message }
  }
}

async function main() {
  // Date range: 1-12-2024 to 1-12-2025 (today)
  const startDate = new Date('2024-12-01')
  const endDate = new Date('2025-12-01')
  
  console.log('🔄 Loading hourly prices to Supabase...\n')
  console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`)
  
  // Generate list of dates
  const dates = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  console.log(`📊 Processing ${dates.length} dates...\n`)
  console.log(`⏱️  This will take approximately ${Math.ceil(dates.length / 10 * 2)} minutes...\n`)
  
  let totalInserted = 0
  let totalUpdated = 0
  let failed = 0
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds
  const DELAY_BETWEEN_REQUESTS = 200 // 200ms between requests in batch
  
  // Process in batches
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE)
    
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} dates)...`)
    
    const batchResults = []
    for (let j = 0; j < batch.length; j++) {
      const dateStr = batch[j]
      const records = await fetchHourlyPricesForDate(dateStr)
      if (records) {
        const result = await insertHourlyPrices(records)
        batchResults.push({ date: dateStr, ...result })
      } else {
        batchResults.push({ date: dateStr, inserted: 0, updated: 0, failed: true })
      }
      
      // Small delay between requests
      if (j < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
      }
    }
    
    const batchInserted = batchResults.reduce((sum, r) => sum + (r.inserted || 0), 0)
    const batchUpdated = batchResults.reduce((sum, r) => sum + (r.updated || 0), 0)
    const batchFailed = batchResults.filter((r) => r.failed).length
    
    totalInserted += batchInserted
    totalUpdated += batchUpdated
    failed += batchFailed
    
    console.log(`  ✅ Inserted: ${batchInserted}, Updated: ${batchUpdated}, Failed: ${batchFailed}`)
    console.log(`   Total progress: ${totalInserted} records inserted\n`)
    
    // Delay between batches
    if (i + BATCH_SIZE < dates.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }
  
  console.log(`\n✅ Complete!`)
  console.log(`   Total inserted: ${totalInserted} records`)
  console.log(`   Total updated: ${totalUpdated} records`)
  console.log(`   Failed dates: ${failed}`)
  console.log(`   Success rate: ${((dates.length - failed) / dates.length * 100).toFixed(1)}%\n`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

