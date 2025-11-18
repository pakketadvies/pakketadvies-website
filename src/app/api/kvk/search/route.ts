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
    // Use Official KvK Zoeken API v2
    // Documentation: https://developers.kvk.nl/nl/documentation/zoeken-api
    const response = await fetch(
      `https://api.kvk.nl/api/v2/zoeken?naam=${encodeURIComponent(query)}`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`KvK API error ${response.status}:`, errorText)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // KvK API v2 returns: { resultaten: [...], totaal: X, pagina: Y }
    // Each result has: kvkNummer, vestigingsnummer, naam, adres: { binnenlandsAdres: { straatnaam, plaats } }
    const results = (data.resultaten || []).slice(0, 10).map((item: any) => {
      const straatnaam = item.adres?.binnenlandsAdres?.straatnaam || ''
      const plaats = item.adres?.binnenlandsAdres?.plaats || ''
      
      return {
        kvkNummer: item.kvkNummer || '',
        bedrijfsnaam: item.naam || '',
        plaats: plaats,
        adres: straatnaam ? `${straatnaam}, ${plaats}` : plaats,
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error('KvK search API error:', error)
    return NextResponse.json(
      { 
        error: 'Kon bedrijven niet zoeken. Probeer het later opnieuw.',
        results: [],
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

