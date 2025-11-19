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
      // Return empty results instead of error - form blijft bruikbaar
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'KvK zoeken tijdelijk niet beschikbaar'
      })
    }

    console.log(`[KVK Search] Zoeken naar: "${query}"`)

    // Check if query is numeric (KvK nummer) or text (bedrijfsnaam)
    const isNumeric = /^\d+$/.test(query)
    
    // Build KvK API URL - gebruik kvkNummer param voor cijfers, naam voor tekst
    const kvkUrl = isNumeric 
      ? `https://api.kvk.nl/api/v1/zoeken?kvkNummer=${encodeURIComponent(query)}*&pagina=1&resultatenPerPagina=10`
      : `https://api.kvk.nl/api/v1/zoeken?naam=${encodeURIComponent(query)}&pagina=1&resultatenPerPagina=10`
    
    console.log(`[KVK Search] Type: ${isNumeric ? 'KvK nummer' : 'bedrijfsnaam'}`)
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
      
      // Return empty results instead of error - form blijft bruikbaar
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Geen resultaten gevonden of KvK API tijdelijk niet beschikbaar'
      })
    }

    const data = await response.json()
    console.log(`[KVK Search] Found ${data.totaal || 0} results`)
    console.log(`[KVK Search] Raw data:`, JSON.stringify(data, null, 2))

    // Transformeer KvK data naar ons formaat
    const results = data.resultaten?.map((item: any) => ({
      kvkNummer: item.kvkNummer,
      bedrijfsnaam: item.handelsnaam || item.naam,
      plaats: item.plaats,
      adres: item.adres ? `${item.adres.straatnaam} ${item.adres.huisnummer}, ${item.adres.plaats}` : '',
    })) || []

    console.log(`[KVK Search] Transformed results:`, results)

    return NextResponse.json({
      results,
      total: data.totaal || 0,
    })
  } catch (error) {
    console.error('[KVK Search] Exception:', error)
    console.error('[KVK Search] Exception details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('[KVK Search] Exception stack:', error instanceof Error ? error.stack : '')
    // Return empty results instead of error - form blijft bruikbaar
    return NextResponse.json({
      results: [],
      total: 0,
      message: 'Er ging iets mis bij het zoeken. Je kunt handmatig verder gaan.'
    })
  }
}
