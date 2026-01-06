#!/usr/bin/env node
/**
 * Comprehensive test om ALLE exacte waarden te vinden
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

async function testComprehensive() {
  console.log('🔍 Comprehensive GridHub Value Testing...\n')

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

  // Uitgebreide lijst van mogelijke waarden
  const signTypes = ['EMAIL', 'SMS', 'PAPER', 'DIGITAL', 'DIGITAAL', 'ELEKTRONISCH', 'ONLINE', 'WEB', 'FORM']
  const signSources = ['EMAIL', 'SMS', 'PAPER', 'MANDATE', 'SEPA', 'CONTRACT', 'FORM', 'WEB', 'ONLINE', 'DIRECT_DEBIT']
  const signDataOptions = ['sepa', 'SEPA', 'mandate-sepa', 'sepa-mandate', 'direct-debit-sepa', 'sepa-direct-debit']

  // Base payload met SEPA_DIRECT_DEBIT (we weten dat dit werkt)
  const basePayload = {
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
      paymentMethod: 'SEPA_DIRECT_DEBIT', // We weten dat dit werkt
      mandateDate: '2026-01-06',
      mandateReference: 'TEST-REF-001',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
      agreedAdvancePaymentAmountElectricity: '100.00',
      agreedAdvancePaymentAmountGas: '0.00',
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: formatDateTime(now),
    signIP: '127.0.0.1',
    originalCreateTimestamp: formatDateTime(now),
    agreedAdvancePaymentAmount: '100.00',
  }

  let foundSignType = null
  let foundSignSource = null
  let foundSignData = null

  // Test signType
  console.log('1️⃣ Testing signType...')
  for (const st of signTypes) {
    const payload = JSON.parse(JSON.stringify(basePayload))
    payload.signType = st
    payload.signSource = 'MANDATE' // Default
    payload.signData = 'sepa-mandate-test'

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

      if (!responseData.errors?.signType) {
        console.log(`   ✅ signType: "${st}" is VALID!`)
        foundSignType = st
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test signSource
  console.log('\n2️⃣ Testing signSource...')
  for (const ss of signSources) {
    const payload = JSON.parse(JSON.stringify(basePayload))
    payload.signType = foundSignType || 'EMAIL'
    payload.signSource = ss
    payload.signData = 'sepa-mandate-test'

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

      if (!responseData.errors?.signSource) {
        console.log(`   ✅ signSource: "${ss}" is VALID!`)
        foundSignSource = ss
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test signData
  console.log('\n3️⃣ Testing signData...')
  for (const sd of signDataOptions) {
    const payload = JSON.parse(JSON.stringify(basePayload))
    payload.signType = foundSignType || 'EMAIL'
    payload.signSource = foundSignSource || 'MANDATE'
    payload.signData = sd

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

      if (!responseData.errors?.signData) {
        console.log(`   ✅ signData: "${sd}" is VALID!`)
        foundSignData = sd
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test field names voor agreedAdvancePaymentAmount
  console.log('\n4️⃣ Testing field names voor advance payment...')
  const fieldNameVariations = [
    { electricity: 'agreedAdvancePaymentAmountElectricity', gas: 'agreedAdvancePaymentAmountGas' },
    { electricity: 'advancePaymentAmountElectricity', gas: 'advancePaymentAmountGas' },
    { electricity: 'expectedAdvancePaymentAmountElectricity', gas: 'expectedAdvancePaymentAmountGas' },
  ]

  for (const fields of fieldNameVariations) {
    const payload = JSON.parse(JSON.stringify(basePayload))
    payload.signType = foundSignType || 'EMAIL'
    payload.signSource = foundSignSource || 'MANDATE'
    payload.signData = foundSignData || 'sepa-mandate'
    
    // Verwijder oude velden
    delete payload.requestedConnections[0].agreedAdvancePaymentAmountElectricity
    delete payload.requestedConnections[0].agreedAdvancePaymentAmountGas
    
    // Voeg nieuwe velden toe
    payload.requestedConnections[0][fields.electricity] = '100.00'
    payload.requestedConnections[0][fields.gas] = '0.00'

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

      if (!responseData.errors?.requestedConnections) {
        console.log(`   ✅ Field names: "${fields.electricity}", "${fields.gas}" zijn VALID!`)
        break
      } else {
        console.log(`   ❌ Field names: "${fields.electricity}", "${fields.gas}" - nog errors`)
      }
    } catch (error) {
      // Continue
    }
  }

  // Final test
  console.log('\n5️⃣ Final test...')
  const finalPayload = JSON.parse(JSON.stringify(basePayload))
  finalPayload.signType = foundSignType || 'EMAIL'
  finalPayload.signSource = foundSignSource || 'MANDATE'
  finalPayload.signData = foundSignData || 'sepa-mandate'

  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    })

    const responseText = await response.text()
    const responseData = JSON.parse(responseText)

    if (response.ok) {
      console.log('   ✅ SUCCESS! Volledige payload is geldig!')
      console.log('   Response:', JSON.stringify(responseData, null, 2))
    } else {
      console.log('   ❌ Nog errors:')
      console.log(JSON.stringify(responseData.errors, null, 2))
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Summary:')
  console.log(`   paymentMethod: SEPA_DIRECT_DEBIT ✅`)
  console.log(`   signType: ${foundSignType || 'NIET GEVONDEN'}`)
  console.log(`   signSource: ${foundSignSource || 'NIET GEVONDEN'}`)
  console.log(`   signData: ${foundSignData || 'NIET GEVONDEN'}`)
  console.log('='.repeat(60) + '\n')
}

testComprehensive().catch(console.error)

