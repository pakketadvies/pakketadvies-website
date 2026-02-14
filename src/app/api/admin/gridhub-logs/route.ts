import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiError, apiSuccess, getErrorMessage } from '@/lib/api/response'
import { parseJsonBody } from '@/lib/api/validation'

/**
 * API route om GridHub logs op te halen en op te slaan
 */

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase }
}

const gridHubLogBodySchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  message: z.string().trim().min(1, 'Bericht is verplicht'),
  data: z.record(z.string(), z.unknown()).optional(),
  context: z
    .object({
      aanvraagId: z.string().optional(),
    })
    .passthrough()
    .optional(),
})

// GET: Haal GridHub logs op
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('errorResponse' in auth) {
      return auth.errorResponse
    }
    const { supabase } = auth

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
      return apiError(error.message, 500)
    }

    return apiSuccess({ logs: logs || [] })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return apiError(getErrorMessage(error), 500)
  }
}

// POST: Sla GridHub log op
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ('errorResponse' in auth) {
      return auth.errorResponse
    }
    const { supabase } = auth

    const bodyResult = await parseJsonBody(request, gridHubLogBodySchema)
    if (!bodyResult.success) {
      return apiError(bodyResult.error, 400)
    }
    const { level, message, data, context } = bodyResult.data

    // Extract aanvraag_id from context if available
    const aanvraagId = context?.aanvraagId || null

    // Insert log
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
      return apiError(error.message, 500)
    }

    return apiSuccess({ log })
  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    return apiError(getErrorMessage(error), 500)
  }
}

