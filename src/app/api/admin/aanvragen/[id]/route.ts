import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/aanvragen/[id]
 * Get single aanvraag details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: aanvraag, error } = await supabase
      .from('contractaanvragen')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('id', id)
      .single()

    if (error || !aanvraag) {
      return NextResponse.json(
        { error: 'Aanvraag niet gevonden' },
        { status: 404 }
      )
    }

    return NextResponse.json(aanvraag)
  } catch (error: any) {
    console.error('Error fetching aanvraag:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

