import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const postcode = searchParams.get('postcode')
  const number = searchParams.get('number')

  if (!postcode || !number) {
    return NextResponse.json(
      { error: 'Postcode en huisnummer zijn verplicht' },
      { status: 400 }
    )
  }

  const apiKey = process.env.POSTCODE_API_KEY

  if (!apiKey) {
    console.error('POSTCODE_API_KEY not configured')
    // Return success but with empty data so user can continue
    return NextResponse.json({
      street: '',
      city: '',
      error: 'Adres lookup tijdelijk niet beschikbaar'
    })
  }

  try {
    const response = await fetch(
      `https://postcode.tech/api/v1/postcode?postcode=${postcode}&number=${number}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Adres niet gevonden' },
          { status: 404 }
        )
      }
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json({
      street: data.street || '',
      city: data.city || '',
      municipality: data.municipality || '',
      province: data.province || '',
    })
  } catch (error) {
    console.error('Postcode API error:', error)
    // Return success but with empty data so user can continue
    return NextResponse.json({
      street: '',
      city: '',
      error: 'Kon adres niet ophalen. Je kunt wel doorgaan.'
    })
  }
}


