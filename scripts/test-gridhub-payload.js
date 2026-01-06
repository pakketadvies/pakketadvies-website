#!/usr/bin/env node
/**
 * Test script om GridHub payload validatie te testen
 * Test alle validatiefouten en fix ze een voor een
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

// Helper to format date as Y-m-d H:i:s
function formatDateTime(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

async function testPayload() {
  console.log('🔍 Testing GridHub Payload Validation...\n')

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

  // Test payload met alle fixes
  const now = new Date()
  const testPayload = {
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
      bankAccountNumber: 'NL91ABNA0417164300', // Valid IBAN
      paymentMethod: 'DIRECT_DEBIT', // Moet exact deze waarde zijn
      mandateDate: '2026-01-06',
      mandateReference: 'TEST-REF-001',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
      agreedAdvancePaymentAmountElectricity: '100.00', // Verplicht
      agreedAdvancePaymentAmountGas: '0.00', // Verplicht, ook als geen gas
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: formatDateTime(now), // Y-m-d H:i:s format
    signType: 'DIGITAL', // Moet exact deze waarde zijn
    signSource: 'DIRECT_DEBIT_MANDATE', // Moet exact deze waarde zijn
    signIP: '127.0.0.1',
    signData: 'test-signature-data', // Moet bepaalde waarde bevatten
    originalCreateTimestamp: formatDateTime(now), // Verplicht, Y-m-d H:i:s format
    agreedAdvancePaymentAmount: '100.00', // Verplicht
  }

  console.log('📤 Sending test payload...')
  console.log('Payload:', JSON.stringify(testPayload, null, 2))

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
    console.log(`\n📥 Response Status: ${response.status}`)
    
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    if (response.ok) {
      console.log('✅ SUCCESS! Payload is valid!')
      console.log('Response:', JSON.stringify(responseData, null, 2))
    } else {
      console.log('❌ Validation errors:')
      console.log(JSON.stringify(responseData, null, 2))
      
      // Analyseer de errors
      if (responseData.errors) {
        console.log('\n📋 Error Analysis:')
        Object.keys(responseData.errors).forEach(key => {
          console.log(`   - ${key}: ${responseData.errors[key].join(', ')}`)
        })
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testPayload().catch(console.error)

