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
    
    if (isExact8Digits) {
      // Direct lookup via basisprofielen endpoint (dit werkt!)
      console.log(`[KVK Search] Exact 8 digits - direct lookup`)
      const kvkUrl = `https://api.kvk.nl/api/v1/basisprofielen/${query}`
      console.log(`[KVK Search] URL: ${kvkUrl}`)
      
      const response = await fetch(kvkUrl, {
        headers: {
          'apikey': apiKey,
        },
      })

      console.log(`[KVK Search] Response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`[KVK Search] Success - found: ${data.naam}`)
        
        // Transform to search result format
        const hoofdvestiging = data._embedded?.hoofdvestiging
        const bezoekadres = hoofdvestiging?.adressen?.find((a: any) => a.type === 'bezoekadres')
        
        const result = {
          kvkNummer: data.kvkNummer,
          bedrijfsnaam: data.naam,
          plaats: bezoekadres?.plaats || '',
          adres: bezoekadres?.volledigAdres || '',
        }
        
        return NextResponse.json({
          results: [result],
          total: 1,
        })
      } else if (response.status === 404) {
        console.log(`[KVK Search] KvK nummer niet gevonden`)
        return NextResponse.json({
          results: [],
          total: 0,
        })
      } else {
        const errorText = await response.text()
        console.error('[KVK Search] API error:', response.status, errorText)
        return NextResponse.json({
          results: [],
          total: 0,
          message: 'Kon bedrijf niet vinden'
        })
      }
    } else {
      // Voor partial KvK nummers of bedrijfsnamen: geen search endpoint beschikbaar
      console.log(`[KVK Search] Partial query - search endpoint not available`)
      return NextResponse.json({
        results: [],
        total: 0,
        message: 'Voer volledig KvK-nummer in (8 cijfers) of vul handmatig je bedrijfsnaam in'
      })
    }
  } catch (error) {
    console.error('[KVK Search] Exception:', error)
    console.error('[KVK Search] Exception details:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({
      results: [],
      total: 0,
      message: 'Er ging iets mis bij het zoeken. Vul je KvK-nummer volledig in (8 cijfers) of ga handmatig verder.'
    })
  }
}
