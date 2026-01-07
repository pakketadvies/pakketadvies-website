import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API route om GridHub logs op te halen en op te slaan
 */

// GET: Haal GridHub logs op
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if filtering by aanvraag_id
    const { searchParams } = new URL(request.url)
    const aanvraagId = searchParams.get('aanvraag_id')

    let query = supabase
      .from('gridhub_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (aanvraagId) {
      query = query.eq('aanvraag_id', aanvraagId)
    } else {
      query = query.limit(50)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error('Error fetching GridHub logs:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, logs: logs || [] })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Sla GridHub log op
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { level, message, data, context } = body

    const supabase = await createClient()

    // Extract aanvraag_id from context if available
    const aanvraagId = context?.aanvraagId || null

    // Insert log (no auth required for logging, but we'll validate the data)
    const { data: log, error } = await supabase
      .from('gridhub_logs')
      .insert({
        level: level || 'info',
        message: message || '',
        data: data || {},
        context: context || {},
        aanvraag_id: aanvraagId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving GridHub log:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, log })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

