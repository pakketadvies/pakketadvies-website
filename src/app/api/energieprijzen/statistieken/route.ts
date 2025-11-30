import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/energieprijzen/statistieken
 * 
 * Returns statistics for energy prices over a period
 * Query params:
 * - periode: '30d' | '1j' | '2j' | '5j' (default: '30d')
 * - type: 'elektriciteit' | 'gas' (default: 'elektriciteit')
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    
    const periode = searchParams.get('periode') || '30d'
    const type = searchParams.get('type') || 'elektriciteit'
    
    // Calculate date range based on periode
    const today = new Date()
    const startDate = new Date(today)
    
    switch (periode) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '1j':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case '2j':
        startDate.setFullYear(startDate.getFullYear() - 2)
        break
      case '5j':
        startDate.setFullYear(startDate.getFullYear() - 5)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = today.toISOString().split('T')[0]
    
    // Fetch data
    const { data, error } = await supabase
      .from('dynamic_prices')
      .select('*')
      .gte('datum', startDateStr)
      .lte('datum', endDateStr)
      .order('datum', { ascending: true })
    
    if (error) {
      console.error('Error fetching statistics:', error)
      return NextResponse.json(
        { success: false, error: 'Fout bij ophalen statistieken' },
        { status: 500 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        periode,
        type,
        statistieken: null,
        message: 'Geen data beschikbaar voor deze periode',
      })
    }
    
    // Calculate statistics
    if (type === 'elektriciteit') {
      const prices = data.map(d => d.elektriciteit_gemiddeld_dag).filter(p => p != null)
      const nightPrices = data
        .map(d => d.elektriciteit_gemiddeld_nacht || d.elektriciteit_gemiddeld_dag * 0.8)
        .filter(p => p != null)
      
      const gemiddeld = prices.reduce((a, b) => a + b, 0) / prices.length
      const gemiddeld_nacht = nightPrices.reduce((a, b) => a + b, 0) / nightPrices.length
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      
      // Calculate trend (compare first half vs second half)
      const midPoint = Math.floor(prices.length / 2)
      const firstHalf = prices.slice(0, midPoint)
      const secondHalf = prices.slice(midPoint)
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const trendPercentage = ((avgSecond - avgFirst) / avgFirst) * 100
      
      return NextResponse.json({
        success: true,
        periode,
        type,
        statistieken: {
          gemiddeld: parseFloat(gemiddeld.toFixed(5)),
          gemiddeld_dag: parseFloat(gemiddeld.toFixed(5)),
          gemiddeld_nacht: parseFloat(gemiddeld_nacht.toFixed(5)),
          min: parseFloat(min.toFixed(5)),
          max: parseFloat(max.toFixed(5)),
          aantal_dagen: data.length,
          trend_percentage: parseFloat(trendPercentage.toFixed(2)),
          trend_richting: trendPercentage > 1 ? 'omhoog' : trendPercentage < -1 ? 'omlaag' : 'stabiel',
        },
      })
    } else {
      // Gas
      const prices = data.map(d => d.gas_gemiddeld).filter(p => p != null)
      
      const gemiddeld = prices.reduce((a, b) => a + b, 0) / prices.length
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      
      // Calculate trend
      const midPoint = Math.floor(prices.length / 2)
      const firstHalf = prices.slice(0, midPoint)
      const secondHalf = prices.slice(midPoint)
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
      const trendPercentage = ((avgSecond - avgFirst) / avgFirst) * 100
      
      return NextResponse.json({
        success: true,
        periode,
        type,
        statistieken: {
          gemiddeld: parseFloat(gemiddeld.toFixed(5)),
          min: parseFloat(min.toFixed(5)),
          max: parseFloat(max.toFixed(5)),
          aantal_dagen: data.length,
          trend_percentage: parseFloat(trendPercentage.toFixed(2)),
          trend_richting: trendPercentage > 1 ? 'omhoog' : trendPercentage < -1 ? 'omlaag' : 'stabiel',
        },
      })
    }
  } catch (error: any) {
    console.error('Error in energieprijzen/statistieken:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij berekenen statistieken' },
      { status: 500 }
    )
  }
}

