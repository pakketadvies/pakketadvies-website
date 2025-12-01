import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env.local
const envPath = join(__dirname, '..', '.env.local')
let envContent = ''
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch (e) {
  console.error('Could not read .env.local')
  process.exit(1)
}

// Parse SUPABASE URL
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
const supabaseUrl = urlMatch ? urlMatch[1].trim().replace(/['"]/g, '') : null

if (!supabaseUrl) {
  console.error('❌ Could not find NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

const supabaseKey = 'sbp_9dcbedd9a6c1537e65ade641a3c5cffa3913a293'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('🔍 Checking Supabase data...\n')
  console.log(`URL: ${supabaseUrl}\n`)
  
  // Check total count
  const { count, error: countError } = await supabase
    .from('dynamic_prices')
    .select('*', { count: 'exact', head: true })
  
  if (countError) {
    console.error('❌ Error counting records:', countError)
    return
  }
  
  console.log(`✅ Total records in dynamic_prices: ${count}\n`)
  
  if (count === 0) {
    console.log('⚠️  NO DATA FOUND IN SUPABASE!')
    return
  }
  
  // Check date range
  const { data: earliest, error: earliestError } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: true })
    .limit(1)
  
  if (earliestError) {
    console.error('❌ Error getting earliest date:', earliestError)
  } else if (earliest && earliest.length > 0) {
    console.log(`📅 Earliest date: ${earliest[0].datum}`)
  }
  
  const { data: latest, error: latestError } = await supabase
    .from('dynamic_prices')
    .select('datum')
    .order('datum', { ascending: false })
    .limit(1)
  
  if (latestError) {
    console.error('❌ Error getting latest date:', latestError)
  } else if (latest && latest.length > 0) {
    console.log(`📅 Latest date: ${latest[0].datum}\n`)
  }
  
  // Check sample records
  const { data: sample, error: sampleError } = await supabase
    .from('dynamic_prices')
    .select('datum, elektriciteit_gemiddeld_dag, gas_gemiddeld')
    .order('datum', { ascending: false })
    .limit(10)
  
  if (sampleError) {
    console.error('❌ Error getting sample:', sampleError)
  } else if (sample && sample.length > 0) {
    console.log('📊 Sample records (last 10):')
    sample.forEach((record, i) => {
      console.log(`  ${i + 1}. ${record.datum}: Elek=${record.elektriciteit_gemiddeld_dag || 'N/A'}, Gas=${record.gas_gemiddeld || 'N/A'}`)
    })
  }
  
  // Check if today's data exists
  const today = new Date().toISOString().split('T')[0]
  const { data: todayData, error: todayError } = await supabase
    .from('dynamic_prices')
    .select('*')
    .eq('datum', today)
    .limit(1)
  
  if (todayError) {
    console.error('❌ Error checking today:', todayError)
  } else if (todayData && todayData.length > 0) {
    console.log(`\n✅ Today's data (${today}) exists`)
  } else {
    console.log(`\n⚠️  Today's data (${today}) NOT found`)
  }
}

checkData().catch(console.error)
