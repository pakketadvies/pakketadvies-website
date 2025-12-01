/**
 * Quick script to generate SQL for past year prices
 * Processes in smaller batches to avoid issues
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
  console.log('🔄 Fetching prices for past year...\n')

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const oneYearAgo = new Date(yesterday)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const dates = []
  const currentDate = new Date(yesterday)
  while (currentDate >= oneYearAgo) {
    dates.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() - 1)
  }

  console.log(`📅 Processing ${dates.length} dates from ${yesterday.toISOString().split('T')[0]} to ${oneYearAgo.toISOString().split('T')[0]}\n`)

  const prices = []
  let processed = 0

  // Process in batches of 50
  for (let i = 0; i < dates.length; i += 50) {
    const batch = dates.slice(i, i + 50)
    console.log(`Processing batch ${Math.floor(i/50) + 1}/${Math.ceil(dates.length/50)} (${batch.length} dates)...`)

    const batchPromises = batch.map(async (dateStr, idx) => {
      await new Promise(resolve => setTimeout(resolve, idx * 200)) // Stagger requests
      return await fetchPricesForDate(dateStr)
    })

    const batchResults = await Promise.all(batchPromises)
    const validPrices = batchResults.filter(p => p !== null)
    prices.push(...validPrices)
    processed += validPrices.length

    console.log(`✅ Batch complete: ${validPrices.length}/${batch.length} successful (Total: ${processed}/${dates.length})\n`)

    // Delay between batches
    if (i + 50 < dates.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  if (prices.length === 0) {
    console.error('❌ No prices fetched')
    process.exit(1)
  }

  // Generate SQL
  const sql = `-- Historical Energy Prices - Past Year
-- Generated: ${new Date().toISOString()}
-- Total records: ${prices.length}
-- Date range: ${prices[prices.length - 1]?.datum} to ${prices[0]?.datum}

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
`

  const outputPath = path.join(process.cwd(), 'supabase', 'migrations', `034_load_historical_prices_${oneYearAgo.getFullYear()}.sql`)
  
  const dir = path.dirname(outputPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, sql, 'utf-8')

  console.log(`\n✅ SQL script generated: ${outputPath}`)
  console.log(`   Total records: ${prices.length}`)
  console.log(`\n📋 Next steps:`)
  console.log(`   1. Open Supabase SQL Editor`)
  console.log(`   2. Copy contents of: ${outputPath}`)
  console.log(`   3. Paste and run in Supabase\n`)
}

main().catch(console.error)
