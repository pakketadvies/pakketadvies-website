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

  try {
    // Gebruik PDOK Locatieserver API (gratis, officieel, ondersteunt toevoegingen!)
    // Bouw exacte query voor verificatie
    let query = `postcode:${postcodeClean} AND huisnummer:${number}`
    
    if (addition && addition.trim()) {
      const trimmedAddition = addition.trim()
      // Check of toevoeging een enkele letter is (huisletter) of cijfer/combinatie (huisnummertoevoeging)
      if (/^[a-zA-Z]$/.test(trimmedAddition)) {
        // Enkele letter = huisletter
        query += ` AND huisletter:${trimmedAddition.toUpperCase()}`
      } else {
        // Cijfer of combinatie = huisnummertoevoeging
        query += ` AND huisnummertoevoeging:${encodeURIComponent(trimmedAddition)}`
      }
    }
    
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}&fq=type:adres&rows=1`
    
    const response = await fetch(url)

    if (!response.ok) {
      console.error(`PDOK API error: ${response.status}`)
      return NextResponse.json(
        { error: 'Kon adres niet ophalen' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Check of er resultaten zijn
    if (data.response.numFound === 0) {
      // Geen resultaten - check of het basisadres (zonder toevoeging) wel bestaat
      if (addition && addition.trim()) {
        const trimmedAddition = addition.trim()
        const baseQuery = `postcode:${postcodeClean} AND huisnummer:${number}`
        const baseUrl = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(baseQuery)}&fq=type:adres&rows=20`
        
        const baseResponse = await fetch(baseUrl)
        if (baseResponse.ok) {
          const baseData = await baseResponse.json()
          if (baseData.response.numFound > 0) {
            // Basisadres bestaat - zoek exacte match met toevoeging
            const matchingDoc = baseData.response.docs.find((doc: any) => {
              const docLetter = doc.huisletter?.toUpperCase()
              const docToevoeging = doc.huisnummertoevoeging
              
              if (/^[a-zA-Z]$/.test(trimmedAddition)) {
                // Check huisletter (case-insensitive)
                return docLetter === trimmedAddition.toUpperCase()
              } else {
                // Check huisnummertoevoeging (exact match)
                return docToevoeging === trimmedAddition
              }
            })
            
            if (matchingDoc) {
              // Match gevonden! Gebruik dit adres
              return NextResponse.json({
                street: matchingDoc.straatnaam || '',
                city: matchingDoc.woonplaatsnaam || '',
                municipality: matchingDoc.gemeentenaam || '',
                province: matchingDoc.provincienaam || '',
              })
            } else {
            // Basisadres bestaat, maar toevoeging niet
            return NextResponse.json(
                { error: `Toevoeging '${trimmedAddition}' bestaat niet voor dit adres` },
              { status: 404 }
            )
            }
          }
        }
      }
      
      // Adres bestaat helemaal niet
      return NextResponse.json(
        { error: 'Adres niet gevonden' },
        { status: 404 }
      )
    }

    // Adres gevonden!
    const adres = data.response.docs[0]
    
    return NextResponse.json({
      street: adres.straatnaam || '',
      city: adres.woonplaatsnaam || '',
      municipality: adres.gemeentenaam || '',
      province: adres.provincienaam || '',
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
