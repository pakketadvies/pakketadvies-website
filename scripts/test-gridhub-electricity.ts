/**
 * Standalone test script voor GridHub API met alleen elektriciteit
 * 
 * Gebruik: npx tsx scripts/test-gridhub-electricity.ts
 * Of: npm run test:gridhub (als je het toevoegt aan package.json)
 */

import { createClient } from '@supabase/supabase-js'
import { GridHubClient } from '../src/lib/integrations/gridhub/client'
import { mapAanvraagToGridHubOrderRequest } from '../src/lib/integrations/gridhub/mapper'
import { decryptPassword } from '../src/lib/integrations/gridhub/encryption'

const logs: string[] = []

function log(message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`
  logs.push(logMessage)
  console.log(logMessage, data ? JSON.stringify(data, null, 2) : '')
}

async function main() {
  try {
    log('🧪 Starting GridHub test with electricity only...')

    // Load environment variables from .env.local if it exists
    try {
      const fs = require('fs')
      const path = require('path')
      const envPath = path.join(process.cwd(), '.env.local')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')
        envContent.split('\n').forEach((line: string) => {
          const match = line.match(/^([^=]+)=(.*)$/)
          if (match) {
            const key = match[1].trim()
            const value = match[2].trim().replace(/^["']|["']$/g, '')
            if (!process.env[key]) {
              process.env[key] = value
            }
          }
        })
        log('✅ Loaded .env.local')
      }
    } catch (e) {
      log('⚠️ Could not load .env.local, using existing env vars')
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const encryptionKey = process.env.GRIDHUB_ENCRYPTION_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      log('❌ Missing Supabase credentials')
      process.exit(1)
    }

    if (!encryptionKey) {
      log('❌ Missing GRIDHUB_ENCRYPTION_KEY')
      process.exit(1)
    }

    log('✅ Environment variables loaded')

    // 1. Fetch GridHub config from database
    log('📋 Step 1: Fetching GridHub config from database...')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Find Energiek.nl leverancier
    const { data: leverancier, error: leverancierError } = await supabase
      .from('leveranciers')
      .select('id, naam')
      .eq('naam', 'Energiek.nl')
      .single()

    if (leverancierError || !leverancier) {
      log('❌ Error finding Energiek.nl leverancier:', leverancierError)
      process.exit(1)
    }

    log('✅ Found leverancier:', { id: leverancier.id, naam: leverancier.naam })

    // Fetch API config
    const { data: apiConfig, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('*')
      .eq('leverancier_id', leverancier.id)
      .eq('provider', 'GRIDHUB')
      .eq('actief', true)
      .single()

    if (configError || !apiConfig) {
      log('❌ Error fetching API config:', configError)
      process.exit(1)
    }

    log('✅ Found API config:', {
      api_url: apiConfig.api_url,
      api_username: apiConfig.api_username,
      environment: apiConfig.environment,
      has_password: !!apiConfig.api_password_encrypted,
    })

    // 2. Decrypt password and check for newlines
    log('🔐 Step 2: Decrypting password...')
    const decryptedPassword = decryptPassword(apiConfig.api_password_encrypted)
    
    log('📝 Password details:', {
      length: decryptedPassword.length,
      has_newline: decryptedPassword.includes('\n'),
      has_carriage_return: decryptedPassword.includes('\r'),
      first_10_chars: decryptedPassword.substring(0, 10),
      last_10_chars: decryptedPassword.substring(decryptedPassword.length - 10),
      trimmed_length: decryptedPassword.trim().length,
    })

    const trimmedPassword = decryptedPassword.trim()
    if (decryptedPassword !== trimmedPassword) {
      log('⚠️ WARNING: Password has leading/trailing whitespace!')
      log('🔧 Fixing: Using trimmed password')
    }

    // 3. Create GridHub client
    log('🔧 Step 3: Creating GridHub client...')
    const gridhubClient = new GridHubClient({
      apiUrl: apiConfig.api_url?.trim() || '',
      username: apiConfig.api_username?.trim() || '',
      password: trimmedPassword, // Use trimmed password
      environment: apiConfig.environment as 'test' | 'production',
    })

    log('✅ GridHub client created')
    
    // Inspect client config
    const clientConfig = (gridhubClient as any).config
    log('📋 Client config after trimming:', {
      apiUrl_length: clientConfig.apiUrl.length,
      apiUrl_has_newline: clientConfig.apiUrl.includes('\n'),
      username_length: clientConfig.username.length,
      username_has_newline: clientConfig.username.includes('\n'),
      password_length: clientConfig.password.length,
      password_has_newline: clientConfig.password.includes('\n'),
      password_first_5: clientConfig.password.substring(0, 5),
      password_last_5: clientConfig.password.substring(clientConfig.password.length - 5),
    })

    // 4. Create mock aanvraag data (only electricity)
    log('📝 Step 4: Creating mock aanvraag data (electricity only)...')
    const mockAanvraag = {
      id: 'test-' + Date.now(),
      aanvraagnummer: 'TEST-' + Date.now(),
      contract_id: '5fe16b85-ae6f-412c-a1af-dc0b76517523',
      contract_type: 'dynamisch',
      contract_naam: 'Energiek.nl Dynamisch Energiecontract',
      leverancier_id: leverancier.id,
      leverancier_naam: 'Energiek.nl',
      aanvraag_type: 'particulier' as const,
      status: 'nieuw',
      verbruik_data: {
        elektriciteitEnkel: 500,
        heeftEnkeleMeter: true,
        gasJaar: null,
        geenGasaansluiting: true,
        heeftZonnepanelen: false,
        terugleveringJaar: null,
        meterType: 'slim' as const,
        aansluitwaardeElektriciteit: '3x25A',
        aansluitwaardeGas: null,
        leveringsadressen: [{
          postcode: '9722EG',
          huisnummer: '27',
          toevoeging: 'A',
          straat: 'Helper Brink',
          plaats: 'Groningen',
        }],
        maandbedrag: 16,
        jaarbedrag: 188,
      },
      gegevens_data: {
        voornaam: 'Test',
        achternaam: 'Tester',
        geboortedatum: '1990-01-01',
        telefoonnummer: '0612345678',
        emailadres: 'test@example.com',
        straat: 'Helper Brink',
        huisnummer: '27',
        toevoeging: 'A',
        postcode: '9722EG',
        plaats: 'Groningen',
      },
      iban: 'NL91ABNA0417164300',
      rekening_op_andere_naam: false,
      rekeninghouder_naam: 'T. Tester',
      heeft_verblijfsfunctie: true,
      gaat_verhuizen: false,
      wanneer_overstappen: null,
      contract_einddatum: null,
      ingangsdatum: '2026-01-27',
      is_klant_bij_leverancier: false,
      created_at: new Date().toISOString(),
    }

    log('✅ Mock aanvraag created:', {
      has_electricity: !!mockAanvraag.verbruik_data.elektriciteitEnkel,
      has_gas: !!mockAanvraag.verbruik_data.gasJaar,
      geen_gasaansluiting: mockAanvraag.verbruik_data.geenGasaansluiting,
      aansluitwaarde_elektriciteit: mockAanvraag.verbruik_data.aansluitwaardeElektriciteit,
      aansluitwaarde_gas: mockAanvraag.verbruik_data.aansluitwaardeGas,
    })

    // 5. Map to GridHub format
    log('🔄 Step 5: Mapping aanvraag to GridHub format...')
    const productIds = apiConfig.product_ids as { particulier: string; zakelijk: string }
    const tariefIds = apiConfig.tarief_ids as { test: string; production: string }
    const productId = productIds.particulier
    const tariffId = apiConfig.environment === 'production' ? tariefIds.production : tariefIds.test

    log('📋 Using product/tariff IDs:', { productId, tariffId })

    const gridhubPayload = mapAanvraagToGridHubOrderRequest({
      aanvraag: mockAanvraag as any,
      productId,
      tariffId,
      customerApprovalIDs: apiConfig.customer_approval_ids as number[],
      clientIP: '127.0.0.1',
      signTimestamp: new Date(),
    })

    log('✅ Payload mapped to GridHub format')

    // 6. Inspect payload in detail
    log('🔍 Step 6: Inspecting payload...')
    const requestedConnections = gridhubPayload.requestedConnections as any
    
    log('📋 RequestedConnections details:', {
      hasElectricity: requestedConnections.hasElectricity,
      hasGas: requestedConnections.hasGas,
      capacityCodeElectricity: requestedConnections.capacityCodeElectricity,
      capacityCodeGas: requestedConnections.capacityCodeGas,
      agreedAdvancePaymentAmountElectricity: requestedConnections.agreedAdvancePaymentAmountElectricity,
      agreedAdvancePaymentAmountGas: requestedConnections.agreedAdvancePaymentAmountGas,
      all_keys: Object.keys(requestedConnections),
    })

    // Check for any string values with newlines
    const payloadString = JSON.stringify(gridhubPayload)
    if (payloadString.includes('\n') || payloadString.includes('\r')) {
      log('⚠️ WARNING: Payload contains newlines!')
      const lines = payloadString.split('\n')
      lines.forEach((line, i) => {
        if (line.includes('\n') || line.includes('\r')) {
          log(`⚠️ Line ${i} contains newline: ${JSON.stringify(line)}`)
        }
      })
    } else {
      log('✅ Payload does not contain newlines')
    }

    log('📦 Full payload (sanitized):', JSON.stringify({
      ...gridhubPayload,
      relation: {
        ...gridhubPayload.relation,
        bankAccountNumber: '***REDACTED***',
      },
    }, null, 2))

    // 7. Make API call
    log('📤 Step 7: Making API call to GridHub...')
    log('🌐 API URL:', clientConfig.apiUrl)
    log('👤 Username:', clientConfig.username)
    log('🔑 Password length:', clientConfig.password.length)
    log('🔑 Password has newline:', clientConfig.password.includes('\n'))
    log('🔑 Password has carriage return:', clientConfig.password.includes('\r'))

    try {
      const response = await gridhubClient.createOrderRequest(gridhubPayload)
      log('✅ SUCCESS! GridHub API call succeeded!')
      log('📋 Response:', JSON.stringify(response, null, 2))
      
      console.log('\n🎉 TEST PASSED! All logs:')
      logs.forEach(l => console.log(l))
      process.exit(0)
    } catch (error: any) {
      log('❌ ERROR: GridHub API call failed!')
      log('📋 Error message:', error.message)
      
      // Try to extract more details from error
      if (error.message) {
        const errorMatch = error.message.match(/GridHub API error: (\d+) - (.+)/)
        if (errorMatch) {
          const statusCode = errorMatch[1]
          const errorBody = errorMatch[2]
          log('📋 Status code:', statusCode)
          log('📋 Error body:', errorBody)
          
          try {
            const errorJson = JSON.parse(errorBody)
            log('📋 Parsed error JSON:', JSON.stringify(errorJson, null, 2))
            
            if (errorJson.message) {
              log('📋 Error message:', errorJson.message)
            }
            if (errorJson.errors) {
              log('📋 Error details:', JSON.stringify(errorJson.errors, null, 2))
            }
          } catch (parseError) {
            log('⚠️ Could not parse error body as JSON')
          }
        }
      }

      console.log('\n❌ TEST FAILED! All logs:')
      logs.forEach(l => console.log(l))
      process.exit(1)
    }
  } catch (error: any) {
    log('❌ FATAL ERROR:', error.message)
    log('📋 Stack:', error.stack)
    
    console.log('\n❌ FATAL ERROR! All logs:')
    logs.forEach(l => console.log(l))
    process.exit(1)
  }
}

main()

