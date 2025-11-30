import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/energieprijzen/check
 * 
 * Checks what prices are currently in the database
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 30) // Check last 30 days

    const { data: prices, error } = await supabase
      .from('dynamic_prices')
      .select('datum, elektriciteit_gemiddeld_dag, gas_gemiddeld, bron, laatst_geupdate')
      .gte('datum', sevenDaysAgo.toISOString().split('T')[0])
      .lte('datum', today.toISOString().split('T')[0])
      .order('datum', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Get total count
    const { count } = await supabase
      .from('dynamic_prices')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      totalRecords: count || 0,
      recentRecords: prices?.length || 0,
      prices: prices || [],
      dateRange: {
        from: sevenDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0]
      }
    })

  } catch (error: any) {
    console.error('Error in check:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to check prices'
      },
      { status: 500 }
    )
  }
}

