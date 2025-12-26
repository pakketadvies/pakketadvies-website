import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendReviewRequestEmail } from '@/lib/send-review-email-internal'

/**
 * Cron job to send review request emails
 * Runs daily and checks for contracts that were activated 1 week ago
 * 
 * GET /api/cron/send-review-emails
 * Protected by Vercel Cron secret
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret (Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('⏰ [cron/send-review-emails] Starting review email cron job...')

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Find aanvragen that:
    // 1. Status is 'afgehandeld' (contract is active)
    // 2. Review email not yet sent
    // 3. Review not yet given
    // 4. Updated_at (or created_at if no updated_at) is exactly 7 days ago (±1 day tolerance)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoStart = new Date(oneWeekAgo)
    oneWeekAgoStart.setHours(0, 0, 0, 0)
    const oneWeekAgoEnd = new Date(oneWeekAgo)
    oneWeekAgoEnd.setHours(23, 59, 59, 999)

    // Also check 6-8 days ago for tolerance
    const sixDaysAgo = new Date()
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6)
    const eightDaysAgo = new Date()
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

    console.log('⏰ [cron/send-review-emails] Looking for aanvragen from:', {
      sixDaysAgo: sixDaysAgo.toISOString(),
      oneWeekAgo: oneWeekAgo.toISOString(),
      eightDaysAgo: eightDaysAgo.toISOString(),
    })

    // Query: status = afgehandeld, review_email_verzonden = false, review_gegeven = false
    // And updated_at is between 6-8 days ago
    const { data: aanvragen, error: queryError } = await supabase
      .from('contractaanvragen')
      .select('id, aanvraagnummer, email, updated_at, status')
      .eq('status', 'afgehandeld')
      .eq('review_email_verzonden', false)
      .eq('review_gegeven', false)
      .gte('updated_at', eightDaysAgo.toISOString())
      .lte('updated_at', sixDaysAgo.toISOString())

    if (queryError) {
      console.error('❌ [cron/send-review-emails] Error querying aanvragen:', queryError)
      throw new Error(`Database query failed: ${queryError.message}`)
    }

    if (!aanvragen || aanvragen.length === 0) {
      console.log('✅ [cron/send-review-emails] No aanvragen found for review emails')
      return NextResponse.json({
        success: true,
        message: 'No aanvragen found for review emails',
        count: 0,
      })
    }

    console.log(`📧 [cron/send-review-emails] Found ${aanvragen.length} aanvragen for review emails`)

    // Send review emails
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[],
    }

    for (const aanvraag of aanvragen) {
      try {
        console.log(`📧 [cron/send-review-emails] Processing aanvraag: ${aanvraag.aanvraagnummer}`)
        const result = await sendReviewRequestEmail(aanvraag.id)

        if (result.success) {
          results.success++
          console.log(`✅ [cron/send-review-emails] Review email sent for: ${aanvraag.aanvraagnummer}`)
        } else {
          results.skipped++
          console.log(`⚠️ [cron/send-review-emails] Skipped aanvraag ${aanvraag.aanvraagnummer}: ${result.message}`)
        }
      } catch (error: any) {
        results.failed++
        results.errors.push(`${aanvraag.aanvraagnummer}: ${error.message}`)
        console.error(`❌ [cron/send-review-emails] Error sending review email for ${aanvraag.aanvraagnummer}:`, error.message)
      }
    }

    console.log(`✅ [cron/send-review-emails] Cron job completed:`, results)

    return NextResponse.json({
      success: true,
      message: 'Review email cron job completed',
      results,
    })
  } catch (error: any) {
    console.error('❌ [cron/send-review-emails] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Cron job failed',
      },
      { status: 500 }
    )
  }
}

