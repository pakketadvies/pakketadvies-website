/**
 * Script to fetch hourly energy prices for the past year (1-12-2024 to 1-12-2025)
 * and generate SQL INSERT statements for Supabase
 * 
 * Usage: node scripts/generate-hourly-prices-sql.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    // Note: API uses 'readingDate' not 'from' for the timestamp
    const hourlyRecords = prices
      .filter((p) => p && (p.readingDate || p.from) && p.price !== undefined) // Filter out invalid records
      .map((p) => {
        try {
          // API uses 'readingDate', but some endpoints might use 'from'
          const timestamp = p.readingDate || p.from
          const date = new Date(timestamp)
          
          // Validate date
          if (isNaN(date.getTime())) {
            console.warn(`  ⚠️  Invalid date for price: ${timestamp}, skipping`)
            return null
          }
          
          const hour = date.getUTCHours() // Use UTC to match API timezone
          const quarter = Math.floor(date.getUTCMinutes() / 15)
          
          // Validate hour and quarter
          if (isNaN(hour) || isNaN(quarter) || hour < 0 || hour > 23 || quarter < 0 || quarter > 3) {
            console.warn(`  ⚠️  Invalid hour/quarter: hour=${hour}, quarter=${quarter}, date=${timestamp}, skipping`)
            return null
          }
          
          return {
            datum: dateStr,
            uur: hour,
            kwartier: quarter,
            prijs: parseFloat(Number(p.price).toFixed(5)),
            timestamp: timestamp,
            bron: 'ENERGYZERO',
          }
        } catch (error) {
          console.warn(`  ⚠️  Error processing price record: ${error.message}, skipping`)
          return null
        }
      })
      .filter(r => r !== null) // Remove null records
    
    if (hourlyRecords.length === 0) {
      console.warn(`  ⚠️  No valid records after processing for ${dateStr}`)
      return null
    }
    
    return hourlyRecords
  } catch (error) {
    console.error(`  ❌ Error fetching ${dateStr}:`, error.message)
    return null
  }
}

async function main() {
  // Date range: 1-12-2024 to 1-12-2025 (today)
  const startDate = new Date('2024-12-01')
  const endDate = new Date('2025-12-01')
  
  console.log('🔄 Fetching hourly prices and generating SQL...\n')
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
  
  // Setup output file
  const outputPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '037_load_hourly_prices_2024_2025.sql'
  )
  
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  // Write header first
  const header = `-- ============================================
-- HOURLY PRICES DATA - Past Year
-- ============================================
-- Generated: ${new Date().toISOString()}
-- Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}
-- ============================================

-- Insert hourly prices
-- Uses ON CONFLICT to update existing records

`
  fs.writeFileSync(outputPath, header, 'utf-8')
  console.log(`📄 SQL file initialized: ${outputPath}\n`)
  
  const allRecords = []
  let failed = 0
  let totalWritten = 0
  const BATCH_SIZE = 10
  const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds
  const DELAY_BETWEEN_REQUESTS = 200 // 200ms between requests in batch
  const MAX_RECORDS_PER_INSERT = 1000
  
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
        allRecords.push(...records)
        batchResults.push({ date: dateStr, count: records.length })
      } else {
        batchResults.push({ date: dateStr, count: 0, failed: true })
        failed++
      }
      
      // Small delay between requests
      if (j < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
      }
    }
    
    const batchTotal = batchResults.reduce((sum, r) => sum + (r.count || 0), 0)
    const batchFailed = batchResults.filter((r) => r.failed).length
    
    // Remove duplicates from allRecords before writing
    const uniqueRecordsMap = new Map()
    allRecords.forEach((record) => {
      const key = `${record.datum}-${record.uur}-${record.kwartier}`
      uniqueRecordsMap.set(key, record) // Last one wins
    })
    const uniqueRecords = Array.from(uniqueRecordsMap.values())
    const duplicatesRemoved = allRecords.length - uniqueRecords.length
    allRecords.length = 0
    allRecords.push(...uniqueRecords)
    
    if (duplicatesRemoved > 0 && i % 5 === 0) {
      console.log(`   🔍 Removed ${duplicatesRemoved} duplicates so far`)
    }
    
    console.log(`  ✅ Fetched: ${batchTotal} records, Failed: ${batchFailed}`)
    console.log(`   Total progress: ${allRecords.length} unique records`)
    
    // Write chunks to file incrementally (every 1000 records or at end of batch if we have enough)
    if (allRecords.length >= totalWritten + MAX_RECORDS_PER_INSERT) {
      // Sort records before writing chunk
      const sortedRecords = allRecords.slice(totalWritten, totalWritten + MAX_RECORDS_PER_INSERT)
        .sort((a, b) => {
          if (a.datum !== b.datum) return a.datum.localeCompare(b.datum)
          if (a.uur !== b.uur) return a.uur - b.uur
          return a.kwartier - b.kwartier
        })
      const chunkNum = Math.floor(totalWritten / MAX_RECORDS_PER_INSERT) + 1
      
      const chunkSql = `-- Chunk ${chunkNum} (${sortedRecords.length} records)
INSERT INTO hourly_prices (
  datum,
  uur,
  kwartier,
  prijs,
  timestamp,
  bron,
  laatst_geupdate
) VALUES
${sortedRecords
  .map(
    (r) => `  ('${r.datum}', ${r.uur}, ${r.kwartier}, ${r.prijs}, '${r.timestamp}', '${r.bron}', NOW())`
  )
  .join(',\n')}
ON CONFLICT (datum, uur, kwartier) DO UPDATE SET
  prijs = EXCLUDED.prijs,
  timestamp = EXCLUDED.timestamp,
  bron = EXCLUDED.bron,
  laatst_geupdate = EXCLUDED.laatst_geupdate;

`
      
      fs.appendFileSync(outputPath, chunkSql, 'utf-8')
      totalWritten += sortedRecords.length
      console.log(`   💾 Written chunk ${chunkNum} to file (${totalWritten} records written)\n`)
    } else {
      console.log(`\n`)
    }
    
    // Delay between batches
    if (i + BATCH_SIZE < dates.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }
  
  if (allRecords.length === 0) {
    console.error('❌ No records fetched. Exiting.')
    process.exit(1)
  }
  
  console.log(`\n📝 Finalizing SQL file...`)
  
  // Remove duplicates based on (datum, uur, kwartier) - keep the last one
  console.log(`  🔍 Removing duplicates...`)
  const uniqueRecordsMap = new Map()
  allRecords.forEach((record) => {
    const key = `${record.datum}-${record.uur}-${record.kwartier}`
    uniqueRecordsMap.set(key, record) // Last one wins
  })
  
  const uniqueRecords = Array.from(uniqueRecordsMap.values())
  const duplicatesRemoved = allRecords.length - uniqueRecords.length
  
  if (duplicatesRemoved > 0) {
    console.log(`  ✅ Removed ${duplicatesRemoved} duplicate records`)
    console.log(`  📊 Unique records: ${uniqueRecords.length}`)
  }
  
  // Sort remaining records by date, hour, quarter
  const remainingRecords = uniqueRecords.slice(totalWritten)
  if (remainingRecords.length > 0) {
    remainingRecords.sort((a, b) => {
      if (a.datum !== b.datum) return a.datum.localeCompare(b.datum)
      if (a.uur !== b.uur) return a.uur - b.uur
      return a.kwartier - b.kwartier
    })
    
    // Write remaining records
    const chunkNum = Math.floor(totalWritten / MAX_RECORDS_PER_INSERT) + 1
    const chunkSql = `-- Chunk ${chunkNum} (${remainingRecords.length} records - final)
INSERT INTO hourly_prices (
  datum,
  uur,
  kwartier,
  prijs,
  timestamp,
  bron,
  laatst_geupdate
) VALUES
${remainingRecords
  .map(
    (r) => `  ('${r.datum}', ${r.uur}, ${r.kwartier}, ${r.prijs}, '${r.timestamp}', '${r.bron}', NOW())`
  )
  .join(',\n')}
ON CONFLICT (datum, uur, kwartier) DO UPDATE SET
  prijs = EXCLUDED.prijs,
  timestamp = EXCLUDED.timestamp,
  bron = EXCLUDED.bron,
  laatst_geupdate = EXCLUDED.laatst_geupdate;

`
    
    fs.appendFileSync(outputPath, chunkSql, 'utf-8')
    totalWritten += remainingRecords.length
  }
  
  // Update header with final stats
  const finalHeader = `-- ============================================
-- HOURLY PRICES DATA - Past Year
-- ============================================
-- Generated: ${new Date().toISOString()}
-- Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}
-- Total records fetched: ${allRecords.length}
-- Unique records: ${uniqueRecords.length}
-- Duplicates removed: ${duplicatesRemoved}
-- Failed dates: ${failed}
-- ============================================

-- Insert hourly prices
-- Uses ON CONFLICT to update existing records

`
  
  // Replace header
  const currentContent = fs.readFileSync(outputPath, 'utf-8')
  const contentWithoutHeader = currentContent.substring(currentContent.indexOf('-- Insert hourly prices'))
  fs.writeFileSync(outputPath, finalHeader + contentWithoutHeader, 'utf-8')
  
  // Update final stats in console
  console.log(`   Total records fetched: ${allRecords.length}`)
  console.log(`   Unique records: ${uniqueRecords.length}`)
  if (duplicatesRemoved > 0) {
    console.log(`   Duplicates removed: ${duplicatesRemoved}`)
  }
  
  console.log(`\n✅ SQL script generated!`)
  console.log(`   Total records: ${allRecords.length}`)
  console.log(`   Failed dates: ${failed}`)
  console.log(`   Success rate: ${((dates.length - failed) / dates.length * 100).toFixed(1)}%`)
  console.log(`   File: ${outputPath}\n`)
  
  console.log(`📋 Next steps:`)
  console.log(`   1. Open Supabase SQL Editor`)
  console.log(`   2. Copy contents of: ${outputPath}`)
  console.log(`   3. Paste and run in Supabase`)
  console.log(`\n`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

