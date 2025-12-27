import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * API route om contract viewer token op te halen voor client-side redirect
 * Gebruikt als fallback wanneer server-side redirect niet werkt (bijv. op mobiel)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const aanvraagnummer = searchParams.get('aanvraagnummer')

    if (!aanvraagnummer) {
      return NextResponse.json(
        { error: 'Aanvraagnummer ontbreekt' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch aanvraag by aanvraagnummer
    const { data: aanvraag, error: aanvraagError } = await supabase
      .from('contractaanvragen')
      .select('id')
      .eq('aanvraagnummer', aanvraagnummer)
      .single()

    if (aanvraagError || !aanvraag) {
      return NextResponse.json(
        { error: 'Aanvraag niet gevonden' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Fout bij ophalen token' },
        { status: 500 }
      )
    }

    if (!accessData?.access_token) {
      return NextResponse.json(
        { error: 'Geen geldig token gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      token: accessData.access_token,
    })
  } catch (error: any) {
    console.error('❌ [contract-viewer-token] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Onbekende fout' },
      { status: 500 }
    )
  }
}

