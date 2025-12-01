/**
 * Script to fetch historical energy prices for the past 5 years
 * and generate SQL INSERT statements for Supabase
 * 
 * Usage: node scripts/generate-5-years-historical-prices.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchPricesForDate(dateStr) {
  try {
    const fromDateISO = `${dateStr}T00:00:00Z`
    const nextDay = new Date(dateStr + 'T00:00:00Z')
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayISO = nextDay.toISOString()

    const [electricityResponse, gasResponse] = await Promise.all([
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${encodeURIComponent(fromDateISO)}&tillDate=${encodeURIComponent(nextDayISO)}&interval=4&usageType=1&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${encodeURIComponent(fromDateISO)}&tillDate=${encodeURIComponent(nextDayISO)}&interval=4&usageType=3&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
    ])

    if (!electricityResponse.ok || !gasResponse.ok) {
      return null
    }

    const [electricityData, gasData] = await Promise.all([
      electricityResponse.json(),
      gasResponse.json(),
    ])

    const electricityPrices = electricityData.Prices?.map((p) => p.price) || []
    const gasPrices = gasData.Prices?.map((p) => p.price) || []

    if (electricityPrices.length === 0 || gasPrices.length === 0) {
      return null
    }

    const dayPrices = electricityPrices.filter((_, idx) => {
      const hour = idx % 24
      return hour >= 6 && hour < 23
    })
    const nightPrices = electricityPrices.filter((_, idx) => {
      const hour = idx % 24
      return hour < 6 || hour >= 23
    })

    const avgElectricity = electricityPrices.reduce((a, b) => a + b, 0) / electricityPrices.length
    const avgDay = dayPrices.length > 0
      ? dayPrices.reduce((a, b) => a + b, 0) / dayPrices.length
      : avgElectricity
    const avgNight = nightPrices.length > 0
      ? nightPrices.reduce((a, b) => a + b, 0) / nightPrices.length
      : avgElectricity

    const avgGas = gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length

    return {
      datum: dateStr,
      elektriciteit_gemiddeld_dag: parseFloat(avgDay.toFixed(5)),
      elektriciteit_gemiddeld_nacht: parseFloat(avgNight.toFixed(5)),
      elektriciteit_min_dag: parseFloat(Math.min(...electricityPrices).toFixed(5)),
      elektriciteit_max_dag: parseFloat(Math.max(...electricityPrices).toFixed(5)),
      gas_gemiddeld: parseFloat(avgGas.toFixed(5)),
      gas_min: parseFloat(Math.min(...gasPrices).toFixed(5)),
      gas_max: parseFloat(Math.max(...gasPrices).toFixed(5)),
    }
  } catch (error) {
    return null
  }
}

async function main() {
  console.log('🔄 Fetching prices for past 5 years (including today)...\n')

  // Start from today (1 December 2025)
  const today = new Date()
  const fiveYearsAgo = new Date(today)
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

  // Generate list of dates (from today backwards to 5 years ago)
  const dates = []
  const currentDate = new Date(today)
  while (currentDate >= fiveYearsAgo) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() - 1)
  }

  console.log(`📅 Processing ${dates.length} dates from ${today.toISOString().split('T')[0]} to ${fiveYearsAgo.toISOString().split('T')[0]}\n`)
  console.log(`⏱️  This will take approximately ${Math.ceil(dates.length / 50 * 2.5)} minutes...\n`)

  const prices = []
  let processed = 0
  let failed = 0

  // Process in batches of 50 to avoid rate limiting
  const BATCH_SIZE = 50
  const DELAY_BETWEEN_REQUESTS = 200 // ms
  const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds

  for (let i = 0; i < dates.length; i += BATCH_SIZE) {
    const batch = dates.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(dates.length / BATCH_SIZE)
    
    console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} dates)...`)

    const batchPromises = batch.map(async (dateStr, idx) => {
      // Stagger requests within batch
      await new Promise(resolve => setTimeout(resolve, idx * DELAY_BETWEEN_REQUESTS))
      return await fetchPricesForDate(dateStr)
    })

    const batchResults = await Promise.all(batchPromises)
    const validPrices = batchResults.filter(p => p !== null)
    const batchFailed = batch.length - validPrices.length
    
    prices.push(...validPrices)
    processed += validPrices.length
    failed += batchFailed

    console.log(`✅ Batch ${batchNum} complete: ${validPrices.length}/${batch.length} successful (${batchFailed} failed)`)
    console.log(`   Total progress: ${processed}/${dates.length} successful, ${failed} failed\n`)

    // Delay between batches (except for the last one)
    if (i + BATCH_SIZE < dates.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }

  if (prices.length === 0) {
    console.error('❌ No prices fetched. Exiting.')
    process.exit(1)
  }

  // Sort by date (oldest first for SQL)
  prices.sort((a, b) => a.datum.localeCompare(b.datum))

  // Generate SQL in chunks to avoid huge SQL files
  // Split into multiple files if needed (max 1000 records per file)
  const MAX_RECORDS_PER_FILE = 1000
  const files = []

  for (let i = 0; i < prices.length; i += MAX_RECORDS_PER_FILE) {
    const chunk = prices.slice(i, i + MAX_RECORDS_PER_FILE)
    const fileNum = Math.floor(i / MAX_RECORDS_PER_FILE) + 1
    const totalFiles = Math.ceil(prices.length / MAX_RECORDS_PER_FILE)

    const sql = `-- Historical Energy Prices - 5 Years (Part ${fileNum}/${totalFiles})
-- Generated: ${new Date().toISOString()}
-- Records: ${chunk.length}
-- Date range: ${chunk[0]?.datum} to ${chunk[chunk.length - 1]?.datum}

INSERT INTO dynamic_prices (
  datum,
  elektriciteit_gemiddeld_dag,
  elektriciteit_gemiddeld_nacht,
  elektriciteit_min_dag,
  elektriciteit_max_dag,
  gas_gemiddeld,
  gas_min,
  gas_max,
  bron,
  laatst_geupdate,
  is_voorspelling
) VALUES
${chunk
  .map(
    (p) => `  ('${p.datum}', ${p.elektriciteit_gemiddeld_dag}, ${p.elektriciteit_gemiddeld_nacht}, ${p.elektriciteit_min_dag}, ${p.elektriciteit_max_dag}, ${p.gas_gemiddeld}, ${p.gas_min}, ${p.gas_max}, 'ENERGYZERO', NOW(), false)`
  )
  .join(',\n')}
ON CONFLICT (datum) DO UPDATE SET
  elektriciteit_gemiddeld_dag = EXCLUDED.elektriciteit_gemiddeld_dag,
  elektriciteit_gemiddeld_nacht = EXCLUDED.elektriciteit_gemiddeld_nacht,
  elektriciteit_min_dag = EXCLUDED.elektriciteit_min_dag,
  elektriciteit_max_dag = EXCLUDED.elektriciteit_max_dag,
  gas_gemiddeld = EXCLUDED.gas_gemiddeld,
  gas_min = EXCLUDED.gas_min,
  gas_max = EXCLUDED.gas_max,
  bron = EXCLUDED.bron,
  laatst_geupdate = EXCLUDED.laatst_geupdate,
  is_voorspelling = EXCLUDED.is_voorspelling;
`

    const outputPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      totalFiles > 1
        ? `035_load_5_years_prices_part${fileNum}.sql`
        : `035_load_5_years_prices.sql`
    )

    const dir = path.dirname(outputPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(outputPath, sql, 'utf-8')
    files.push(outputPath)
  }

  console.log(`\n✅ SQL script(s) generated!`)
  console.log(`   Total records: ${prices.length}`)
  console.log(`   Successful: ${processed}`)
  console.log(`   Failed: ${failed}`)
  console.log(`   Files created: ${files.length}\n`)

  files.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`)
  })

  console.log(`\n📋 Next steps:`)
  console.log(`   1. Open Supabase SQL Editor`)
  if (files.length > 1) {
    console.log(`   2. Run the files in order (part 1, part 2, etc.)`)
  } else {
    console.log(`   2. Copy contents of: ${files[0]}`)
    console.log(`   3. Paste and run in Supabase`)
  }
  console.log(`\n`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

