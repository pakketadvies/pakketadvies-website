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

  const apiKey = process.env.KVK_API_KEY

  if (!apiKey) {
    console.error('KVK_API_KEY not configured')
    return NextResponse.json(
      { error: 'KvK API niet geconfigureerd', results: [] },
      { status: 500 }
    )
  }

  try {
    // Use Official KvK Zoeken API
    const response = await fetch(
      `https://api.kvk.nl/api/v1/zoeken?naam=${encodeURIComponent(query)}&pagina=1&aantal=10`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Return formatted results for autocomplete
    const results = (data.resultaten || []).slice(0, 10).map((item: any) => ({
      kvkNummer: item.kvkNummer,
      bedrijfsnaam: item.naam || item.handelsnaam,
      plaats: item.plaats,
      adres: item.adres || `${item.straatnaam || ''} ${item.huisnummer || ''}`.trim(),
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

