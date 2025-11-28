import { NextResponse } from 'next/server'
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'

/**
 * GET /api/dynamic-pricing/current
 * 
 * Returns current dynamic prices (with caching)
 */
export async function GET(request: Request) {
  try {
    const prices = await getCurrentDynamicPrices()
    
    return NextResponse.json({ 
      success: true, 
      prices: {
        electricity: prices.electricity,
        electricityDay: prices.electricityDay,
        electricityNight: prices.electricityNight,
        gas: prices.gas,
        source: prices.source,
        lastUpdated: prices.lastUpdated.toISOString(),
        isFresh: prices.isFresh
      }
    })
  } catch (error: any) {
    console.error('Error fetching current prices:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen huidige tarieven' },
      { status: 500 }
    )
  }
}

