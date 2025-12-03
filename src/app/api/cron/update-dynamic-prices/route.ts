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

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // Verify this is a cron request
    // Vercel cron jobs automatically add an Authorization header
    // For manual testing, use: Authorization: Bearer <CRON_SECRET>
    const authHeader = request.headers.get('authorization')?.trim()
    const cronSecret = process.env.CRON_SECRET?.trim()
    
    // Debug logging (remove in production if needed)
    console.log('🔍 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader ? `"${authHeader}"` : 'none',
      hasCronSecret: !!cronSecret,
      cronSecretValue: cronSecret ? `"${cronSecret}"` : 'none',
      expectedHeader: cronSecret ? `Bearer ${cronSecret}` : 'none',
      headersMatch: authHeader === (cronSecret ? `Bearer ${cronSecret}` : null),
    })
    
    // Security check:
    // Vercel cron jobs automatically send Authorization header with CRON_SECRET
    // They also send x-vercel-cron header for verification
    // For manual testing, use: curl -H "Authorization: Bearer <CRON_SECRET>" ...
    
    const isVercelCron = request.headers.get('x-vercel-cron') !== null ||
                        request.headers.get('x-vercel-signature') !== null
    
    if (cronSecret) {
      // Check if request has valid Bearer token
      const expectedHeader = `Bearer ${cronSecret}`
      const hasValidAuth = authHeader === expectedHeader
      
      // Allow if: valid auth header OR Vercel cron header present
      if (!hasValidAuth && !isVercelCron) {
        console.error('❌ Unauthorized cron request')
        console.error('   Received header:', authHeader ? `"${authHeader}"` : 'none')
        console.error('   Expected header:', `"${expectedHeader}"`)
        console.error('   Is Vercel cron:', isVercelCron)
        console.error('   Vercel headers:', {
          'x-vercel-cron': request.headers.get('x-vercel-cron'),
          'x-vercel-signature': request.headers.get('x-vercel-signature'),
        })
        console.error('   For manual testing, use: Authorization: Bearer <CRON_SECRET>')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized. Use Authorization: Bearer <CRON_SECRET> header for manual testing' 
          },
          { status: 401 }
        )
      }
      
      if (hasValidAuth) {
        console.log('✅ Auth header matches!')
      } else if (isVercelCron) {
        console.log('✅ Vercel cron request detected (x-vercel-cron header)')
      }
    } else {
      // No CRON_SECRET set - allow all requests (not recommended for production)
      console.warn('⚠️  No CRON_SECRET set - allowing request (should set CRON_SECRET in production)')
      if (isVercelCron) {
        console.log('✅ Vercel cron request detected (x-vercel-cron header)')
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
    
    // Note: targetDate will be set to todayStr if tomorrow's prices aren't available
    // We'll check for existing prices after we know which date we're using

    // Fetch tomorrow's day-ahead prices
    console.log(`📡 Fetching day-ahead prices for ${tomorrowStr}...`)
    let prices
    let targetDate = tomorrowStr
    
    try {
      prices = await fetchDayAheadPrices(tomorrowUTC)
    } catch (error: any) {
      console.error('❌ Failed to fetch tomorrow\'s prices:', error.message)
      console.log('⚠️  Tomorrow\'s prices may not be available yet. Trying today\'s prices as fallback...')
      
      // Fallback: try today's prices if tomorrow's aren't available yet
      // This can happen if the cron job runs before 14:00 UTC
      const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
      const todayStr = todayUTC.toISOString().split('T')[0]
      
      try {
        prices = await fetchDayAheadPrices(todayUTC)
        targetDate = todayStr
        console.log(`✅ Successfully fetched today's prices (${todayStr}) as fallback`)
      } catch (fallbackError: any) {
        console.error('❌ Fallback to today also failed:', fallbackError.message)
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to fetch prices: ${error.message}. Fallback also failed: ${fallbackError.message}`,
            details: {
              attemptedTomorrow: tomorrowStr,
              attemptedToday: todayStr,
              originalError: error.message,
              fallbackError: fallbackError.message
            }
          },
          { status: 500 }
        )
      }
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

    // Check if prices already exist for target date
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('datum', targetDate)
      .single()

    if (existing) {
      console.log(`⏭️  Prices for ${targetDate} already exist, updating...`)
    } else {
      console.log(`📝 Creating new price record for ${targetDate}...`)
    }

    // Save to database with target date (tomorrow if available, today as fallback)
    console.log(`💾 Saving prices to database for ${targetDate}...`)
    await saveDynamicPrices({
      electricity: prices.electricity,
      gas: prices.gas,
      source: prices.source,
      date: targetDate,
    })

    console.log(`✅ Successfully updated prices for ${targetDate}`)
    console.log(`   Electricity: €${prices.electricity.average.toFixed(5)}/kWh`)
    console.log(`   Gas: €${prices.gas.average.toFixed(5)}/m³`)
    console.log(`   Source: ${prices.source}`)

    return NextResponse.json({
      success: true,
      date: targetDate,
      isTomorrow: targetDate === tomorrowStr,
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
