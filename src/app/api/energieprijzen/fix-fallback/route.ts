import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/energieprijzen/fix-fallback
 * 
 * Fixes fallback prices for specific dates by fetching real data from EnergyZero
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { dates } = await request.json().catch(() => ({ dates: ['2025-11-30', '2025-11-29', '2025-11-28'] }))
    
    console.log('🔄 Starting fallback price fix...', dates)
    
    const results: any[] = []
    
    for (const dateStr of dates) {
      console.log(`📅 Processing ${dateStr}...`)
      
      // Check if record exists and is FALLBACK
      const { data: existing } = await supabase
        .from('dynamic_prices')
        .select('*')
        .eq('datum', dateStr)
        .single()
      
      if (!existing) {
        results.push({ date: dateStr, status: 'skipped', reason: 'No record found' })
        continue
      }
      
      if (existing.bron !== 'FALLBACK') {
        results.push({ date: dateStr, status: 'skipped', reason: `Already has real data (${existing.bron})` })
        continue
      }
      
      // Fetch real prices from EnergyZero
      const nextDay = new Date(dateStr)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().split('T')[0]
      
      try {
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
          results.push({ date: dateStr, status: 'failed', error: 'API request failed' })
          continue
        }
        
        const [electricityData, gasData] = await Promise.all([
          electricityResponse.json(),
          gasResponse.json(),
        ])
        
        const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
        const gasPrices = gasData.Prices?.map((p: any) => p.price) || []
        
        if (electricityPrices.length === 0 || gasPrices.length === 0) {
          results.push({ date: dateStr, status: 'failed', error: 'No price data in API response' })
          continue
        }
        
        // Split into day (6-23) and night (23-6) periods
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
        
        const avgGas = gasPrices.reduce((a: number, b: number) => a + b, 0) / gasPrices.length
        
        // Update database
        const { error } = await supabase
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
        
        if (error) {
          results.push({ date: dateStr, status: 'failed', error: error.message })
        } else {
          results.push({
            date: dateStr,
            status: 'success',
            electricity: avgElectricity.toFixed(5),
            gas: avgGas.toFixed(5),
          })
          console.log(`✅ Successfully updated ${dateStr}`)
        }
        
        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 500))
        
      } catch (error: any) {
        results.push({ date: dateStr, status: 'failed', error: error.message })
      }
    }
    
    const successCount = results.filter(r => r.status === 'success').length
    const failCount = results.filter(r => r.status === 'failed').length
    
    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount,
        skipped: results.length - successCount - failCount,
      },
      results,
    })
    
  } catch (error: any) {
    console.error('❌ Error in fix-fallback:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fix fallback prices',
      },
      { status: 500 }
    )
  }
}

