import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/energieprijzen/update-recent
 * 
 * Updates the last 7 days of prices from EnergyZero API
 * Can be called manually to refresh recent prices
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const today = new Date()
    
    console.log('🔄 Starting manual price update for last 7 days...')

    let successCount = 0
    let failCount = 0
    const results: any[] = []

    // Update last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().split('T')[0]

      try {
        // Fetch electricity prices
        const electricityResponse = await fetch(
          `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=1&inclBtw=false`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 0 } // No cache
          }
        )

        if (!electricityResponse.ok) {
          console.error(`❌ Electricity API failed for ${dateStr}: ${electricityResponse.status}`)
          failCount++
          continue
        }

        const electricityData = await electricityResponse.json()

        // Fetch gas prices
        const gasResponse = await fetch(
          `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=3&inclBtw=false`,
          {
            headers: {
              'Accept': 'application/json',
            },
            next: { revalidate: 0 }
          }
        )

        if (!gasResponse.ok) {
          console.error(`❌ Gas API failed for ${dateStr}: ${gasResponse.status}`)
          failCount++
          continue
        }

        const gasData = await gasResponse.json()

        // Process electricity data
        const electricityPrices = electricityData.Prices?.map((p: any) => p.price) || []
        if (electricityPrices.length === 0) {
          console.error(`❌ No electricity prices for ${dateStr}`)
          failCount++
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
        const minElectricity = Math.min(...electricityPrices)
        const maxElectricity = Math.max(...electricityPrices)

        // Process gas data
        const gasPrices = gasData.Prices?.map((p: any) => p.price) || []
        if (gasPrices.length === 0) {
          console.error(`❌ No gas prices for ${dateStr}`)
          failCount++
          continue
        }
        
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
          console.error(`❌ Failed to save ${dateStr}:`, error.message)
          failCount++
          results.push({
            date: dateStr,
            success: false,
            error: error.message
          })
        } else {
          console.log(`✅ Updated ${dateStr}: Elec €${avgElectricity.toFixed(5)}/kWh, Gas €${avgGas.toFixed(5)}/m³`)
          successCount++
          results.push({
            date: dateStr,
            success: true,
            electricity: avgElectricity,
            gas: avgGas
          })
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (error: any) {
        console.error(`❌ Error processing ${dateStr}:`, error.message)
        failCount++
        results.push({
          date: dateStr,
          success: false,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: 7,
        success: successCount,
        failed: failCount
      },
      results
    })

  } catch (error: any) {
    console.error('❌ Error in update-recent:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update prices'
      },
      { status: 500 }
    )
  }
}

