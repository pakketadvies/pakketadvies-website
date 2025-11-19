import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query moet minimaal 2 karakters bevatten' },
        { status: 400 }
      )
    }

    const apiKey = process.env.KVK_API_KEY?.trim()
    if (!apiKey) {
      console.error('[KVK Search] KVK_API_KEY niet geconfigureerd')
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'KvK zoeken tijdelijk niet beschikbaar'
      })
    }

    console.log(`[KVK Search] Zoeken naar: "${query}"`)

    // Check if query is exactly 8 digits (volledig KvK nummer)
    const isExact8Digits = /^\d{8}$/.test(query)
    
    // Build V2 API URL - naam voor bedrijfsnamen, kvkNummer voor volledige nummers
    const kvkUrl = isExact8Digits
      ? `https://api.kvk.nl/api/v2/zoeken?kvkNummer=${encodeURIComponent(query)}`
      : `https://api.kvk.nl/api/v2/zoeken?naam=${encodeURIComponent(query)}`
    
    console.log(`[KVK Search] Type: ${isExact8Digits ? 'KvK nummer' : 'bedrijfsnaam'}`)
    console.log(`[KVK Search] URL: ${kvkUrl}`)
    
    const response = await fetch(kvkUrl, {
      headers: {
        'apikey': apiKey,
      },
    })

    console.log(`[KVK Search] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[KVK Search] API error:', response.status, errorText)
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Kon geen resultaten vinden'
      })
    }

    const data = await response.json()
    console.log(`[KVK Search] Found ${data.totaal || 0} results`)

    // Check for API errors
    if (data.fout) {
      console.error('[KVK Search] API fout:', data.fout)
      return NextResponse.json({
        results: [],
        total: 0,
        message: data.fout[0]?.omschrijving || 'Er ging iets mis'
      })
    }

    // Transform V2 data to our format
    const results = data.resultaten?.map((item: any) => {
      const adres = item.adres?.binnenlandsAdres || item.adres?.buitenlandsAdres
      return {
        kvkNummer: item.kvkNummer,
        bedrijfsnaam: item.naam,
        plaats: adres?.plaats || '',
        adres: adres ? `${adres.straatnaam || ''} ${adres.huisnummer || ''}, ${adres.plaats || ''}`.trim() : '',
      }
    }) || []

    console.log(`[KVK Search] Transformed results:`, results)

    return NextResponse.json({
      results,
      total: data.totaal || 0,
    })
  } catch (error) {
    console.error('[KVK Search] Exception:', error)
    console.error('[KVK Search] Exception details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({
      results: [],
      total: 0,
      message: 'Er ging iets mis bij het zoeken. Je kunt handmatig verder gaan.'
    })
  }
}
