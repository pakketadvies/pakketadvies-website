import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * API endpoint om debug logs te ontvangen en op te slaan
 * Gebruikt voor debugging mobiele contract viewer problemen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, message, data, url, userAgent, timestamp } = body

    // Use service role key to write logs
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [debug-logs] SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ success: false, error: 'Server not configured' }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Store log in database
    const { error } = await supabase
      .from('debug_logs')
      .insert({
        level: level || 'info',
        message: message || 'No message',
        data: data || {},
        url: url || 'Unknown',
        user_agent: userAgent || 'Unknown',
        timestamp: timestamp || new Date().toISOString(),
      })

    if (error) {
      console.error('❌ [debug-logs] Error storing log:', error)
      // Don't fail the request - logging is non-critical
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ [debug-logs] Unexpected error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

