import { NextResponse } from 'next/server'
import { fetchDayAheadPrices } from '@/lib/dynamic-pricing/api-client'
import { saveDynamicPrices } from '@/lib/dynamic-pricing/database'
import { createClient } from '@/lib/supabase/server'

/**
 * CRON endpoint: Update dynamic prices daily (day-ahead)
 * 
 * Called by Vercel Cron Jobs at 14:00 UTC daily
 * Fetches TOMORROW's day-ahead prices and saves them to Supabase
 * 
 * Day-ahead pricing logic:
 * - At 14:00 UTC, tomorrow's prices become available
 * - This allows users to see tomorrow's prices from 14:00 onwards
 * - Prices are saved with tomorrow's date in the database
 * 
 * Security: Should be protected by Vercel Cron secret
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron request
    // Vercel cron jobs automatically add an Authorization header
    // For manual testing, use: Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // Debug logging (remove in production if needed)
    console.log('🔍 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderPrefix: authHeader?.substring(0, 20) + '...',
      hasCronSecret: !!cronSecret,
      cronSecretPrefix: cronSecret ? cronSecret.substring(0, 10) + '...' : 'none',
      expectedHeader: cronSecret ? `Bearer ${cronSecret}` : 'none',
      headersMatch: authHeader === (cronSecret ? `Bearer ${cronSecret}` : null),
    })
    
    // Security check:
    // - If CRON_SECRET is set, require valid Bearer token OR Vercel cron header
    // - Vercel cron jobs send Authorization header automatically
    // - For manual testing, use: curl -H "Authorization: Bearer <CRON_SECRET>" ...
    if (cronSecret) {
      // Check if request has valid Bearer token
      const expectedHeader = `Bearer ${cronSecret}`
      if (!authHeader || authHeader !== expectedHeader) {
        // Check if it's a Vercel cron request (they send a special header)
        // Vercel cron jobs include Authorization header automatically, but we check CRON_SECRET
        // If no valid auth, reject (unless it's a Vercel internal cron call)
        const isVercelInternal = request.headers.get('x-vercel-signature') !== null ||
                                request.headers.get('x-vercel-cron') !== null
        
        if (!isVercelInternal) {
          console.error('❌ Unauthorized cron request')
          console.error('   Received header:', authHeader || 'none')
          console.error('   Expected header:', expectedHeader)
          console.error('   Match:', authHeader === expectedHeader)
          console.error('   For manual testing, use: Authorization: Bearer <CRON_SECRET>')
          return NextResponse.json(
            { 
              success: false, 
              error: 'Unauthorized. Use Authorization: Bearer <CRON_SECRET> header for manual testing' 
            },
            { status: 401 }
          )
        }
      } else {
        console.log('✅ Auth header matches!')
      }
    } else {
      // No CRON_SECRET set - allow all requests (not recommended for production)
      console.warn('⚠️  No CRON_SECRET set - allowing request (should set CRON_SECRET in production)')
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
