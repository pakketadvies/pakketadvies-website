/**
 * Script to fetch hourly energy prices from EnergyZero API
 * and insert them into Supabase hourly_prices table
 * 
 * Usage: node scripts/load-hourly-prices-to-supabase.mjs [startDate] [endDate]
 * 
 * Example:
 *   node scripts/load-hourly-prices-to-supabase.mjs 2024-12-01 2025-12-01
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
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
  const args = process.argv.slice(2)
  
  // Parse date range
  let startDate, endDate
  if (args.length >= 2) {
    startDate = new Date(args[0])
    endDate = new Date(args[1])
  } else {
    // Default: last 30 days
    endDate = new Date()
    startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 30)
  }
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error('❌ Invalid date format. Use YYYY-MM-DD')
    process.exit(1)
  }
  
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
  
  let totalInserted = 0
  let totalUpdated = 0
  let failed = 0
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 1000 // 1 second
  
  // Process in batches
  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE)
    
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} dates)...`)
    
    const batchPromises = batch.map(async (dateStr) => {
      const records = await fetchHourlyPricesForDate(dateStr)
      if (records) {
        const result = await insertHourlyPrices(records)
        return { date: dateStr, ...result }
      }
      return { date: dateStr, inserted: 0, updated: 0, failed: true }
    })
    
    const results = await Promise.all(batchPromises)
    
    const batchInserted = results.reduce((sum, r) => sum + (r.inserted || 0), 0)
    const batchUpdated = results.reduce((sum, r) => sum + (r.updated || 0), 0)
    const batchFailed = results.filter((r) => r.failed).length
    
    totalInserted += batchInserted
    totalUpdated += batchUpdated
    failed += batchFailed
    
    console.log(`  ✅ Inserted: ${batchInserted}, Updated: ${batchUpdated}, Failed: ${batchFailed}\n`)
    
    // Delay between batches
    if (i + BATCH_SIZE < dates.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }
  
  console.log(`\n✅ Complete!`)
  console.log(`   Total inserted: ${totalInserted} records`)
  console.log(`   Total updated: ${totalUpdated} records`)
  console.log(`   Failed dates: ${failed}\n`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

