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
    // Verify this is a cron request
    // Vercel cron jobs automatically add an Authorization header
    // If CRON_SECRET is set, verify it matches
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // Check if this is a Vercel cron request (has authorization header)
    // Or allow if CRON_SECRET is not set (for manual testing)
    if (cronSecret) {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        console.error('❌ Unauthorized cron request - missing or invalid auth header')
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
    } else {
      // If no CRON_SECRET is set, allow requests with Vercel's default cron header
      // Vercel cron jobs always include an authorization header
      if (!authHeader) {
        console.warn('⚠️  No CRON_SECRET set and no auth header - allowing request (may be manual test)')
      }
    }

    console.log('🔄 Starting daily price update...')
    
    // Day-ahead pricing: fetch prices for TOMORROW
    // Cron runs at 14:00 UTC, at which point tomorrow's prices are available
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    // Set to UTC midnight to get the correct date
    const tomorrowUTC = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()))
    const tomorrowStr = tomorrowUTC.toISOString().split('T')[0]
    
    console.log(`📅 Today's date (UTC): ${today.toISOString().split('T')[0]}`)
    console.log(`📅 Fetching day-ahead prices for: ${tomorrowStr} (tomorrow)`)
    
    // Check if tomorrow's prices already exist
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('datum', tomorrowStr)
      .single()

    if (existing) {
      console.log(`⏭️  Prices for ${tomorrowStr} already exist, updating...`)
    }

    // Fetch tomorrow's day-ahead prices
    console.log(`📡 Fetching day-ahead prices for ${tomorrowStr}...`)
    let prices
    try {
      prices = await fetchDayAheadPrices(tomorrowUTC)
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
    
    // Note: fetchDayAheadPrices now throws an error instead of returning FALLBACK
    // So we don't need to check for FALLBACK here anymore

    // Save to database with tomorrow's date
    console.log(`💾 Saving prices to database for ${tomorrowStr}...`)
    await saveDynamicPrices({
      electricity: prices.electricity,
      gas: prices.gas,
      source: prices.source,
      date: tomorrowStr,
    })

    console.log(`✅ Successfully updated day-ahead prices for ${tomorrowStr}`)
    console.log(`   Electricity: €${prices.electricity.average.toFixed(5)}/kWh`)
    console.log(`   Gas: €${prices.gas.average.toFixed(5)}/m³`)
    console.log(`   Source: ${prices.source}`)

    return NextResponse.json({
      success: true,
      date: tomorrowStr,
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
