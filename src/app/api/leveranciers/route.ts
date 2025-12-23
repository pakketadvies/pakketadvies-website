import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get all active leveranciers, ordered by volgorde and then naam
    const { data: leveranciers, error } = await supabase
      .from('leveranciers')
      .select('id, naam')
      .eq('actief', true)
      .order('volgorde', { ascending: true })
      .order('naam', { ascending: true })

    if (error) {
      console.error('Error fetching leveranciers:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ leveranciers: leveranciers || [] })
  } catch (error: any) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van leveranciers' },
      { status: 500 }
    )
  }
}

