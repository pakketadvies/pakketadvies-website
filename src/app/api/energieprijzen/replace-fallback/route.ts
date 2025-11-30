import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/energieprijzen/replace-fallback
 * 
 * Replaces all FALLBACK records with real data from EnergyZero API
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    console.log('🔄 Starting FALLBACK data replacement...')
    
    // Find all FALLBACK records
    const { data: fallbackRecords, error: fetchError } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('bron', 'FALLBACK')
      .order('datum', { ascending: false })
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      )
    }
    
    if (!fallbackRecords || fallbackRecords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No FALLBACK records found',
        updated: 0
      })
    }
    
    console.log(`📊 Found ${fallbackRecords.length} FALLBACK records to replace`)
    
    let successCount = 0
    let failCount = 0
    const results: any[] = []
    
    // Process each FALLBACK record
    for (const record of fallbackRecords) {
      const dateStr = record.datum
      const date = new Date(dateStr)
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().split('T')[0]
      
      try {
        // Fetch from EnergyZero API
        const [electricityResponse, gasResponse] = await Promise.all([
          fetch(`https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`, {
            headers: { 'Accept': 'application/json' },
          }),
          fetch(`https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`, {
            headers: { 'Accept': 'application/json' },
          })
        ])
        
        if (!electricityResponse.ok || !gasResponse.ok) {
          results.push({ date: dateStr, status: 'failed', error: 'API not available for this date' })
          failCount++
          continue
        }
        
        const [electricityData, gasData] = await Promise.all([
          electricityResponse.json(),
          gasResponse.json()
        ])
        
        const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
        const gasPrices = gasData.Prices?.map((p: any) => p.price) || []
        
        if (electricityPrices.length === 0 || gasPrices.length === 0) {
          results.push({ date: dateStr, status: 'failed', error: 'No price data in API response' })
          failCount++
          continue
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
        
        // Process gas
        const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
        
        // Update database
        const { error: updateError } = await supabase
          .from('dynamic_prices')
          .update({
            elektriciteit_gemiddeld_dag: avgDay,
            elektriciteit_gemiddeld_nacht: avgNight,
            elektriciteit_min_dag: Math.min(...electricityPrices),
            elektriciteit_max_dag: Math.max(...electricityPrices),
            gas_gemiddeld: avgGas,
            gas_min: Math.min(...gasPrices),
            gas_max: Math.max(...gasPrices),
            bron: 'ENERGYZERO',
            laatst_geupdate: new Date().toISOString(),
          })
          .eq('datum', dateStr)
        
        if (updateError) {
          results.push({ date: dateStr, status: 'failed', error: updateError.message })
          failCount++
        } else {
          results.push({ 
            date: dateStr, 
            status: 'success',
            electricity: avgElectricity.toFixed(5),
            gas: avgGas.toFixed(5)
          })
          successCount++
          console.log(`✅ Updated ${dateStr}: Elec €${avgElectricity.toFixed(5)}/kWh, Gas €${avgGas.toFixed(5)}/m³`)
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error: any) {
        results.push({ date: dateStr, status: 'failed', error: error.message })
        failCount++
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total: fallbackRecords.length,
        success: successCount,
        failed: failCount
      },
      results: results.slice(0, 50) // Return first 50 results
    })
    
  } catch (error: any) {
    console.error('❌ Error in replace-fallback:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to replace FALLBACK data'
      },
      { status: 500 }
    )
  }
}

