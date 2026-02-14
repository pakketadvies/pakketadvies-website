import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIP } from '@/lib/security/rate-limiter'
import { apiError, apiSuccess, getErrorMessage } from '@/lib/api/response'

/**
 * API route om contract viewer token op te halen voor client-side redirect
 * Gebruikt als fallback wanneer server-side redirect niet werkt (bijv. op mobiel)
 */
export async function GET(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP, 20, 15 * 60 * 1000) // 20 requests per 15 minuten
    if (!rateLimit.allowed) {
      return apiError(rateLimit.error || 'Te veel aanvragen', 429)
    }

    const searchParams = request.nextUrl.searchParams
    const aanvraagnummer = searchParams.get('aanvraagnummer')

    if (!aanvraagnummer) {
      return apiError('Aanvraagnummer ontbreekt', 400)
    }

    const normalizedAanvraagnummer = aanvraagnummer.trim().toUpperCase()
    if (!/^PA-\d{4}-[A-Z0-9]+$/.test(normalizedAanvraagnummer)) {
      return apiError('Ongeldig aanvraagnummer formaat', 400)
    }

    const supabase = await createClient()

    // Fetch aanvraag by aanvraagnummer
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select('id')
      .eq('aanvraagnummer', normalizedAanvraagnummer)
      .single()

    if (aanvraagError || !aanvraag) {
      return apiError('Aanvraag niet gevonden', 404)
    }

    // Fetch latest valid access token
    const { data: accessData, error: accessError } = await supabase
      .from('contract_viewer_access')
      .select('access_token')
      .eq('aanvraag_id', aanvraag.id)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (accessError) {
      console.error('❌ [contract-viewer-token] Error fetching access token:', accessError)
      return apiError('Fout bij ophalen token', 500)
    }

    if (!accessData?.access_token) {
      return apiError('Geen geldig token gevonden', 404)
    }

    return apiSuccess({
      token: accessData.access_token,
    })
  } catch (error: unknown) {
    console.error('❌ [contract-viewer-token] Unexpected error:', error)
    return apiError(getErrorMessage(error, 'Onbekende fout'), 500)
  }
}

