import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/energieprijzen/load-historical
 * 
 * Loads historical energy prices for the past 5 years from EnergyZero API
 * and saves them to Supabase database.
 * 
 * This endpoint:
 * - Fetches prices for each day going back 5 years
 * - Skips dates that already have data (unless force=true)
 * - Processes in batches to avoid rate limiting
 * - Returns progress updates
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Parse body with better error handling
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }
    
    const { force = false, startDate, endDate, limit = 100 } = body

    // Calculate date range (5 years back by default)
    const today = new Date()
    const fiveYearsAgo = new Date(today)
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

    const start = startDate ? new Date(startDate) : fiveYearsAgo
    const end = endDate ? new Date(endDate) : today

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    if (start > end) {
      return NextResponse.json(
        { success: false, error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    console.log(`🔄 Starting historical price load from ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]}`)

    // Generate list of dates to process
    const dates: string[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`📅 Processing ${dates.length} dates...`)

    // Check which dates already have data (if not forcing)
    let datesToProcess = dates
    if (!force) {
      // Check in chunks to avoid query size limits
      const existingDates = new Set<string>()
      const CHUNK_SIZE = 1000
      
      for (let i = 0; i < dates.length; i += CHUNK_SIZE) {
        const chunk = dates.slice(i, i + CHUNK_SIZE)
        const { data: existing, error: checkError } = await supabase
          .from('dynamic_prices')
          .select('datum')
          .in('datum', chunk)
        
        if (checkError) {
          console.error('Error checking existing dates:', checkError)
          // Continue anyway
        } else {
          (existing || []).forEach((r: any) => existingDates.add(r.datum))
        }
      }
      
      datesToProcess = dates.filter((d) => !existingDates.has(d))
      console.log(`⏭️  Skipping ${dates.length - datesToProcess.length} dates that already have data`)
    }
    
    // Limit the number of dates to process per request (to avoid timeout)
    if (datesToProcess.length > limit) {
      datesToProcess = datesToProcess.slice(0, limit)
      console.log(`⚠️  Limiting to ${limit} dates per request to avoid timeout`)
    }

    if (datesToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All dates already have data. Use force=true to reload.',
        processed: 0,
        skipped: dates.length,
        failed: 0,
      })
    }

    // Process dates in batches to avoid rate limiting
    const BATCH_SIZE = 10
    const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds
    const DELAY_BETWEEN_REQUESTS = 500 // 0.5 seconds

    let successCount = 0
    let failCount = 0
    const errors: any[] = []

    for (let i = 0; i < datesToProcess.length; i += BATCH_SIZE) {
      const batch = datesToProcess.slice(i, i + BATCH_SIZE)
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(datesToProcess.length / BATCH_SIZE)} (${batch.length} dates)`)

      // Process batch in parallel
      const batchPromises = batch.map(async (dateStr) => {
        try {
          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_REQUESTS * (i % BATCH_SIZE)))

          const nextDay = new Date(dateStr)
          nextDay.setDate(nextDay.getDate() + 1)
          const nextDayStr = nextDay.toISOString().split('T')[0]

          // Fetch electricity and gas prices
          const [electricityResponse, gasResponse] = await Promise.all([
            fetch(
              `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
              {
                headers: { Accept: 'application/json' },
                next: { revalidate: 0 }, // Don't cache
              }
            ),
            fetch(
              `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`,
              {
                headers: { Accept: 'application/json' },
                next: { revalidate: 0 },
              }
            ),
          ])

          if (!electricityResponse.ok || !gasResponse.ok) {
            throw new Error(`API request failed for ${dateStr}`)
          }

          const [electricityData, gasData] = await Promise.all([
            electricityResponse.json(),
            gasResponse.json(),
          ])

          const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
          const gasPrices = gasData.Prices?.map((p: any) => p.price) || []

          if (electricityPrices.length === 0 || gasPrices.length === 0) {
            throw new Error(`No price data for ${dateStr}`)
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

          // Upsert to database
          const { error: upsertError } = await supabase
            .from('dynamic_prices')
            .upsert(
              {
                datum: dateStr,
                elektriciteit_gemiddeld_dag: avgDay,
                elektriciteit_gemiddeld_nacht: avgNight,
                elektriciteit_min_dag: Math.min(...electricityPrices),
                elektriciteit_max_dag: Math.max(...electricityPrices),
                gas_gemiddeld: avgGas,
                gas_min: Math.min(...gasPrices),
                gas_max: Math.max(...gasPrices),
                bron: 'ENERGYZERO',
                laatst_geupdate: new Date().toISOString(),
                is_voorspelling: false,
              },
              {
                onConflict: 'datum',
              }
            )

          if (upsertError) {
            throw new Error(`Database error: ${upsertError.message}`)
          }

          return { date: dateStr, status: 'success' }
        } catch (error: any) {
          console.error(`❌ Error processing ${dateStr}:`, error.message)
          return { date: dateStr, status: 'failed', error: error.message }
        }
      })

      const batchResults = await Promise.all(batchPromises)

      // Count successes and failures
      batchResults.forEach((result) => {
        if (result.status === 'success') {
          successCount++
        } else {
          failCount++
          errors.push(result)
        }
      })

      console.log(`✅ Batch complete: ${successCount} success, ${failCount} failed`)

      // Delay between batches (except for the last one)
      if (i + BATCH_SIZE < datesToProcess.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
      }
    }

    const skipped = dates.length - datesToProcess.length

    console.log(`✅ Historical price load complete!`)
    console.log(`   Processed: ${successCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log(`   Skipped: ${skipped}`)

    return NextResponse.json({
      success: true,
      summary: {
        total: dates.length,
        processed: successCount,
        failed: failCount,
        skipped,
        remaining: dates.length - datesToProcess.length - successCount - failCount,
      },
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      errors: errors.slice(0, 50), // Return first 50 errors
      hasMore: datesToProcess.length > limit,
    })
  } catch (error: any) {
    console.error('❌ Error in load-historical:', error)
    
    // Better error message
    const errorMessage = error?.message || error?.toString() || 'Failed to load historical prices'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    )
  }
}

