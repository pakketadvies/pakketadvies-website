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
    // IMPORTANT: Vercel cron jobs send ONLY x-vercel-cron header (NOT Authorization header)
    // According to Vercel docs, cron jobs send Authorization header with CRON_SECRET value
    // For manual testing, use: curl -H "Authorization: Bearer <CRON_SECRET>" ...
    
    // Check all possible Vercel cron indicators
    const vercelCronHeader = request.headers.get('x-vercel-cron')
    const vercelSignature = request.headers.get('x-vercel-signature')
    const vercelId = request.headers.get('x-vercel-id')
    const userAgent = request.headers.get('user-agent') || ''
    
    // Vercel cron jobs can be identified by:
    // 1. x-vercel-cron header (most reliable)
    // 2. x-vercel-signature header
    // 3. Authorization header matching CRON_SECRET (direct, not Bearer)
    // 4. User agent containing 'vercel'
    const isVercelCron = vercelCronHeader !== null || 
                        vercelSignature !== null ||
                        vercelId !== null ||
                        userAgent.toLowerCase().includes('vercel')
    
    // Vercel cron jobs send Authorization header with CRON_SECRET value directly (not Bearer)
    const isVercelDirectAuth = authHeader === cronSecret
    
    // For manual testing, we accept Bearer token format
    const expectedBearerHeader = cronSecret ? `Bearer ${cronSecret}` : null
    const hasBearerAuth = expectedBearerHeader && authHeader === expectedBearerHeader
    
    // Log all headers for debugging
    const allHeaders = {
      'x-vercel-cron': vercelCronHeader,
      'x-vercel-signature': vercelSignature ? 'present' : null,
      'x-vercel-id': vercelId,
      'user-agent': userAgent.substring(0, 50),
      'authorization': authHeader ? `${authHeader.substring(0, 30)}...` : 'none',
    }
    console.log('🔍 All request headers:', allHeaders)
    
    if (cronSecret) {
      // Allow if: Vercel cron header present OR Vercel direct auth OR Bearer token (manual)
      if (!isVercelCron && !isVercelDirectAuth && !hasBearerAuth) {
        console.error('❌ Unauthorized cron request')
        console.error('   Received auth header:', authHeader ? `"${authHeader}"` : 'none')
        console.error('   Expected (direct):', cronSecret ? `"${cronSecret}"` : 'none')
        console.error('   Expected (Bearer for manual):', expectedBearerHeader ? `"${expectedBearerHeader}"` : 'none')
        console.error('   Is Vercel cron:', isVercelCron)
        console.error('   Vercel headers:', allHeaders)
        console.error('   For manual testing, use: Authorization: Bearer <CRON_SECRET>')
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unauthorized. Use Authorization: Bearer <CRON_SECRET> header for manual testing' 
          },
          { status: 401 }
        )
      }
      
      if (isVercelCron) {
        console.log('✅ Vercel cron request detected')
      } else if (isVercelDirectAuth) {
        console.log('✅ Vercel direct auth matches')
      } else if (hasBearerAuth) {
        console.log('✅ Bearer token auth matches (manual test)')
      }
    } else {
      // No CRON_SECRET set - allow all requests (not recommended for production)
      console.warn('⚠️  No CRON_SECRET set - allowing request (should set CRON_SECRET in production)')
      if (isVercelCron) {
        console.log('✅ Vercel cron request detected')
      }
    }

    console.log('🔄 Starting daily price update...')
    
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
      
      await saveDynamicPrices({
        electricity: tomorrowPrices.electricity,
        gas: tomorrowPrices.gas,
        source: tomorrowPrices.source,
        date: tomorrowStr,
      })
      
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
        
        await saveDynamicPrices({
          electricity: todayPrices.electricity,
          gas: todayPrices.gas,
          source: todayPrices.source,
          date: todayStr,
        })
        
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
