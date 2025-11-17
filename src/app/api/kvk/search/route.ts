import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query moet minimaal 2 karakters bevatten' },
      { status: 400 }
    )
  }

  try {
    // Use OpenKVK search API
    const response = await fetch(
      `https://openkvk.nl/api/v1/search.json?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'PakketAdvies/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Return max 10 results, formatted for autocomplete
    const results = (data.results?.data || []).slice(0, 10).map((item: any) => ({
      kvkNummer: item.dossiernummer || item.kvkNummer,
      bedrijfsnaam: item.handelsnaam || item.naam,
      plaats: item.plaats,
      adres: item.adres,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('KvK search API error:', error)
    return NextResponse.json(
      { 
        error: 'Kon bedrijven niet zoeken. Probeer het later opnieuw.',
        results: []
      },
      { status: 500 }
    )
  }
}

