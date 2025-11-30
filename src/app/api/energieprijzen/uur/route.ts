import { NextResponse } from 'next/server'

/**
 * GET /api/energieprijzen/uur
 * 
 * Returns hourly electricity prices for a specific date
 * Query params:
 * - date: YYYY-MM-DD (default: today)
 * - type: 'elektriciteit' | 'gas' (default: 'elektriciteit')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const type = searchParams.get('type') || 'elektriciteit'
    
    const nextDay = new Date(dateStr)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    
    // Fetch hourly prices from EnergyZero
    const usageType = type === 'gas' ? 3 : 1
    const response = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${dateStr}&tillDate=${nextDayStr}&interval=4&usageType=${usageType}&inclBtw=false`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    )
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch hourly prices' },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    const prices = data.Prices || []
    
    if (prices.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No price data available' },
        { status: 404 }
      )
    }
    
    // Transform to hourly format
    const hourlyData = prices.map((p: any, index: number) => {
      const date = new Date(p.from)
      const hour = date.getHours()
      const quarter = Math.floor(date.getMinutes() / 15)
      
      return {
        hour,
        quarter,
        timestamp: p.from,
        price: p.price,
        time: `${String(hour).padStart(2, '0')}:${String(quarter * 15).padStart(2, '0')}`,
      }
    })
    
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
    })
  } catch (error: any) {
    console.error('Error in energieprijzen/uur:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen uurlijkse prijzen' },
      { status: 500 }
    )
  }
}

