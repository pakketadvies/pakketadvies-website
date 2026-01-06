#!/usr/bin/env node
/**
 * Test om te zien of field names of locaties verkeerd zijn
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

async function testFieldNames() {
  console.log('🔍 Testing Field Names and Locations...\n')

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

  // Test 1: Zonder agreedAdvancePaymentAmount fields
  console.log('1️⃣ Test: Zonder agreedAdvancePaymentAmount fields...')
  const payload1 = {
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
      paymentMethod: 'SEPA_DIRECT_DEBIT',
      mandateDate: '2026-01-06',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
      // GEEN agreedAdvancePaymentAmount fields
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: formatDateTime(now),
    signType: 'EMAIL',
    signSource: 'EMAIL',
    signIP: '127.0.0.1',
    signData: 'sepa',
    originalCreateTimestamp: formatDateTime(now),
    agreedAdvancePaymentAmount: '100.00', // Alleen op root level
  }

  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload1),
    })

    const responseText = await response.text()
    const responseData = JSON.parse(responseText)

    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log('   ✅ SUCCESS zonder agreedAdvancePaymentAmount in requestedConnection!')
    } else {
      console.log(`   Errors: ${Object.keys(responseData.errors || {}).length}`)
      if (responseData.errors?.requestedConnections) {
        console.log('   ⚠️  requestedConnections errors:', JSON.stringify(responseData.errors.requestedConnections, null, 2))
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  // Test 2: Met alleen expectedAdvancePaymentAmount (niet agreed)
  console.log('\n2️⃣ Test: Met expectedAdvancePaymentAmount (niet agreed)...')
  const payload2 = {
    ...payload1,
    requestedConnections: [{
      ...payload1.requestedConnections[0],
      expectedAdvancePaymentAmountElectricity: '100.00',
      expectedAdvancePaymentAmountGas: '0.00',
    }],
  }

  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload2),
    })

    const responseText = await response.text()
    const responseData = JSON.parse(responseText)

    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log('   ✅ SUCCESS met expectedAdvancePaymentAmount!')
    } else {
      console.log(`   Errors: ${Object.keys(responseData.errors || {}).length}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  // Test 3: Zonder signType en signSource (optioneel?)
  console.log('\n3️⃣ Test: Zonder signType en signSource...')
  const payload3 = {
    ...payload1,
    requestedConnections: [{
      ...payload1.requestedConnections[0],
      agreedAdvancePaymentAmountElectricity: '100.00',
      agreedAdvancePaymentAmountGas: '0.00',
    }],
    // Zonder signType en signSource
  }
  delete payload3.signType
  delete payload3.signSource

  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload3),
    })

    const responseText = await response.text()
    const responseData = JSON.parse(responseText)

    console.log(`   Status: ${response.status}`)
    if (response.ok) {
      console.log('   ✅ SUCCESS zonder signType en signSource!')
    } else {
      console.log(`   Errors: ${Object.keys(responseData.errors || {}).length}`)
      console.log('   Errors:', JSON.stringify(responseData.errors, null, 2))
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Test Complete')
  console.log('='.repeat(60) + '\n')
}

testFieldNames().catch(console.error)

