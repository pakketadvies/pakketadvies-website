import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ContractAanvraag } from '@/types/aanvragen'

/**
 * GET /api/aanvragen/[id]
 * 
 * Fetches a single contractaanvraag by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('contractaanvragen')
      .select(`
        *,
        contract:contracten(id, naam, type),
        leverancier:leveranciers(id, naam, logo_url)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Aanvraag niet gevonden' },
          { status: 404 }
        )
      }
      console.error('Error fetching aanvraag:', error)
      return NextResponse.json(
        { error: 'Fout bij ophalen aanvraag: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data as ContractAanvraag)
  } catch (error: any) {
    console.error('Unexpected error in GET aanvraag:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/aanvragen/[id]
 * 
 * Updates a contractaanvraag (status, admin_notities, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    
    if (body.status) {
      updateData.status = body.status
      if (body.status === 'afgehandeld') {
        updateData.afgehandeld_op = new Date().toISOString()
        updateData.afgehandeld_door = user.id
      }
    }
    if (body.admin_notities !== undefined) {
      updateData.admin_notities = body.admin_notities
    }

    const { data, error } = await supabase
      .from('contractaanvragen')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating aanvraag:', error)
      return NextResponse.json(
        { error: 'Fout bij updaten aanvraag: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data as ContractAanvraag)
  } catch (error: any) {
    console.error('Unexpected error in PATCH aanvraag:', error)
    return NextResponse.json(
      { error: 'Onverwachte fout: ' + (error.message || 'Unknown error') },
      { status: 500 }
    )
  }
}

