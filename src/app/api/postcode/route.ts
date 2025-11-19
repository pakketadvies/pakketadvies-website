import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postcode = searchParams.get('postcode')
  const number = searchParams.get('number')
  const addition = searchParams.get('addition') // Toevoeging (optioneel)

  if (!postcode || !number) {
    return NextResponse.json(
      { error: 'Postcode en huisnummer zijn verplicht' },
      { status: 400 }
    )
  }

  // Clean postcode: remove all spaces and make uppercase
  const postcodeClean = postcode.toUpperCase().replace(/\s/g, '')
  
  // Validate Dutch postcode format (4 digits + 2 letters)
  if (!/^\d{4}[A-Z]{2}$/.test(postcodeClean)) {
    return NextResponse.json(
      { error: 'Ongeldige postcode formaat' },
      { status: 400 }
    )
  }

  const apiKey = process.env.POSTCODE_API_KEY

  if (!apiKey) {
    console.error('POSTCODE_API_KEY not configured')
    return NextResponse.json({
      street: '',
      city: '',
      error: 'Adres lookup tijdelijk niet beschikbaar'
    })
  }

  try {
    // Bouw URL met optionele toevoeging
    let url = `https://postcode.tech/api/v1/postcode?postcode=${encodeURIComponent(postcodeClean)}&number=${encodeURIComponent(number)}`
    if (addition && addition.trim()) {
      url += `&addition=${encodeURIComponent(addition.trim())}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Adres niet gevonden' },
          { status: 404 }
        )
      }
      console.error(`Postcode API error: ${response.status}`)
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Return het adres zonder waarschuwing
    // De postcode.tech API kan toevoegingen niet verifiëren, maar als het basisadres
    // bestaat accepteren we de toevoeging die de gebruiker invult
    return NextResponse.json({
      street: data.street || '',
      city: data.city || '',
      municipality: data.municipality || '',
      province: data.province || '',
    })
  } catch (error) {
    console.error('Postcode API exception:', error)
    return NextResponse.json({
      street: '',
      city: '',
      error: 'Kon adres niet ophalen. Je kunt wel doorgaan.'
    })
  }
}


