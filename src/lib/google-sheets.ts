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
 * Get Google Sheets configuration from environment variables
 */
function getConfig(): GoogleSheetsConfig {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyBase64 = process.env.GOOGLE_PRIVATE_KEY

  if (!spreadsheetId || !serviceAccountEmail || !privateKeyBase64) {
    throw new Error('Google Sheets configuratie ontbreekt. Zorg dat GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL en GOOGLE_PRIVATE_KEY zijn ingesteld.')
  }

  // Decode base64 private key
  let privateKey: string
  try {
    privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8')
  } catch (error) {
    throw new Error('GOOGLE_PRIVATE_KEY is niet correct base64 encoded')
  }

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
  }
}

/**
 * Create authenticated Google Sheets client
 */
async function getAuthenticatedClient() {
  const config = getConfig()

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.serviceAccountEmail,
      private_key: config.privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  const authClient = await auth.getClient()
  const sheets = google.sheets({ version: 'v4', auth: auth as any })

  return { sheets, spreadsheetId: config.spreadsheetId }
}

/**
 * Append lead data to "Advertentieleads" sheet
 * 
 * @param leadData - Lead data to append
 * @returns Promise that resolves when data is written
 */
export async function appendLeadToSheet(leadData: LeadData): Promise<void> {
  try {
    console.log('📊 [Google Sheets] Starting to append lead to sheet...')
    
    const { sheets, spreadsheetId } = await getAuthenticatedClient()

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

    console.log('📊 [Google Sheets] Appending row to Advertentieleads sheet...')
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Advertentieleads!A:J', // Target sheet en kolommen
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    })

    console.log('✅ [Google Sheets] Lead successfully appended to sheet:', response.data.updates?.updatedRange)
  } catch (error: any) {
    console.error('❌ [Google Sheets] Error appending lead to sheet:', {
      message: error?.message,
      stack: error?.stack,
      response: error?.response?.data,
    })
    
    // Re-throw error zodat de API route het kan loggen
    // Maar dit is non-blocking: formulier blijft werken ook als Google Sheets faalt
    throw new Error(`Google Sheets fout: ${error?.message || 'Unknown error'}`)
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
