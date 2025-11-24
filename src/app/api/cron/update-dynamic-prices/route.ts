import { NextResponse } from 'next/server'
import { fetchDayAheadPrices } from '@/lib/dynamic-pricing/api-client'
import { saveDynamicPrices } from '@/lib/dynamic-pricing/database'

/**
 * Vercel Cron Job: Update Dynamic Energy Prices
 * 
 * Runs daily at 14:00 CET (after day-ahead auction closes at 12:00)
 * 
 * Security: Vercel Cron authentication via Authorization header
 * 
 * Manual trigger for testing:
 * curl -X GET https://your-domain.com/api/cron/update-dynamic-prices \
 *   -H "Authorization: Bearer YOUR_CRON_SECRET"
 */
export async function GET(request: Request) {
  try {
    // ============================================
    // STEP 1: VERIFY CRON AUTHENTICATION
    // ============================================
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // In production, Vercel automatically adds this header
    // For manual testing, you need to provide it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔄 Starting dynamic prices update...')

    // ============================================
    // STEP 2: FETCH TODAY'S PRICES
    // ============================================
    const today = new Date()
    const todayPrices = await fetchDayAheadPrices(today)

    console.log('📊 Today prices fetched:', {
      date: todayPrices.date,
      source: todayPrices.source,
      electricity: todayPrices.electricity.average.toFixed(5),
      gas: todayPrices.gas.average.toFixed(5),
    })

    // ============================================
    // STEP 3: SAVE TO DATABASE
    // ============================================
    await saveDynamicPrices(todayPrices)

    // ============================================
    // STEP 4: ALSO FETCH TOMORROW'S PRICES (if available)
    // ============================================
    // Day-ahead auction is at 12:00, results at 13:00
    // So at 14:00 we should have tomorrow's prices
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    try {
      const tomorrowPrices = await fetchDayAheadPrices(tomorrow)
      
      console.log('📊 Tomorrow prices fetched:', {
        date: tomorrowPrices.date,
        source: tomorrowPrices.source,
        electricity: tomorrowPrices.electricity.average.toFixed(5),
        gas: tomorrowPrices.gas.average.toFixed(5),
      })

      await saveDynamicPrices(tomorrowPrices)
    } catch (error) {
      console.warn('⚠️ Tomorrow prices not yet available (this is normal before 13:00)', error)
      // Not a critical error, continue
    }

    // ============================================
    // STEP 5: CLEANUP OLD DATA (keep last 90 days)
    // ============================================
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { error: deleteError } = await supabase
      .from('dynamic_prices')
      .delete()
      .lt('datum', ninetyDaysAgo.toISOString().split('T')[0])

    if (deleteError) {
      console.warn('⚠️ Failed to cleanup old prices:', deleteError)
      // Not critical, continue
    } else {
      console.log('🧹 Old prices cleaned up (> 90 days)')
    }

    // ============================================
    // STEP 6: RETURN SUCCESS
    // ============================================
    return NextResponse.json({
      success: true,
      message: 'Dynamic prices updated successfully',
      today: {
        date: todayPrices.date,
        source: todayPrices.source,
        electricity: todayPrices.electricity.average,
        gas: todayPrices.gas.average,
      },
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Cron job failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, {
      status: 500
    })
  }
}

/**
 * POST endpoint for manual triggering (same logic as GET)
 */
export async function POST(request: Request) {
  return GET(request)
}

