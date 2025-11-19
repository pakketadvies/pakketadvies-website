import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const kvkNummer = searchParams.get('kvk')

  if (!kvkNummer) {
    return NextResponse.json(
      { error: 'KvK-nummer is verplicht' },
      { status: 400 }
    )
  }

  // Validate KvK number format (8 digits)
  const kvkClean = kvkNummer.replace(/\s/g, '')
  if (!/^\d{8}$/.test(kvkClean)) {
    return NextResponse.json(
      { error: 'Ongeldig KvK-nummer. Moet 8 cijfers bevatten.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.KVK_API_KEY

  if (!apiKey) {
    console.error('[KVK Lookup] KVK_API_KEY not configured')
    return NextResponse.json(
      { error: 'KvK API niet geconfigureerd. Vul handmatig je bedrijfsgegevens in.' },
      { status: 503 }
    )
  }

  try {
    console.log(`[KVK Lookup] Opzoeken KvK: ${kvkClean}`)
    
    // Use Official KvK API
    const kvkUrl = `https://api.kvk.nl/api/v1/basisprofielen/${kvkClean}`
    console.log(`[KVK Lookup] URL: ${kvkUrl}`)
    
    const response = await fetch(kvkUrl, {
      headers: {
        'apikey': apiKey,
      },
    })

    console.log(`[KVK Lookup] Response status: ${response.status}`)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Bedrijf niet gevonden. Controleer het KvK-nummer.' },
          { status: 404 }
        )
      }
      
      const errorText = await response.text()
      console.error(`[KVK Lookup] API error:`, response.status, errorText)
      
      return NextResponse.json(
        { error: `KvK API fout (${response.status}). Vul handmatig je gegevens in.` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(`[KVK Lookup] Success: ${data.naam}`)
    
    // Extract address from hoofdvestiging
    const hoofdvestiging = data._embedded?.hoofdvestiging
    const bezoekadres = hoofdvestiging?.adressen?.find((a: any) => a.type === 'bezoekadres')
    
    // Extract relevant data from KvK API response
    const bedrijfsgegevens = {
      bedrijfsnaam: data.naam || '',
      kvkNummer: kvkClean,
      correspondentieAdres: bezoekadres ? {
        straat: bezoekadres.straatnaam || '',
        huisnummer: bezoekadres.huisnummer?.toString() || '',
        postcode: bezoekadres.postcode || '',
        plaats: bezoekadres.plaats || '',
        volledigAdres: bezoekadres.volledigAdres || '',
      } : null,
      rechtsvorm: data._embedded?.eigenaar?.rechtsvorm || '',
      sbiCode: data.sbiActiviteiten?.[0]?.sbiCode || '',
      sbiOmschrijving: data.sbiActiviteiten?.[0]?.sbiOmschrijving || '',
      websites: hoofdvestiging?.websites || [],
    }

    return NextResponse.json(bedrijfsgegevens)
  } catch (error) {
    console.error('[KVK Lookup] Exception:', error)
    return NextResponse.json(
      { 
        error: 'Kon bedrijfsgegevens niet ophalen. Vul handmatig je gegevens in.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
