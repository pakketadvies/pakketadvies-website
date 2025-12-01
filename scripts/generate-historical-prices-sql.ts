/**
 * Script to fetch historical energy prices for the past year
 * and generate SQL INSERT statements for Supabase
 * 
 * Usage: npx tsx scripts/generate-historical-prices-sql.ts
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

interface PriceData {
  datum: string
  elektriciteit_gemiddeld_dag: number
  elektriciteit_gemiddeld_nacht: number
  elektriciteit_min_dag: number
  elektriciteit_max_dag: number
  gas_gemiddeld: number
  gas_min: number
  gas_max: number
}

async function fetchPricesForDate(dateStr: string): Promise<PriceData | null> {
  try {
    const nextDay = new Date(dateStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    // Fetch electricity and gas prices
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
      console.warn(`⚠️  API request failed for ${dateStr}`)
      return null
    }

    const [electricityData, gasData] = await Promise.all([
      electricityResponse.json(),
      gasResponse.json(),
    ])

    const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
    const gasPrices = gasData.Prices?.map((p: any) => p.price) || []

    if (electricityPrices.length === 0 || gasPrices.length === 0) {
      console.warn(`⚠️  No price data for ${dateStr}`)
      return null
    }

    // Split into day (6-23) and night (23-6) periods
    const dayPrices = electricityPrices.filter((_: number, idx: number) => {
      const hour = idx % 24
      return hour >= 6 && hour < 23
    })
    const nightPrices = electricityPrices.filter((_: number, idx: number) => {
      const hour = idx % 24
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
      datum: dateStr,
      elektriciteit_gemiddeld_dag: parseFloat(avgDay.toFixed(5)),
      elektriciteit_gemiddeld_nacht: parseFloat(avgNight.toFixed(5)),
      elektriciteit_min_dag: parseFloat(Math.min(...electricityPrices).toFixed(5)),
      elektriciteit_max_dag: parseFloat(Math.max(...electricityPrices).toFixed(5)),
      gas_gemiddeld: parseFloat(avgGas.toFixed(5)),
      gas_min: parseFloat(Math.min(...gasPrices).toFixed(5)),
      gas_max: parseFloat(Math.max(...gasPrices).toFixed(5)),
    }
  } catch (error: any) {
    console.error(`❌ Error fetching ${dateStr}:`, error.message)
    return null
  }
}

function generateSQL(prices: PriceData[]): string {
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

  // Calculate date range (1 year back)
  const today = new Date()
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // Generate list of dates (from today backwards)
  const dates: string[] = []
  const currentDate = new Date(today)
  while (currentDate >= oneYearAgo) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() - 1)
  }

  console.log(`📅 Fetching prices for ${dates.length} dates (from ${today.toISOString().split('T')[0]} to ${oneYearAgo.toISOString().split('T')[0]})...\n`)

  const prices: PriceData[] = []
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
  
  fs.writeFileSync(outputPath, sql, 'utf-8')

  console.log(`📝 SQL script generated: ${outputPath}`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Open Supabase SQL Editor`)
  console.log(`   2. Copy the contents of: ${outputPath}`)
  console.log(`   3. Paste and run in Supabase`)
  console.log(`   4. Or run: npx supabase db push\n`)
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export { main }

