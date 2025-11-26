import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContractAanvraag } from '@/types/aanvragen'

/**
 * GET /api/aanvragen
 * 
 * Fetches all contractaanvragen with optional filters
 * Query params: status, aanvraag_type, leverancier_id, limit, offset
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const aanvraagType = searchParams.get('aanvraag_type')
    const leverancierId = searchParams.get('leverancier_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') // Search in aanvraagnummer, naam, email

    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check admin role (you might need to adjust this based on your auth setup)
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    // For now, we'll allow if user is authenticated (you can add role check later)
    
    let query = supabase
      .from('contractaanvragen')
      .select(`
        *,
        contract:contracten(id, naam, type),
        leverancier:leveranciers(id, naam, logo_url)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }
    if (aanvraagType) {
      query = query.eq('aanvraag_type', aanvraagType)
    }
    if (leverancierId) {
      query = query.eq('leverancier_id', leverancierId)
    }
    if (search) {
      // Search in aanvraagnummer, gegevens_data (email, naam), etc.
      query = query.or(`aanvraagnummer.ilike.%${search}%,gegevens_data->>email.ilike.%${search}%,gegevens_data->>bedrijfsnaam.ilike.%${search}%,gegevens_data->>achternaam.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching aanvragen:', error)
      return NextResponse.json(
        { error: 'Fout bij ophalen aanvragen: ' + error.message },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('contractaanvragen')
      .select('*', { count: 'exact', head: true })

    if (status) {
      countQuery = countQuery.eq('status', status)
    }
    if (aanvraagType) {
      countQuery = countQuery.eq('aanvraag_type', aanvraagType)
    }
    if (leverancierId) {
      countQuery = countQuery.eq('leverancier_id', leverancierId)
    }
    if (search) {
      countQuery = countQuery.or(`aanvraagnummer.ilike.%${search}%,gegevens_data->>email.ilike.%${search}%,gegevens_data->>bedrijfsnaam.ilike.%${search}%,gegevens_data->>achternaam.ilike.%${search}%`)
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      aanvragen: data as ContractAanvraag[],
      total: totalCount || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Unexpected error in GET aanvragen:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

