import { NextResponse } from 'next/server'
import { getPriceHistory } from '@/lib/dynamic-pricing/database'

/**
 * GET /api/dynamic-prices/history
 * 
 * Returns historical dynamic prices for the last N days
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30', 10)
    
    const history = await getPriceHistory(Math.min(days, 90)) // Max 90 days
    
    return NextResponse.json({ 
      success: true, 
      history,
      days: history.length 
    })
  } catch (error: any) {
    console.error('Error fetching price history:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen historische tarieven' },
      { status: 500 }
    )
  }
}

