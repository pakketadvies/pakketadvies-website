import { google } from 'googleapis'

/**
 * Google Sheets Client voor PakketAdvies
 * 
 * Configuratie via environment variables:
 * - GOOGLE_SHEETS_SPREADSHEET_ID: Het ID van de spreadsheet (uit URL)
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Private key van service account (base64 encoded)
 */

interface GoogleSheetsConfig {
  spreadsheetId: string
  serviceAccountEmail: string
  privateKey: string
}

interface LeadData {
  datumLeadBinnen: string
  huidigeLeveranciers?: string
  postcode?: string
  huisnummer?: string
  stroom?: string
  gas?: string
  naam: string
  telefoonnummer: string
  emailadres: string
  opmerkingen?: string
}

/**
 * Lead data voor de Don-spreadsheet (gas-vastzetten landingspage).
 *
 * Kolomvolgorde in blad "Don" (zoals door PakketAdvies bepaald):
 *  A: Datum
 *  B: Energieleverancier
 *  C: Postcode
 *  D: huisnummer
 *  E: stroom
 *  F: gas
 *  G: naam klant
 *  H: bedrijfsnaam
 *  I: telefoonnummer
 *  J: e-mailadres
 *  K: opmerkingen
 */
interface DonLeadData {
  datum: string
  energieleverancier?: string
  postcode?: string
  huisnummer?: string
  stroom?: string
  gas?: string
  naamKlant: string
  bedrijfsnaam?: string
  telefoonnummer: string
  emailadres?: string
  opmerkingen?: string
}

/**
 * Spreadsheet ID van de "Rick en Don Spreadsheet" waar gas-vastzetten leads heen gaan.
 * Te overriden via env var GOOGLE_SHEETS_GAS_SPREADSHEET_ID.
 */
const DON_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_GAS_SPREADSHEET_ID ||
  '1j3u5AAle7G0w31-BRU59bRSANKS7e0FqOyFc8LOsfjY'
const DON_SHEET_RANGE = 'Don!A:K'

/**
 * Get Google Sheets configuration from environment variables
 */
function getConfig(): GoogleSheetsConfig {
  console.log('🔍 [Google Sheets] Checking environment variables...')
  
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY

  console.log('🔍 [Google Sheets] Environment check:', {
    hasSpreadsheetId: !!spreadsheetId,
    spreadsheetId: spreadsheetId?.substring(0, 10) + '...',
    hasServiceAccountEmail: !!serviceAccountEmail,
    serviceAccountEmail,
    hasPrivateKey: !!privateKeyBase64,
    privateKeyLength: privateKeyBase64?.length,
  })

  if (!spreadsheetId || !serviceAccountEmail || !privateKeyBase64) {
    const missing = []
    if (!spreadsheetId) missing.push('GOOGLE_SHEETS_SPREADSHEET_ID')
    if (!serviceAccountEmail) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL')
    if (!privateKeyBase64) missing.push('GOOGLE_PRIVATE_KEY')
    
    console.error('❌ [Google Sheets] Missing environment variables:', missing)
    throw new Error(`Google Sheets configuratie ontbreekt: ${missing.join(', ')}`)
  }

  // Decode base64 private key
  let privateKey: string
  try {
    console.log('🔐 [Google Sheets] Decoding private key from base64...')
    privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8')
    console.log('✅ [Google Sheets] Private key decoded successfully, length:', privateKey.length)
  } catch (error) {
    console.error('❌ [Google Sheets] Failed to decode private key:', error)
    throw new Error('GOOGLE_PRIVATE_KEY is niet correct base64 encoded')
  }

  console.log('✅ [Google Sheets] Configuration loaded successfully')
  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
  }
}

/**
 * Create authenticated Google Sheets client.
 * Optioneel kan een andere spreadsheet ID worden meegegeven; default is de
 * spreadsheet uit GOOGLE_SHEETS_SPREADSHEET_ID.
 */
async function getAuthenticatedClient(overrideSpreadsheetId?: string) {
  console.log('🔐 [Google Sheets] Creating authenticated client...')
  const config = getConfig()
  const spreadsheetId = overrideSpreadsheetId || config.spreadsheetId

  try {
    console.log('🔐 [Google Sheets] Initializing GoogleAuth with service account...')
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.serviceAccountEmail,
        private_key: config.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    console.log('🔐 [Google Sheets] Getting auth client...')
    await auth.getClient()
    console.log('✅ [Google Sheets] Auth client created successfully')

    console.log('🔐 [Google Sheets] Creating Sheets API client...')
    const sheets = google.sheets({ version: 'v4', auth: auth as any })
    console.log('✅ [Google Sheets] Sheets API client created successfully')

    return { sheets, spreadsheetId }
  } catch (error: any) {
    console.error('❌ [Google Sheets] Failed to create authenticated client:', {
      message: error?.message,
      stack: error?.stack,
    })
    throw error
  }
}

/**
 * Append lead data to "Advertentieleads" sheet
 * 
 * @param leadData - Lead data to append
 * @returns Promise that resolves when data is written
 */
export async function appendLeadToSheet(leadData: LeadData): Promise<void> {
  console.log('📊 [Google Sheets] ========================================')
  console.log('📊 [Google Sheets] START: Appending lead to spreadsheet')
  console.log('📊 [Google Sheets] ========================================')
  
  try {
    console.log('📊 [Google Sheets] Lead data received:', {
      naam: leadData.naam,
      email: leadData.emailadres,
      telefoon: leadData.telefoonnummer,
      hasPostcode: !!leadData.postcode,
      hasHuisnummer: !!leadData.huisnummer,
    })
    
    console.log('📊 [Google Sheets] Getting authenticated client...')
    const { sheets, spreadsheetId } = await getAuthenticatedClient()
    console.log('✅ [Google Sheets] Authenticated client ready')

    // Kolommen in de spreadsheet:
    // A: Datum lead binnen
    // B: Huidige leveranciers
    // C: Postcode
    // D: Huisnummer
    // E: Stroom
    // F: Gas
    // G: Naam
    // H: Telefoonnummer
    // I: Emailadres
    // J: Opmerkingen

    const row = [
      leadData.datumLeadBinnen,
      leadData.huidigeLeveranciers || '',
      leadData.postcode || '',
      leadData.huisnummer || '',
      leadData.stroom || '',
      leadData.gas || '',
      leadData.naam,
      leadData.telefoonnummer,
      leadData.emailadres,
      leadData.opmerkingen || '',
    ]

    console.log('📊 [Google Sheets] Row data prepared:', {
      columns: row.length,
      spreadsheetId,
      range: 'Advertentieleads!A:J',
    })
    
    console.log('📊 [Google Sheets] Calling Sheets API append...')
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Advertentieleads!A:J', // Target sheet en kolommen
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    })

    console.log('✅ [Google Sheets] ========================================')
    console.log('✅ [Google Sheets] SUCCESS: Lead appended to sheet!')
    console.log('✅ [Google Sheets] Updated range:', response.data.updates?.updatedRange)
    console.log('✅ [Google Sheets] Updated rows:', response.data.updates?.updatedRows)
    console.log('✅ [Google Sheets] Updated columns:', response.data.updates?.updatedColumns)
    console.log('✅ [Google Sheets] Updated cells:', response.data.updates?.updatedCells)
    console.log('✅ [Google Sheets] ========================================')
  } catch (error: any) {
    console.error('❌ [Google Sheets] ========================================')
    console.error('❌ [Google Sheets] ERROR: Failed to append lead')
    console.error('❌ [Google Sheets] ========================================')
    console.error('❌ [Google Sheets] Error details:', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusText: error?.statusText,
    })
    
    if (error?.response) {
      console.error('❌ [Google Sheets] API Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }
    
    if (error?.stack) {
      console.error('❌ [Google Sheets] Stack trace:', error.stack)
    }
    
    console.error('❌ [Google Sheets] ========================================')
    
    // Re-throw error zodat de API route het kan loggen
    // Maar dit is non-blocking: formulier blijft werken ook als Google Sheets faalt
    throw new Error(`Google Sheets fout: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Append lead data to the "Don" sheet in the Rick & Don spreadsheet.
 *
 * Bestemd voor leads die binnenkomen via /aanbieding/gas-vastzetten.
 * Schrijft naar de spreadsheet met ID DON_SPREADSHEET_ID, bladnaam "Don",
 * met de volgende kolomvolgorde (door PakketAdvies bepaald):
 *
 *  A: Datum
 *  B: Energieleverancier
 *  C: Postcode
 *  D: huisnummer
 *  E: stroom
 *  F: gas
 *  G: naam klant
 *  H: bedrijfsnaam
 *  I: telefoonnummer
 *  J: e-mailadres
 *  K: opmerkingen
 *
 * @param leadData - Lead data to append
 */
export async function appendLeadToDonSheet(leadData: DonLeadData): Promise<void> {
  console.log('📊 [Google Sheets / Don] ========================================')
  console.log('📊 [Google Sheets / Don] START: Appending lead to Don sheet')
  console.log('📊 [Google Sheets / Don] ========================================')

  try {
    console.log('📊 [Google Sheets / Don] Lead data received:', {
      naam: leadData.naamKlant,
      bedrijfsnaam: leadData.bedrijfsnaam,
      telefoon: leadData.telefoonnummer,
      hasEmail: !!leadData.emailadres,
      hasOpmerkingen: !!leadData.opmerkingen,
    })

    const { sheets, spreadsheetId } = await getAuthenticatedClient(DON_SPREADSHEET_ID)
    console.log('✅ [Google Sheets / Don] Authenticated client ready, spreadsheet:', spreadsheetId)

    const row = [
      leadData.datum,                     // A: Datum
      leadData.energieleverancier || '',  // B: Energieleverancier
      leadData.postcode || '',            // C: Postcode
      leadData.huisnummer || '',          // D: huisnummer
      leadData.stroom || '',              // E: stroom
      leadData.gas || '',                 // F: gas
      leadData.naamKlant,                 // G: naam klant
      leadData.bedrijfsnaam || '',        // H: bedrijfsnaam
      leadData.telefoonnummer,            // I: telefoonnummer
      leadData.emailadres || '',          // J: e-mailadres
      leadData.opmerkingen || '',         // K: opmerkingen
    ]

    console.log('📊 [Google Sheets / Don] Row data prepared:', {
      columns: row.length,
      spreadsheetId,
      range: DON_SHEET_RANGE,
    })

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: DON_SHEET_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    })

    console.log('✅ [Google Sheets / Don] ========================================')
    console.log('✅ [Google Sheets / Don] SUCCESS: Lead appended to Don sheet!')
    console.log('✅ [Google Sheets / Don] Updated range:', response.data.updates?.updatedRange)
    console.log('✅ [Google Sheets / Don] Updated rows:', response.data.updates?.updatedRows)
    console.log('✅ [Google Sheets / Don] Updated cells:', response.data.updates?.updatedCells)
    console.log('✅ [Google Sheets / Don] ========================================')
  } catch (error: any) {
    console.error('❌ [Google Sheets / Don] ========================================')
    console.error('❌ [Google Sheets / Don] ERROR: Failed to append lead to Don sheet')
    console.error('❌ [Google Sheets / Don] ========================================')
    console.error('❌ [Google Sheets / Don] Error details:', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      statusText: error?.statusText,
    })

    if (error?.response) {
      console.error('❌ [Google Sheets / Don] API Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    }

    if (error?.stack) {
      console.error('❌ [Google Sheets / Don] Stack trace:', error.stack)
    }

    console.error('❌ [Google Sheets / Don] ========================================')

    throw new Error(`Google Sheets (Don) fout: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * Test Google Sheets connection
 * Useful for debugging
 */
export async function testGoogleSheetsConnection(): Promise<boolean> {
  try {
    console.log('🔍 [Google Sheets] Testing connection...')
    
    const { sheets, spreadsheetId } = await getAuthenticatedClient()

    // Try to read sheet metadata
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    console.log('✅ [Google Sheets] Connection successful! Spreadsheet:', response.data.properties?.title)
    return true
  } catch (error: any) {
    console.error('❌ [Google Sheets] Connection test failed:', {
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data,
    })
    return false
  }
}
