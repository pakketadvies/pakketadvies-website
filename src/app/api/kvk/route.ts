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
    console.error('KVK_API_KEY not configured')
    return NextResponse.json(
      { error: 'KvK API niet geconfigureerd' },
      { status: 500 }
    )
  }

  try {
    // Use Official KvK API
    const response = await fetch(
      `https://api.kvk.nl/api/v1/basisprofielen/${kvkClean}`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Bedrijf niet gevonden. Controleer het KvK-nummer.' },
          { status: 404 }
        )
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract relevant data from KvK API response
    const bedrijfsgegevens = {
      bedrijfsnaam: data.naam || data.handelsnaam || '',
      kvkNummer: kvkClean,
      adres: {
        straat: data.straatnaam || '',
        huisnummer: data.huisnummer || '',
        postcode: data.postcode || '',
        plaats: data.plaats || '',
      },
      vestigingsAdres: data.adres || '',
      rechtsvorm: data.rechtsvorm || '',
      sbiCode: data.sbiActiviteiten?.[0]?.sbiCode || '',
      sbiOmschrijving: data.sbiActiviteiten?.[0]?.sbiOmschrijving || '',
      website: data.websites?.[0] || '',
    }

    return NextResponse.json(bedrijfsgegevens)
  } catch (error) {
    console.error('KvK API error:', error)
    return NextResponse.json(
      { 
        error: 'Kon bedrijfsgegevens niet ophalen. Probeer het later opnieuw.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

