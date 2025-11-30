import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/energieprijzen/load-all-historical
 * 
 * Loads ALL historical prices from 5 years ago to today
 * This is a long-running operation that processes dates in batches
 * 
 * Query params:
 * - force: 'true' to force update even if data exists (default: false)
 * - startDate: YYYY-MM-DD (optional, default: 5 years ago)
 * - endDate: YYYY-MM-DD (optional, default: today)
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    
    const supabase = await createClient()
    const today = new Date()
    const fiveYearsAgo = new Date(today)
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)
    
    const startDateStr = searchParams.get('startDate') || fiveYearsAgo.toISOString().split('T')[0]
    const endDateStr = searchParams.get('endDate') || today.toISOString().split('T')[0]
    
    console.log('🚀 Starting historical price import')
    console.log(`   Date range: ${startDateStr} to ${endDateStr}`)
    console.log(`   Force update: ${force}`)
    
    // Generate all dates
    const dates: Date[] = []
    const currentDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log(`📅 Total days to process: ${dates.length}`)
    
    let successCount = 0
    let failCount = 0
    let skipCount = 0
    
    // Process dates in batches
    const BATCH_SIZE = 10
    const DELAY_BETWEEN_BATCHES = 2000
    
    const results: any[] = []
    
    for (let i = 0; i < dates.length; i += BATCH_SIZE) {
      const batch = dates.slice(i, i + BATCH_SIZE)
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1
      const totalBatches = Math.ceil(dates.length / BATCH_SIZE)
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} days)...`)
      
      const batchPromises = batch.map(async (date) => {
        const dateStr = date.toISOString().split('T')[0]
        
        // Check if already exists
        if (!force) {
          const { data: existing } = await supabase
            .from('dynamic_prices')
            .select('datum')
            .eq('datum', dateStr)
            .single()
          
          // Always update recent dates (last 7 days)
          const dateObj = new Date(dateStr)
          const daysDiff = Math.floor((today.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24))
          const isRecent = daysDiff <= 7
          
          if (existing && !isRecent) {
            skipCount++
            return { date: dateStr, status: 'skipped', reason: 'already_exists' }
          }
        }
        
        try {
          // Fetch from EnergyZero API
          const nextDay = new Date(date)
          nextDay.setDate(nextDay.getDate() + 1)
          const nextDayStr = nextDay.toISOString().split('T')[0]
          
          // Fetch electricity
          const electricityResponse = await fetch(
            `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
            {
              headers: { 'Accept': 'application/json' },
              next: { revalidate: 0 }
            }
          )
          
          if (!electricityResponse.ok) {
            return { date: dateStr, status: 'failed', error: `Electricity API: ${electricityResponse.status}` }
          }
          
          const electricityData = await electricityResponse.json()
          const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
          
          if (electricityPrices.length === 0) {
            return { date: dateStr, status: 'failed', error: 'No electricity prices' }
          }
          
          // Fetch gas
          const gasResponse = await fetch(
            `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`,
            {
              headers: { 'Accept': 'application/json' },
              next: { revalidate: 0 }
            }
          )
          
          if (!gasResponse.ok) {
            return { date: dateStr, status: 'failed', error: `Gas API: ${gasResponse.status}` }
          }
          
          const gasData = await gasResponse.json()
          const gasPrices = gasData.Prices?.map((p: any) => p.price) || []
          
          if (gasPrices.length === 0) {
            return { date: dateStr, status: 'failed', error: 'No gas prices' }
          }
          
          // Process electricity
          const dayPrices = electricityPrices.filter((_: number, i: number) => {
            const hour = i % 24
            return hour >= 6 && hour < 23
          })
          const nightPrices = electricityPrices.filter((_: number, i: number) => {
            const hour = i % 24
            return hour < 6 || hour >= 23
          })
          
          const avgElectricity = electricityPrices.reduce((a: number, b: number) => a + b, 0) / electricityPrices.length
          const avgDay = dayPrices.length > 0 
            ? dayPrices.reduce((a: number, b: number) => a + b, 0) / dayPrices.length 
            : avgElectricity
          const avgNight = nightPrices.length > 0
            ? nightPrices.reduce((a: number, b: number) => a + b, 0) / nightPrices.length
            : avgElectricity
          const minElectricity = Math.min(...electricityPrices)
          const maxElectricity = Math.max(...electricityPrices)
          
          // Process gas
          const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
          const minGas = Math.min(...gasPrices)
          const maxGas = Math.max(...gasPrices)
          
          // Save to database
          const { error } = await supabase
            .from('dynamic_prices')
            .upsert({
              datum: dateStr,
              elektriciteit_gemiddeld_dag: avgDay,
              elektriciteit_gemiddeld_nacht: avgNight,
              elektriciteit_min_dag: minElectricity,
              elektriciteit_max_dag: maxElectricity,
              gas_gemiddeld: avgGas,
              gas_min: minGas,
              gas_max: maxGas,
              bron: 'ENERGYZERO',
              laatst_geupdate: new Date().toISOString(),
              is_voorspelling: false,
            }, {
              onConflict: 'datum'
            })
          
          if (error) {
            return { date: dateStr, status: 'failed', error: error.message }
          }
          
          successCount++
          return { 
            date: dateStr, 
            status: 'success',
            electricity: avgElectricity,
            gas: avgGas
          }
          
        } catch (error: any) {
          failCount++
          return { date: dateStr, status: 'failed', error: error.message }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // Delay between batches
      if (i + BATCH_SIZE < dates.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total: dates.length,
        success: successCount,
        failed: failCount,
        skipped: skipCount
      },
      dateRange: {
        from: startDateStr,
        to: endDateStr
      },
      results: results.slice(0, 100) // Return first 100 results to avoid huge response
    })
    
  } catch (error: any) {
    console.error('❌ Error in load-all-historical:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to load historical prices'
      },
      { status: 500 }
    )
  }
}

