import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postcode = searchParams.get('postcode')

    if (!postcode) {
      return NextResponse.json(
        { error: 'Postcode is verplicht' },
        { status: 400 }
      )
    }

    // Normaliseer postcode (1234AB -> 1234AB)
    const normalizedPostcode = postcode.toUpperCase().replace(/\s/g, '')

    if (!/^[0-9]{4}[A-Z]{2}$/.test(normalizedPostcode)) {
      return NextResponse.json(
        { error: 'Ongeldige postcode format (verwacht: 1234AB)' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Zoek netbeheerder op basis van postcode range
    const { data, error } = await supabase
      .from('postcode_netbeheerders')
      .select(`
        *,
        netbeheerder:netbeheerders(*)
      `)
      .lte('postcode_van', normalizedPostcode)
      .gte('postcode_tot', normalizedPostcode)
      .single()

    if (error || !data) {
      // Fallback: gebruik Enexis als default voor nu
      const { data: enexis } = await supabase
        .from('netbeheerders')
        .select('*')
        .eq('code', 'ENEXIS')
        .single()

      return NextResponse.json({
        netbeheerder: enexis,
        warning: 'Geen specifieke netbeheerder gevonden voor deze postcode, Enexis gebruikt als fallback',
      })
    }

    return NextResponse.json({
      netbeheerder: data.netbeheerder,
      regio: data.regio_naam,
    })
  } catch (error: any) {
    console.error('Fout bij ophalen netbeheerder:', error)
    return NextResponse.json(
      { error: error.message || 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

