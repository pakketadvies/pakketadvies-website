// Simple script to check Supabase data
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_KEY = 'sbp_9dcbedd9a6c1537e65ade641a3c5cffa3913a293'

async function checkData() {
  try {
    // Check via API
    const today = new Date().toISOString().split('T')[0]
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    const startDate = fiveYearsAgo.toISOString().split('T')[0]
    
    console.log(`Checking data from ${startDate} to ${today}...`)
    
    const response = await fetch(`http://localhost:3000/api/energieprijzen/historie?startDate=${startDate}&endDate=${today}&type=beide`)
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Found ${result.count} records`)
      console.log(`Date range: ${result.startDate} to ${result.endDate}`)
      if (result.data && result.data.length > 0) {
        console.log('\nSample records:')
        result.data.slice(0, 5).forEach(record => {
          console.log(`  ${record.datum}: Elek=${record.elektriciteit_gemiddeld || 'N/A'}, Gas=${record.gas_gemiddeld || 'N/A'}`)
        })
      } else {
        console.log('⚠️  No data in response')
      }
    } else {
      console.error('❌ Error:', result.error)
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message)
    console.log('\nTrying direct Supabase query...')
    
    // Try direct query if API doesn't work
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    const { count, error: dbError } = await supabase
      .from('dynamic_prices')
      .select('*', { count: 'exact', head: true })
    
    if (dbError) {
      console.error('❌ Supabase error:', dbError)
    } else {
      console.log(`✅ Total records in dynamic_prices: ${count}`)
    }
  }
}

checkData()

