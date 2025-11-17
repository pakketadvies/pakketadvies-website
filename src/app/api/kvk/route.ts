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

  try {
    // Use Overheid.io API (free, no key required)
    const response = await fetch(
      `https://openkvk.nl/api/v1/kvk/${kvkClean}.json`,
      {
        headers: {
          'User-Agent': 'PakketAdvies/1.0',
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
    
    // Extract relevant data
    const bedrijfsgegevens = {
      bedrijfsnaam: data.handelsnaam || data.naam || '',
      kvkNummer: kvkClean,
      adres: {
        straat: data.straat || '',
        huisnummer: data.huisnummer || '',
        postcode: data.postcode || '',
        plaats: data.plaats || '',
      },
      vestigingsAdres: data.adres || '',
      rechtsvorm: data.rechtsvorm || '',
      sbiCode: data.sbi_code || '',
      sbiOmschrijving: data.sbi_omschrijving || '',
      website: data.website || '',
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

