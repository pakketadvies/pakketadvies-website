#!/usr/bin/env node
/**
 * Detailed test om te bepalen welke GridHub authenticatie methode werkt
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

async function testAuthMethods() {
  console.log('🔍 Testing GridHub Authentication Methods...\n')

  // Get config
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

  // Minimal test payload
  const testPayload = {
    relation: {
      type: 'CONSUMER',
      firstName: 'Test',
      lastName: 'User',
      gender: 'MALE',
      phoneNumber: '0612345678',
      emailAddress: 'test@example.com',
      street: 'Teststraat',
      houseNumber: 1,
      postalCode: '1234AB',
      city: 'Amsterdam',
      country: 'NL',
      bankAccountType: 'IBAN',
      bankAccountNumber: 'NL91ABNA0417164300',
      paymentMethod: 'DIRECT_DEBIT',
      mandateDate: '2026-01-06',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: new Date().toISOString(),
    signType: 'DIGITAL',
    signSource: 'DIRECT_DEBIT_MANDATE',
    signIP: '127.0.0.1',
    signData: 'test',
  }

  console.log('Testing different authentication methods:\n')

  // Test 1: Basic Auth
  console.log('1️⃣ Testing Basic Auth...')
  const basicAuth = Buffer.from(`${apiConfig.api_username}:${password}`).toString('base64')
  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS! Basic Auth works!`)
      console.log(`   Response: ${responseText.substring(0, 200)}`)
      return { method: 'Basic', token: basicAuth }
    } else {
      console.log(`   ❌ Failed: ${responseText.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  // Test 2: Bearer with password
  console.log('\n2️⃣ Testing Bearer Auth with password...')
  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS! Bearer with password works!`)
      console.log(`   Response: ${responseText.substring(0, 200)}`)
      return { method: 'Bearer', token: password }
    } else {
      console.log(`   ❌ Failed: ${responseText.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  // Test 3: Bearer with username:password base64
  console.log('\n3️⃣ Testing Bearer Auth with base64(username:password)...')
  const bearerBase64 = Buffer.from(`${apiConfig.api_username}:${password}`).toString('base64')
  try {
    const response = await fetch(`${apiUrl}/orderrequests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bearerBase64}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    console.log(`   Status: ${response.status}`)
    
    if (response.ok) {
      console.log(`   ✅ SUCCESS! Bearer with base64 works!`)
      console.log(`   Response: ${responseText.substring(0, 200)}`)
      return { method: 'BearerBase64', token: bearerBase64 }
    } else {
      console.log(`   ❌ Failed: ${responseText.substring(0, 200)}`)
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`)
  }

  console.log('\n' + '='.repeat(60))
  console.log('❌ Geen werkende authenticatie methode gevonden')
  console.log('='.repeat(60) + '\n')
  
  return null
}

testAuthMethods().catch(console.error)

