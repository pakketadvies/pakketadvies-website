import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getModelTarieven } from '@/lib/energie-berekening'

// Disable caching to ensure we always get the latest model tariffs
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/model-tarieven
 * 
 * Returns active Eneco modeltarieven from Supabase
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const modelTarieven = await getModelTarieven(supabase)
    
    if (!modelTarieven) {
      return NextResponse.json(
        { success: false, error: 'Geen modeltarieven gevonden' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      tarieven: modelTarieven,
    })
  } catch (error: any) {
    console.error('Error fetching model tarieven:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Fout bij ophalen modeltarieven' },
      { status: 500 }
    )
  }
}


