import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/energieprijzen/uur
 * 
 * Returns hourly electricity prices for a specific date
 * First tries to fetch from Supabase, falls back to EnergyZero API
 * Query params:
 * - date: YYYY-MM-DD (default: today)
 * - type: 'elektriciteit' | 'gas' (default: 'elektriciteit')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const type = searchParams.get('type') || 'elektriciteit'
    
    // Only fetch from Supabase for electricity (gas doesn't have hourly data)
    if (type === 'elektriciteit') {
      try {
        const supabase = await createClient()
        
        // Fetch from Supabase hourly_prices table
        const { data: hourlyPrices, error } = await supabase
          .from('hourly_prices')
          .select('*')
          .eq('datum', dateStr)
          .order('uur', { ascending: true })
        
        if (error) {
          console.error('Supabase query error:', error)
          // Fall through to EnergyZero API
        } else if (hourlyPrices && hourlyPrices.length > 0) {
          // Sort by uur and kwartier (Supabase order only handles one column)
          hourlyPrices.sort((a, b) => {
            if (a.uur !== b.uur) return a.uur - b.uur
            return a.kwartier - b.kwartier
          })
          
          // Check if we have quarter-hourly data (96 records) or only hourly (24 records)
          const hasQuarterHourlyData = hourlyPrices.length >= 96
          
          // Transform Supabase data to expected format
          const quarterHourlyData = hourlyPrices.map((p) => ({
            hour: p.uur,
            quarter: p.kwartier,
            timestamp: p.timestamp || new Date(`${dateStr}T${String(p.uur).padStart(2, '0')}:${String(p.kwartier * 15).padStart(2, '0')}:00Z`).toISOString(),
            price: typeof p.prijs === 'string' ? parseFloat(p.prijs) : Number(p.prijs),
            time: `${String(p.uur).padStart(2, '0')}:${String(p.kwartier * 15).padStart(2, '0')}`,
          }))
          
          // If we only have hourly data (24 records with kwartier=0), interpolate to quarter-hourly
          if (!hasQuarterHourlyData && hourlyPrices.length === 24) {
            console.log(`⚠️ Only hourly data found in Supabase for ${dateStr}, interpolating to quarter-hourly...`)
            
            // Interpolate hourly prices to quarter-hourly
            const interpolatedData: any[] = []
            for (let i = 0; i < hourlyPrices.length; i++) {
              const currentHour = hourlyPrices[i]
              const nextHour = hourlyPrices[i + 1] || currentHour // Use same price for last hour
              
              // Create 4 quarter-hour records for this hour
              for (let q = 0; q < 4; q++) {
                let price: number
                
                if (q === 0) {
                  price = typeof currentHour.prijs === 'string' ? parseFloat(currentHour.prijs) : Number(currentHour.prijs)
                } else if (q === 1) {
                  const currentPrice = typeof currentHour.prijs === 'string' ? parseFloat(currentHour.prijs) : Number(currentHour.prijs)
                  const nextPrice = typeof nextHour.prijs === 'string' ? parseFloat(nextHour.prijs) : Number(nextHour.prijs)
                  price = currentPrice * 0.75 + nextPrice * 0.25
                } else if (q === 2) {
                  const currentPrice = typeof currentHour.prijs === 'string' ? parseFloat(currentHour.prijs) : Number(currentHour.prijs)
                  const nextPrice = typeof nextHour.prijs === 'string' ? parseFloat(nextHour.prijs) : Number(nextHour.prijs)
                  price = (currentPrice + nextPrice) / 2
                } else {
                  const currentPrice = typeof currentHour.prijs === 'string' ? parseFloat(currentHour.prijs) : Number(currentHour.prijs)
                  const nextPrice = typeof nextHour.prijs === 'string' ? parseFloat(nextHour.prijs) : Number(nextHour.prijs)
                  price = currentPrice * 0.25 + nextPrice * 0.75
                }
                
                const timestamp = new Date(`${dateStr}T${String(currentHour.uur).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}:00Z`)
                
                interpolatedData.push({
                  hour: currentHour.uur,
                  quarter: q,
                  timestamp: timestamp.toISOString(),
                  price: price,
                  time: `${String(currentHour.uur).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}`,
                })
              }
            }
            
            // Calculate averages
            const avgPrice = interpolatedData.reduce((sum: number, h: any) => sum + h.price, 0) / interpolatedData.length
            const minPrice = Math.min(...interpolatedData.map((h: any) => h.price))
            const maxPrice = Math.max(...interpolatedData.map((h: any) => h.price))
            
            // Group by hour for hourly view
            const hourlyGroups: Record<number, number[]> = {}
            interpolatedData.forEach((h: any) => {
              if (!hourlyGroups[h.hour]) {
                hourlyGroups[h.hour] = []
              }
              hourlyGroups[h.hour].push(h.price)
            })
            
            const hourlyAverages = Object.entries(hourlyGroups).map(([hour, prices]) => ({
              hour: parseInt(hour),
              price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
              min: Math.min(...prices),
              max: Math.max(...prices),
            })).sort((a, b) => a.hour - b.hour)
            
            return NextResponse.json({
              success: true,
              date: dateStr,
              type,
              hourly: hourlyAverages,
              quarterHourly: interpolatedData,
              averages: {
                average: avgPrice,
                min: minPrice,
                max: maxPrice,
              },
              source: 'supabase_interpolated',
            })
          } else {
            // Calculate averages
            const avgPrice = quarterHourlyData.reduce((sum: number, h: any) => sum + h.price, 0) / quarterHourlyData.length
            const minPrice = Math.min(...quarterHourlyData.map((h: any) => h.price))
            const maxPrice = Math.max(...quarterHourlyData.map((h: any) => h.price))
            
            // Group by hour for hourly view
            const hourlyGroups: Record<number, number[]> = {}
            quarterHourlyData.forEach((h: any) => {
              if (!hourlyGroups[h.hour]) {
                hourlyGroups[h.hour] = []
              }
              hourlyGroups[h.hour].push(h.price)
            })
            
            const hourlyAverages = Object.entries(hourlyGroups).map(([hour, prices]) => ({
              hour: parseInt(hour),
              price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
              min: Math.min(...prices),
              max: Math.max(...prices),
            })).sort((a, b) => a.hour - b.hour)
            
            return NextResponse.json({
              success: true,
              date: dateStr,
              type,
              hourly: hourlyAverages,
              quarterHourly: quarterHourlyData,
              averages: {
                average: avgPrice,
                min: minPrice,
                max: maxPrice,
              },
              source: 'supabase',
            })
          }
        } else {
          // No data in Supabase, fall through to EnergyZero API
          console.log(`No hourly prices found in Supabase for date: ${dateStr}`)
        }
      } catch (supabaseError: any) {
        console.error('Error fetching from Supabase, falling back to API:', supabaseError?.message || supabaseError)
        // Fall through to EnergyZero API
      }
    }
    
    // Fallback to EnergyZero API
    const nextDay = new Date(dateStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    
    const usageType = type === 'gas' ? 3 : 1
    const apiUrl = `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}T00:00:00Z&tillDate=${nextDayStr}T00:00:00Z&interval=4&usageType=${usageType}&inclBtw=false`
    
    try {
      const response = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`EnergyZero API error (${response.status}):`, errorText)
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to fetch hourly prices from EnergyZero: ${response.status} ${response.statusText}` 
          },
          { status: response.status >= 500 ? 500 : 404 }
        )
      }
      
      const data = await response.json()
      const prices = data.Prices || []
      
      if (prices.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No price data available for this date' },
          { status: 404 }
        )
      }
      
      // Transform to hourly format first
      const hourlyRecords = prices
        .map((p: any) => {
          // Use readingDate if available, otherwise from
          const dateStr = p.readingDate || p.from
          if (!dateStr) return null
          
          const date = new Date(dateStr)
          if (isNaN(date.getTime())) return null
          
          const hour = date.getUTCHours()
          
          if (typeof p.price !== 'number' || isNaN(p.price)) return null
          
          return {
            hour,
            price: p.price,
            timestamp: date.toISOString(),
          }
        })
        .filter((item: any) => item !== null)
        .sort((a: any, b: any) => a.hour - b.hour)
      
      // Interpolate hourly prices to quarter-hourly prices
      // For each hour, create 4 quarter-hour records
      const hourlyData: any[] = []
      for (let i = 0; i < hourlyRecords.length; i++) {
        const currentHour = hourlyRecords[i]
        const nextHour = hourlyRecords[i + 1] || currentHour // Use same price for last hour
        
        // Create 4 quarter-hour records for this hour
        for (let q = 0; q < 4; q++) {
          let price: number
          
          if (q === 0) {
            // Q0 (00:00): use current hour price
            price = currentHour.price
          } else if (q === 1) {
            // Q1 (15:00): interpolate between current and next hour (25% next, 75% current)
            price = currentHour.price * 0.75 + nextHour.price * 0.25
          } else if (q === 2) {
            // Q2 (30:00): average of current and next hour
            price = (currentHour.price + nextHour.price) / 2
          } else {
            // Q3 (45:00): interpolate between current and next hour (75% next, 25% current)
            price = currentHour.price * 0.25 + nextHour.price * 0.75
          }
          
          const timestamp = new Date(`${dateStr}T${String(currentHour.hour).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}:00Z`)
          
          hourlyData.push({
            hour: currentHour.hour,
            quarter: q,
            timestamp: timestamp.toISOString(),
            price: price,
            time: `${String(currentHour.hour).padStart(2, '0')}:${String(q * 15).padStart(2, '0')}`,
          })
        }
      }
      
      if (hourlyData.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid price data found in API response' },
          { status: 404 }
        )
      }
      
      // Calculate averages
      const avgPrice = hourlyData.reduce((sum: number, h: any) => sum + h.price, 0) / hourlyData.length
      const minPrice = Math.min(...hourlyData.map((h: any) => h.price))
      const maxPrice = Math.max(...hourlyData.map((h: any) => h.price))
      
      // Group by hour for hourly view
      const hourlyGroups: Record<number, number[]> = {}
      hourlyData.forEach((h: any) => {
        if (!hourlyGroups[h.hour]) {
          hourlyGroups[h.hour] = []
        }
        hourlyGroups[h.hour].push(h.price)
      })
      
      const hourlyAverages = Object.entries(hourlyGroups).map(([hour, prices]) => ({
        hour: parseInt(hour),
        price: prices.reduce((sum, p) => sum + p, 0) / prices.length,
        min: Math.min(...prices),
        max: Math.max(...prices),
      })).sort((a, b) => a.hour - b.hour)
      
      // Save quarter-hourly prices to Supabase for future use
      // Only save if we have full quarter-hourly data (96 records = 24 hours * 4 quarters)
      if (hourlyData.length >= 96 && type === 'elektriciteit') {
        try {
          const supabase = await createClient()
          
          // Prepare data for upsert
          const recordsToInsert = hourlyData.map((item: any) => ({
            datum: dateStr,
            uur: item.hour,
            kwartier: item.quarter,
            prijs: item.price,
            timestamp: item.timestamp,
            bron: 'ENERGYZERO',
            laatst_geupdate: new Date().toISOString(),
          }))
          
          // Upsert in batches to avoid payload size limits
          const batchSize = 100
          for (let i = 0; i < recordsToInsert.length; i += batchSize) {
            const batch = recordsToInsert.slice(i, i + batchSize)
            const { error: upsertError } = await supabase
              .from('hourly_prices')
              .upsert(batch, {
                onConflict: 'datum,uur,kwartier',
                ignoreDuplicates: false,
              })
            
            if (upsertError) {
              console.error(`Error saving hourly prices batch ${i / batchSize + 1}:`, upsertError)
              // Continue with other batches even if one fails
            }
          }
          
          console.log(`✅ Saved ${recordsToInsert.length} quarter-hourly prices to Supabase for ${dateStr}`)
        } catch (saveError: any) {
          console.error('Error saving quarter-hourly prices to Supabase:', saveError?.message || saveError)
          // Don't fail the request if save fails - data is still returned
        }
      }
      
      return NextResponse.json({
        success: true,
        date: dateStr,
        type,
        hourly: hourlyAverages,
        quarterHourly: hourlyData,
        averages: {
          average: avgPrice,
          min: minPrice,
          max: maxPrice,
        },
        source: 'energyzero',
      })
    } catch (apiError: any) {
      console.error('EnergyZero API fetch error:', apiError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Error fetching from EnergyZero API: ${apiError?.message || 'Unknown error'}` 
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error in energieprijzen/uur:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Fout bij ophalen uurlijkse prijzen',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

