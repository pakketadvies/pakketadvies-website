#!/usr/bin/env node
/**
 * Test met de correcte waarden uit de API documentatie
 */

// Load .env.local
const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const equalIndex = trimmed.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmed.substring(0, equalIndex).trim()
        const value = trimmed.substring(equalIndex + 1).trim().replace(/^["']|["']$/g, '')
        if (key && value) {
          process.env[key] = value
        }
      }
    }
  })
}

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GRIDHUB_ENCRYPTION_KEY = process.env.GRIDHUB_ENCRYPTION_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function decryptPassword(encryptedPassword) {
  const key = Buffer.from(GRIDHUB_ENCRYPTION_KEY, 'hex')
  const parts = encryptedPassword.split(':')
  const [ivHex, authTagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function generateSignData() {
  const signerName = 'Jan Jansen'
  const signerEmail = 'jan.jansen@example.com'
  const signDate = new Date().toISOString().split('T')[0]
  const aanvraagnummer = 'TEST-001'
  
  const svgSignature = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="100">
    <text x="10" y="30" font-family="Arial" font-size="14" fill="black">Digitale handtekening</text>
    <text x="10" y="50" font-family="Arial" font-size="12" fill="black">Naam: ${signerName}</text>
    <text x="10" y="70" font-family="Arial" font-size="12" fill="black">Email: ${signerEmail}</text>
    <text x="10" y="90" font-family="Arial" font-size="12" fill="black">Datum: ${signDate}</text>
    <text x="10" y="110" font-family="Arial" font-size="10" fill="gray">Aanvraagnummer: ${aanvraagnummer}</text>
  </svg>`

  const base64Signature = Buffer.from(svgSignature).toString('base64')
  // Test verschillende varianten: SEPA (hoofdletters), sepa (kleine letters), of andere
  return `SEPA-${base64Signature}` // Test met hoofdletters
}

async function testCorrectValues() {
  console.log('🧪 Test met correcte waarden uit API documentatie...\n')

  const { data: leverancier } = await supabase
    .from('leveranciers')
    .select('id')
    .eq('naam', 'Energiek.nl')
    .single()

  const { data: apiConfig } = await supabase
    .from('leverancier_api_config')
    .select('*')
    .eq('leverancier_id', leverancier.id)
    .eq('provider', 'GRIDHUB')
    .single()

  const password = decryptPassword(apiConfig.api_password_encrypted)
  const apiUrl = apiConfig.api_url
  const now = new Date()

  // Test met correcte waarden:
  // - paymentMethod: AUTOMATICCOLLECTION
  // - signType: ESIGNATURE
  // - signData: base64 encoded SVG
  // - ZONDER agreedAdvancePaymentAmountElectricity/Gas in requestedConnections

  const payload = {
    relation: {
      type: 'CONSUMER',
      firstName: 'Jan',
      lastName: 'Jansen',
      gender: 'MALE',
      phoneNumber: '0612345678',
      emailAddress: 'jan.jansen@example.com',
      street: 'Hoofdstraat',
      houseNumber: 1,
      postalCode: '1234AB',
      city: 'Amsterdam',
      country: 'NL',
      bankAccountType: 'IBAN',
      bankAccountNumber: 'NL91ABNA0417164300',
      paymentMethod: 'AUTOMATICCOLLECTION', // ✅ Correct volgens docs
      mandateDate: '2026-01-06',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
      agreedAdvancePaymentAmountElectricity: '100.00', // ✅ Verplicht veld
      agreedAdvancePaymentAmountGas: '0.00', // ✅ Verplicht veld
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: formatDateTime(now),
    signType: 'ESIGNATURE', // ✅ Correct volgens docs (digitale handtekening per mail/SMS)
    signSource: 'EMAIL',
    signIP: '127.0.0.1',
    signData: generateSignData(), // ✅ Base64 encoded SVG (volgens docs)
    originalCreateTimestamp: formatDateTime(now),
    agreedAdvancePaymentAmount: '100.00', // ✅ Alleen op root level
  }

  console.log('📤 Verzenden payload met correcte waarden...')
  console.log('   paymentMethod: AUTOMATICCOLLECTION')
  console.log('   signType: ESIGNATURE')
  console.log('   signData: base64 SVG handtekening met "sepa-" prefix')
  console.log('   requestedConnections: MET agreedAdvancePaymentAmount fields\n')
  
  // Debug: toon de payload
  console.log('🔍 Payload debug:')
  console.log('   signData bevat "sepa":', payload.signData.includes('sepa'))
  console.log('   signData lengte:', payload.signData.length)
  console.log('   agreedAdvancePaymentAmountElectricity:', payload.requestedConnections[0].agreedAdvancePaymentAmountElectricity)
  console.log('   agreedAdvancePaymentAmountGas:', payload.requestedConnections[0].agreedAdvancePaymentAmountGas)
  console.log('')

  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    const responseData = JSON.parse(responseText)

    if (response.ok) {
      console.log('✅ SUCCESS! Payload geaccepteerd!')
      console.log('   Response:', JSON.stringify(responseData, null, 2))
    } else {
      console.log(`❌ Error: ${response.status}`)
      console.log('   Errors:', JSON.stringify(responseData.errors, null, 2))
      console.log('   Message:', responseData.message)
    }
  } catch (error) {
    console.log(`❌ Exception: ${error.message}`)
  }
}

testCorrectValues().catch(console.error)

