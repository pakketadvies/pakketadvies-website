import { NextResponse } from 'next/server'
import { fetchDayAheadPrices } from '@/lib/dynamic-pricing/api-client'
import { saveDynamicPrices } from '@/lib/dynamic-pricing/database'
import { createClient } from '@/lib/supabase/server'

/**
 * CRON endpoint: Update dynamic prices daily
 * 
 * Called by Vercel Cron Jobs at 14:00 UTC daily
 * Fetches today's prices and saves them to Supabase
 * 
 * Security: Should be protected by Vercel Cron secret
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron request (Vercel adds Authorization header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Starting daily price update...')
    
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    
    // Check if today's prices already exist
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('datum', todayStr)
      .single()

    if (existing) {
      console.log(`⏭️  Prices for ${todayStr} already exist, updating...`)
    }

    // Fetch today's prices
    console.log(`📡 Fetching prices for ${todayStr}...`)
    let prices
    try {
      prices = await fetchDayAheadPrices(today)
    } catch (error: any) {
      console.error('❌ Failed to fetch prices:', error.message)
      return NextResponse.json(
        { success: false, error: `Failed to fetch prices: ${error.message}` },
        { status: 500 }
      )
    }
    
    if (!prices) {
      console.error('❌ No prices returned from API')
      return NextResponse.json(
        { success: false, error: 'No prices returned from API' },
        { status: 500 }
      )
    }
    
    // Ensure we never save FALLBACK data
    if (prices.source === 'FALLBACK') {
      console.error('❌ Received FALLBACK data - refusing to save')
      return NextResponse.json(
        { success: false, error: 'Received FALLBACK data - cannot save' },
        { status: 500 }
      )
    }

    // Save to database
    console.log(`💾 Saving prices to database...`)
    await saveDynamicPrices({
      electricity: prices.electricity,
      gas: prices.gas,
      source: prices.source,
      date: todayStr,
    })

    console.log(`✅ Successfully updated prices for ${todayStr}`)
    console.log(`   Electricity: €${prices.electricity.average.toFixed(5)}/kWh`)
    console.log(`   Gas: €${prices.gas.average.toFixed(5)}/m³`)
    console.log(`   Source: ${prices.source}`)

    return NextResponse.json({
      success: true,
      date: todayStr,
      prices: {
        electricity: prices.electricity.average,
        gas: prices.gas.average,
      },
      source: prices.source,
    })
  } catch (error: any) {
    console.error('❌ Error in cron job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update prices',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
