import { NextResponse } from 'next/server'
import { fetchDayAheadPrices } from '@/lib/dynamic-pricing/api-client'
import { saveDynamicPrices } from '@/lib/dynamic-pricing/database'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * CRON endpoint: Update dynamic prices daily (day-ahead)
 * 
 * Called by EasyCron.com at 14:00 UTC daily
 * Fetches TOMORROW's day-ahead prices and saves them to Supabase
 * 
 * Day-ahead pricing logic:
 * - At 14:00 UTC, tomorrow's prices become available
 * - This allows users to see tomorrow's prices from 14:00 onwards
 * - Prices are saved with tomorrow's date in the database
 * 
 * Security: Protected by EASYCRON_SECRET environment variable
 * 
 * Usage:
 * curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
 *   -H "Authorization: Bearer <EASYCRON_SECRET>"
 */

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  // Log immediately to ensure we see something in logs
  console.log('🚀 CRON JOB STARTED - update-dynamic-prices')
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  try {
    // Security: Verify EasyCron secret
    const authHeader = request.headers.get('authorization')?.trim()
    const easyCronSecret = process.env.EASYCRON_SECRET?.trim()
    
    // Log for debugging (sanitized)
    console.log('🔍 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? `"${authHeader.substring(0, 20)}..."` : 'none',
      hasEasyCronSecret: !!easyCronSecret,
      easyCronSecretPreview: easyCronSecret ? `"${easyCronSecret.substring(0, 10)}..."` : 'none',
    })
    
    // Check authorization
    if (easyCronSecret) {
      const expectedBearerHeader = `Bearer ${easyCronSecret}`
      const isAuthorized = authHeader === expectedBearerHeader
      
      if (!isAuthorized) {
        console.error('❌ Unauthorized: Invalid or missing Authorization header')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized: Invalid or missing secret',
            hint: 'Use: Authorization: Bearer <EASYCRON_SECRET>'
          },
          { status: 401 }
        )
      }
      
      console.log('✅ Authorization successful')
    } else {
      console.warn('⚠️  EASYCRON_SECRET not set - endpoint is unprotected!')
    }

    console.log('🔄 Starting daily price update...')
    
    // Use service role client for INSERT/UPDATE operations (bypasses RLS)
    const supabaseServiceRole = createServiceRoleClient()
    // Use regular client for SELECT operations (respects RLS, but prices are public)
    const supabase = await createClient()
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
    const todayStr = todayUTC.toISOString().split('T')[0]
    
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    const tomorrowUTC = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()))
    const tomorrowStr = tomorrowUTC.toISOString().split('T')[0]
    
    console.log(`📅 Today's date (UTC): ${todayStr}`)
    console.log(`📅 Tomorrow's date (UTC): ${tomorrowStr}`)
    
    const results: any = {
      today: null,
      tomorrow: null,
    }
    
    // STEP 1: Load tomorrow's prices (primary task)
    console.log(`\n📡 STEP 1: Fetching tomorrow's prices (${tomorrowStr})...`)
    try {
      const tomorrowPrices = await fetchDayAheadPrices(tomorrowUTC)
      
      // Check if tomorrow's prices already exist
      const { data: existingTomorrow } = await supabase
        .from('dynamic_prices')
        .select('datum')
        .eq('datum', tomorrowStr)
        .single()
      
      if (existingTomorrow) {
        console.log(`⏭️  Tomorrow's prices already exist, updating...`)
      } else {
        console.log(`📝 Creating new price record for tomorrow...`)
      }
      
      // Use service role for INSERT/UPDATE (required by RLS)
      await saveDynamicPrices({
        electricity: tomorrowPrices.electricity,
        gas: tomorrowPrices.gas,
        source: tomorrowPrices.source,
        date: tomorrowStr,
      }, supabaseServiceRole)
      
      results.tomorrow = {
        success: true,
        date: tomorrowStr,
        electricity: tomorrowPrices.electricity.average,
        gas: tomorrowPrices.gas.average,
        source: tomorrowPrices.source,
      }
      
      console.log(`✅ Successfully saved tomorrow's prices`)
      console.log(`   Electricity: €${tomorrowPrices.electricity.average.toFixed(5)}/kWh`)
      console.log(`   Gas: €${tomorrowPrices.gas.average.toFixed(5)}/m³`)
      console.log(`   Source: ${tomorrowPrices.source}`)
    } catch (error: any) {
      console.error(`❌ Failed to fetch/save tomorrow's prices:`, error.message)
      results.tomorrow = {
        success: false,
        error: error.message,
      }
    }
    
    // STEP 2: Check if today's prices exist, if not, load them
    console.log(`\n📡 STEP 2: Checking if today's prices (${todayStr}) exist...`)
    const { data: existingToday } = await supabase
      .from('dynamic_prices')
      .select('datum')
      .eq('datum', todayStr)
      .single()
    
    if (existingToday) {
      console.log(`✅ Today's prices already exist in database, skipping...`)
      results.today = {
        success: true,
        date: todayStr,
        skipped: true,
        reason: 'Already exists in database',
      }
    } else {
      console.log(`⚠️  Today's prices NOT found in database, fetching now...`)
      try {
        const todayPrices = await fetchDayAheadPrices(todayUTC)
        
        // Use service role for INSERT/UPDATE (required by RLS)
        await saveDynamicPrices({
          electricity: todayPrices.electricity,
          gas: todayPrices.gas,
          source: todayPrices.source,
          date: todayStr,
        }, supabaseServiceRole)
        
        results.today = {
          success: true,
          date: todayStr,
          electricity: todayPrices.electricity.average,
          gas: todayPrices.gas.average,
          source: todayPrices.source,
        }
        
        console.log(`✅ Successfully saved today's prices`)
        console.log(`   Electricity: €${todayPrices.electricity.average.toFixed(5)}/kWh`)
        console.log(`   Gas: €${todayPrices.gas.average.toFixed(5)}/m³`)
        console.log(`   Source: ${todayPrices.source}`)
      } catch (error: any) {
        console.error(`❌ Failed to fetch/save today's prices:`, error.message)
        results.today = {
          success: false,
          error: error.message,
        }
      }
    }
    
    // Summary
    const allSuccess = results.tomorrow?.success && (results.today?.success || results.today?.skipped)
    
    console.log(`\n📊 Summary:`)
    console.log(`   Tomorrow (${tomorrowStr}): ${results.tomorrow?.success ? '✅' : '❌'}`)
    console.log(`   Today (${todayStr}): ${results.today?.success || results.today?.skipped ? '✅' : '❌'}`)
    
    return NextResponse.json({
      success: allSuccess,
      results,
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