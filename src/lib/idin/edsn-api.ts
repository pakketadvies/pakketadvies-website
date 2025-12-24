/**
 * EDSN (Energie Data Services Nederland) API Client
 * 
 * Deze module handelt de communicatie met EDSN af voor het ophalen van
 * energieverbruiksdata na iDIN verificatie.
 * 
 * VOOR GEBRUIK:
 * 1. Neem contact op met EDSN (sales@edsn.nl) voor API toegang
 * 2. Vraag om test credentials
 * 3. Configureer environment variables (zie docs/idin-production-setup.md)
 */

interface EDSNConfig {
  apiKey: string
  apiUrl: string // Bijv. https://api.edsn.nl/v1
}

interface ConsumptionRequest {
  bsn: string
  postcode: string
  huisnummer: string
  toevoeging?: string
}

interface ConsumptionResponse {
  success: boolean
  data?: {
    // Elektriciteit
    elektriciteitNormaal?: number // kWh per jaar
    elektriciteitDal?: number // kWh per jaar (indien dubbele meter)
    heeftEnkeleMeter?: boolean
    
    // Gas
    gasJaar?: number // m³ per jaar
    geenGasaansluiting?: boolean
    
    // Teruglevering (zonnepanelen)
    terugleveringJaar?: number // kWh per jaar
    
    // Contract informatie
    huidigeLeverancier?: string
    contractEinddatum?: string // ISO date string
    
    // EAN codes
    eanElektriciteit?: string
    eanGas?: string
    
    // Netbeheerder
    netbeheerderId?: string
    netbeheerderNaam?: string
  }
  error?: string
}

/**
 * Haal verbruiksdata op via EDSN API
 * 
 * Deze functie roept de EDSN API aan om verbruiksdata op te halen
 * op basis van BSN en adresgegevens (verkregen via iDIN).
 * 
 * NOTE: Dit is een placeholder implementatie. De exacte API endpoints
 * en request/response formaten moeten worden geverifieerd met EDSN.
 */
export async function fetchConsumptionFromEDSN(
  config: EDSNConfig,
  request: ConsumptionRequest
): Promise<ConsumptionResponse> {
  try {
    // STAP 1: Request verbruiksdata
    // EDSN API endpoint (voorbeeld - check EDSN documentatie voor exacte endpoint)
    const requestUrl = `${config.apiUrl}/consumption/request`
    
    const requestBody = {
      bsn: request.bsn,
      postcode: request.postcode.replace(/\s/g, '').toUpperCase(),
      huisnummer: request.huisnummer,
      toevoeging: request.toevoeging || null,
    }

    const requestResponse = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-API-Key': config.apiKey, // Mogelijk alternatieve auth methode
      },
      body: JSON.stringify(requestBody),
    })

    if (!requestResponse.ok) {
      const errorText = await requestResponse.text()
      return {
        success: false,
        error: `EDSN API error: ${requestResponse.status} - ${errorText}`,
      }
    }

    const requestData = await requestResponse.json()
    
    // EDSN gebruikt mogelijk een async flow (request → status check → data)
    // Check of we direct data krijgen of een request ID
    if (requestData.requestId) {
      // Async flow: poll voor status
      return await pollEDSNRequestStatus(config, requestData.requestId)
    } else if (requestData.data) {
      // Direct response: parse data
      return parseEDSNConsumptionData(requestData.data)
    } else {
      return {
        success: false,
        error: 'Onverwacht EDSN response format',
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: `EDSN API call failed: ${error.message}`,
    }
  }
}

/**
 * Poll EDSN voor request status (async flow)
 */
async function pollEDSNRequestStatus(
  config: EDSNConfig,
  requestId: string,
  maxAttempts = 10,
  delayMs = 2000
): Promise<ConsumptionResponse> {
  const statusUrl = `${config.apiUrl}/consumption/${requestId}/status`
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    
    try {
      const statusResponse = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      })

      if (!statusResponse.ok) {
        continue // Retry
      }

      const statusData = await statusResponse.json()
      
      if (statusData.status === 'completed') {
        // Haal data op
        const dataUrl = `${config.apiUrl}/consumption/${requestId}/data`
        const dataResponse = await fetch(dataUrl, {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
          },
        })

        if (dataResponse.ok) {
          const data = await dataResponse.json()
          return parseEDSNConsumptionData(data)
        }
      } else if (statusData.status === 'failed') {
        return {
          success: false,
          error: statusData.error || 'EDSN request failed',
        }
      }
      // else: still processing, continue polling
    } catch (error) {
      // Retry on error
      continue
    }
  }

  return {
    success: false,
    error: 'EDSN request timeout - data kon niet worden opgehaald',
  }
}

/**
 * Parse EDSN consumption data naar ons format
 */
function parseEDSNConsumptionData(edsnData: any): ConsumptionResponse {
  try {
    // NOTE: Exact format hangt af van EDSN API response
    // Dit is een voorbeeld implementatie gebaseerd op verwachte data structuur
    
    return {
      success: true,
      data: {
        // Elektriciteit
        elektriciteitNormaal: edsnData.electricity?.normal?.yearly || 
                             edsnData.elektriciteit?.normaal?.jaar ||
                             edsnData.consumption?.electricity?.normal,
        elektriciteitDal: edsnData.electricity?.offPeak?.yearly ||
                         edsnData.elektriciteit?.dal?.jaar ||
                         edsnData.consumption?.electricity?.offPeak,
        heeftEnkeleMeter: edsnData.electricity?.singleMeter ||
                         edsnData.elektriciteit?.enkeleMeter ||
                         !edsnData.electricity?.offPeak,
        
        // Gas
        gasJaar: edsnData.gas?.yearly ||
                edsnData.gas?.jaar ||
                edsnData.consumption?.gas,
        geenGasaansluiting: !edsnData.gas || edsnData.gas?.yearly === 0,
        
        // Teruglevering
        terugleveringJaar: edsnData.feedIn?.yearly ||
                          edsnData.teruglevering?.jaar ||
                          edsnData.consumption?.feedIn,
        
        // Contract info
        huidigeLeverancier: edsnData.supplier?.name ||
                           edsnData.leverancier?.naam,
        contractEinddatum: edsnData.contract?.endDate ||
                          edsnData.contract?.einddatum,
        
        // EAN codes
        eanElektriciteit: edsnData.ean?.electricity ||
                         edsnData.eanElektriciteit,
        eanGas: edsnData.ean?.gas || edsnData.eanGas,
        
        // Netbeheerder
        netbeheerderId: edsnData.netbeheerder?.id,
        netbeheerderNaam: edsnData.netbeheerder?.name ||
                         edsnData.netbeheerder?.naam,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to parse EDSN data: ${error.message}`,
    }
  }
}

/**
 * Get EDSN config from environment variables
 */
export function getEDSNConfig(): EDSNConfig | null {
  const apiKey = process.env.EDSN_API_KEY
  const apiUrl = process.env.EDSN_API_URL || 'https://api.edsn.nl/v1'

  if (!apiKey) {
    return null // EDSN niet geconfigureerd
  }

  return {
    apiKey,
    apiUrl,
  }
}

