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

    const apiKey = process.env.KVK_API_KEY
    if (!apiKey) {
      console.error('KVK_API_KEY niet geconfigureerd')
      return NextResponse.json(
        { error: 'KvK API niet beschikbaar' },
        { status: 500 }
      )
    }

    // Zoek bedrijven via KvK Zoeken API
    const response = await fetch(
      `https://api.kvk.nl/api/v1/zoeken?naam=${encodeURIComponent(query)}&pagina=1&resultatenPerPagina=10`,
      {
        headers: {
          'apikey': apiKey,
        },
      }
    )

    if (!response.ok) {
      console.error('KvK API error:', response.status, await response.text())
      return NextResponse.json(
        { error: 'Kon niet zoeken in KvK register' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Transformeer KvK data naar ons formaat
    const results = data.resultaten?.map((item: any) => ({
      kvkNummer: item.kvkNummer,
      bedrijfsnaam: item.handelsnaam || item.naam,
      plaats: item.plaats,
      adres: item.adres ? `${item.adres.straatnaam} ${item.adres.huisnummer}, ${item.adres.plaats}` : '',
    })) || []

    return NextResponse.json({
      results,
      total: data.totaal || 0,
    })
  } catch (error) {
    console.error('KvK search error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het zoeken' },
      { status: 500 }
    )
  }
}
