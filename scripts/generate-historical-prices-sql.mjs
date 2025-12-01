/**
 * Script to fetch historical energy prices for the past year
 * and generate SQL INSERT statements for Supabase
 * 
 * Usage: node scripts/generate-historical-prices-sql.mjs
 */

async function fetchPricesForDate(dateStr) {
  try {
    // API expects timestamps with timezone
    const fromDate = new Date(dateStr + 'T00:00:00Z')
    const toDate = new Date(dateStr + 'T23:59:59Z')
    const nextDay = new Date(toDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Format as ISO timestamps
    const fromDateISO = fromDate.toISOString()
    const tillDateISO = nextDay.toISOString()

    // Fetch electricity and gas prices
    const [electricityResponse, gasResponse] = await Promise.all([
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${encodeURIComponent(fromDateISO)}&tillDate=${encodeURIComponent(tillDateISO)}&interval=4&usageType=1&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
      fetch(
        `https://api.energyzero.nl/v1/energyprices?fromDate=${encodeURIComponent(fromDateISO)}&tillDate=${encodeURIComponent(tillDateISO)}&interval=4&usageType=3&inclBtw=false`,
        { headers: { Accept: 'application/json' } }
      ),
    ])

    if (!electricityResponse.ok || !gasResponse.ok) {
      const status = electricityResponse.status || gasResponse.status
      console.warn(`⚠️  API request failed for ${dateStr} (status: ${status})`)
      return null
    }

    const [electricityData, gasData] = await Promise.all([
      electricityResponse.json(),
      gasResponse.json(),
    ])

    const electricityPrices = electricityData.Prices?.map((p) => p.price) || []
    const gasPrices = gasData.Prices?.map((p) => p.price) || []

    if (electricityPrices.length === 0 || gasPrices.length === 0) {
      console.warn(`⚠️  No price data for ${dateStr}`)
      return null
    }

    // Split into day (6-23) and night (23-6) periods
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
    console.error(`❌ Error fetching ${dateStr}:`, error.message)
    return null
  }
}

function generateSQL(prices) {
  const sql = `-- Historical Energy Prices - Past Year
-- Generated: ${new Date().toISOString()}
-- Total records: ${prices.length}

-- Delete existing records for these dates (optional, comment out if you want to keep existing)
-- DELETE FROM dynamic_prices WHERE datum IN (
--   ${prices.map(p => `'${p.datum}'`).join(',\n--   ')}
-- );

-- Insert historical prices
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
${prices
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

-- Verification
SELECT 
  COUNT(*) as total_records,
  MIN(datum) as earliest_date,
  MAX(datum) as latest_date,
  COUNT(CASE WHEN bron = 'ENERGYZERO' THEN 1 END) as energyzero_count,
  COUNT(CASE WHEN bron = 'FALLBACK' THEN 1 END) as fallback_count
FROM dynamic_prices
WHERE datum >= '${prices[prices.length - 1]?.datum}' AND datum <= '${prices[0]?.datum}';
`

  return sql
}

async function main() {
  console.log('🔄 Starting historical price fetch for past year...\n')

  // Calculate date range (1 year back from yesterday, since today's prices might not be available yet)
  const today = new Date()
  // Set to yesterday to ensure we have data
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // Go back exactly 1 year from yesterday
  const oneYearAgo = new Date(yesterday)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Generate list of dates (from yesterday backwards)
  const dates = []
  const currentDate = new Date(yesterday)
  while (currentDate >= oneYearAgo) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() - 1)
  }

  console.log(`📅 Fetching prices for ${dates.length} dates (from ${yesterday.toISOString().split('T')[0]} to ${oneYearAgo.toISOString().split('T')[0]})...\n`)

  const prices = []
  let successCount = 0
  let failCount = 0

  // Process dates with rate limiting
  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i]
    const price = await fetchPricesForDate(dateStr)

    if (price) {
      prices.push(price)
      successCount++
      if (successCount % 50 === 0) {
        console.log(`✅ Processed ${successCount}/${dates.length} dates...`)
      }
    } else {
      failCount++
    }

    // Rate limiting: 500ms delay between requests
    if (i < dates.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  console.log(`\n✅ Fetch complete!`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Failed: ${failCount}`)
  console.log(`   Total: ${prices.length} records\n`)

  if (prices.length === 0) {
    console.error('❌ No prices fetched. Exiting.')
    process.exit(1)
  }

  // Generate SQL
  const sql = generateSQL(prices)

  // Write to file
  const fs = require('fs')
  const path = require('path')
  const outputPath = path.join(process.cwd(), 'supabase', 'migrations', `034_load_historical_prices_${oneYearAgo.getFullYear()}.sql`)
  
  // Ensure directory exists
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, sql, 'utf-8')

  console.log(`📝 SQL script generated: ${outputPath}`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Open Supabase SQL Editor`)
  console.log(`   2. Copy the contents of: ${outputPath}`)
  console.log(`   3. Paste and run in Supabase`)
  console.log(`   4. Or run: npx supabase db push\n`)
}

// Run
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

