/**
 * Test script voor GridHub API met alleen elektriciteit
 * 
 * Dit script simuleert een aanvraag met alleen elektriciteit en geeft
 * uitgebreide logging om te debuggen waarom GridHub 500 errors geeft.
 * 
 * Gebruik: POST /api/test/gridhub-only-electricity
 */

import { NextResponse } from 'next/server'
import { GridHubClient } from '@/lib/integrations/gridhub/client'
import { mapAanvraagToGridHubOrderRequest } from '@/lib/integrations/gridhub/mapper'
import { createClient } from '@/lib/supabase/server'
import { decryptPassword } from '@/lib/integrations/gridhub/encryption'

export async function POST(request: Request) {
  const logs: string[] = []
  
  function log(message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    logs.push(logMessage)
    console.log(logMessage, data || '')
  }

  try {
    log('🧪 Starting GridHub test with electricity only...')

    // 1. Fetch GridHub config from database
    log('📋 Step 1: Fetching GridHub config from database...')
    const supabase = await createClient()
    
    // Find Energiek.nl leverancier
    const { data: leverancier, error: leverancierError } = await supabase
      .from('leveranciers')
      .select('id, naam')
      .eq('naam', 'Energiek.nl')
      .single()

    if (leverancierError || !leverancier) {
      log('❌ Error finding Energiek.nl leverancier:', leverancierError)
      return NextResponse.json({
        success: false,
        error: 'Leverancier not found',
        logs,
      }, { status: 500 })
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
      return NextResponse.json({
        success: false,
        error: 'API config not found',
        logs,
      }, { status: 500 })
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
    }

    // 3. Create GridHub client
    log('🔧 Step 3: Creating GridHub client...')
    const gridhubClient = new GridHubClient({
      apiUrl: apiConfig.api_url,
      username: apiConfig.api_username,
      password: decryptedPassword,
      environment: apiConfig.environment as 'test' | 'production',
    })

    log('✅ GridHub client created')

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
    log('🌐 API URL:', gridhubClient['config'].apiUrl)
    log('👤 Username:', gridhubClient['config'].username)
    log('🔑 Password (first 5 chars):', gridhubClient['config'].password.substring(0, 5) + '...')
    log('🔑 Password (last 5 chars):', '...' + gridhubClient['config'].password.substring(gridhubClient['config'].password.length - 5))
    log('🔑 Password length:', gridhubClient['config'].password.length)
    log('🔑 Password has newline:', gridhubClient['config'].password.includes('\n'))
    log('🔑 Password has carriage return:', gridhubClient['config'].password.includes('\r'))

    try {
      const response = await gridhubClient.createOrderRequest(gridhubPayload)
      log('✅ SUCCESS! GridHub API call succeeded!')
      log('📋 Response:', JSON.stringify(response, null, 2))
      
      return NextResponse.json({
        success: true,
        response,
        logs,
      })
    } catch (error: any) {
      log('❌ ERROR: GridHub API call failed!')
      log('📋 Error message:', error.message)
      log('📋 Error stack:', error.stack)
      
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
            if (errorJson.Service) {
              log('📋 Service ID:', errorJson.Service)
            }
          } catch (parseError) {
            log('⚠️ Could not parse error body as JSON')
          }
        }
      }

      return NextResponse.json({
        success: false,
        error: error.message,
        logs,
      }, { status: 500 })
    }
  } catch (error: any) {
    log('❌ FATAL ERROR:', error.message)
    log('📋 Stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      logs,
    }, { status: 500 })
  }
}

