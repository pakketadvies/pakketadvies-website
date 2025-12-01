import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sbp_9dcbedd9a6c1537e65ade641a3c5cffa3913a293'

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL not set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('Checking Supabase data...\n')
  
  // Check total count
  const { count, error: countError } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('Error counting records:', countError)
    return
  }
  
  console.log(`Total records in dynamic_prices: ${count}`)
  
  // Check date range
  const { data: dateRange, error: rangeError } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: true })
    .limit(1)
  
  if (rangeError) {
    console.error('Error getting date range:', rangeError)
  } else if (dateRange && dateRange.length > 0) {
    console.log(`Earliest date: ${dateRange[0].datum}`)
  }
  
  const { data: latestDate, error: latestError } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: false })
    .limit(1)
  
  if (latestError) {
    console.error('Error getting latest date:', latestError)
  } else if (latestDate && latestDate.length > 0) {
    console.log(`Latest date: ${latestDate[0].datum}`)
  }
  
  // Check sample records
  const { data: sample, error: sampleError } = await supabase
    .from('dynamic_prices')
    .select('datum, elektriciteit_gemiddeld_dag, gas_gemiddeld')
    .order('datum', { ascending: false })
    .limit(5)
  
  if (sampleError) {
    console.error('Error getting sample:', sampleError)
  } else {
    console.log('\nSample records (last 5):')
    sample?.forEach(record => {
      console.log(`  ${record.datum}: Elek=${record.elektriciteit_gemiddeld_dag || 'N/A'}, Gas=${record.gas_gemiddeld || 'N/A'}`)
    })
  }
}

checkData().catch(console.error)
