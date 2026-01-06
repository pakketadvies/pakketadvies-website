#!/usr/bin/env node
/**
 * Grondige test van agreedAdvancePaymentAmountElectricity en agreedAdvancePaymentAmountGas
 * Test alle mogelijke combinaties: types, locaties, waarden
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

function generateSignatureSVG(name, email, date, aanvraagnummer) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="150" viewBox="0 0 500 150">
    <rect width="500" height="150" fill="white" stroke="black" stroke-width="2"/>
    <text x="10" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="black">Digitale Handtekening</text>
    <text x="10" y="50" font-family="Arial, sans-serif" font-size="14" fill="black">Naam: ${name}</text>
    <text x="10" y="75" font-family="Arial, sans-serif" font-size="14" fill="black">Email: ${email}</text>
    <text x="10" y="100" font-family="Arial, sans-serif" font-size="14" fill="black">Datum: ${date}</text>
    <text x="10" y="125" font-family="Arial, sans-serif" font-size="12" fill="gray">Aanvraagnummer: ${aanvraagnummer}</text>
    <line x1="10" y1="130" x2="490" y2="130" stroke="black" stroke-width="1"/>
  </svg>`
  return Buffer.from(svg).toString('base64')
}

async function testAdvancePaymentThorough() {
  console.log('🧪 Grondige test van agreedAdvancePaymentAmount fields...\n')

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
  const signData = generateSignatureSVG('Jan Jansen', 'jan@example.com', now.toISOString().split('T')[0], 'TEST-001')

  // Test cases voor agreedAdvancePaymentAmount fields
  const testCases = [
    {
      name: 'Test 1: String "100.00" en "0.00" in requestedConnections',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
          mandateDate: '2026-01-06',
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
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
    {
      name: 'Test 2: Number 100.00 en 0.00 in requestedConnections',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
          mandateDate: '2026-01-06',
        },
        requestedConnections: [{
          postalCode: '1234AB',
          houseNumber: 1,
          hasElectricity: true,
          hasGas: false,
          customerApprovalLEDs: true,
          agreedAdvancePaymentAmountElectricity: 100.00,
          agreedAdvancePaymentAmountGas: 0.00,
        }],
        productID: '1',
        tariffID: '37',
        customerApprovalIDs: [1, 2, 3],
        signTimestamp: formatDateTime(now),
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
    {
      name: 'Test 3: String "100" en "0" (zonder decimalen)',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
          mandateDate: '2026-01-06',
        },
        requestedConnections: [{
          postalCode: '1234AB',
          houseNumber: 1,
          hasElectricity: true,
          hasGas: false,
          customerApprovalLEDs: true,
          agreedAdvancePaymentAmountElectricity: '100',
          agreedAdvancePaymentAmountGas: '0',
        }],
        productID: '1',
        tariffID: '37',
        customerApprovalIDs: [1, 2, 3],
        signTimestamp: formatDateTime(now),
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
    {
      name: 'Test 4: Zonder agreedAdvancePaymentAmount in requestedConnections, alleen op root',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
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
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
    {
      name: 'Test 5: Met beide elektriciteit EN gas (50/50 split)',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
          mandateDate: '2026-01-06',
        },
        requestedConnections: [{
          postalCode: '1234AB',
          houseNumber: 1,
          hasElectricity: true,
          hasGas: true,
          customerApprovalLEDs: true,
          agreedAdvancePaymentAmountElectricity: '50.00',
          agreedAdvancePaymentAmountGas: '50.00',
        }],
        productID: '1',
        tariffID: '37',
        customerApprovalIDs: [1, 2, 3],
        signTimestamp: formatDateTime(now),
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
    {
      name: 'Test 6: Field names met verschillende case (camelCase vs snake_case)',
      payload: {
        relation: {
          type: 'CONSUMER',
          firstName: 'Jan',
          lastName: 'Jansen',
          gender: 'MALE',
          phoneNumber: '0612345678',
          emailAddress: 'jan@example.com',
          street: 'Hoofdstraat',
          houseNumber: 1,
          postalCode: '1234AB',
          city: 'Amsterdam',
          country: 'NL',
          bankAccountType: 'IBAN',
          bankAccountNumber: 'NL91ABNA0417164300',
          paymentMethod: 'AUTOMATICCOLLECTION',
          mandateDate: '2026-01-06',
        },
        requestedConnections: [{
          postalCode: '1234AB',
          houseNumber: 1,
          hasElectricity: true,
          hasGas: false,
          customerApprovalLEDs: true,
          // Test met snake_case
          'agreed_advance_payment_amount_electricity': '100.00',
          'agreed_advance_payment_amount_gas': '0.00',
        }],
        productID: '1',
        tariffID: '37',
        customerApprovalIDs: [1, 2, 3],
        signTimestamp: formatDateTime(now),
        signType: 'ESIGNATURE',
        signSource: 'EMAIL',
        signIP: '127.0.0.1',
        signData: signData,
        originalCreateTimestamp: formatDateTime(now),
        agreedAdvancePaymentAmount: '100.00',
      },
    },
  ]

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(testCase.name)
    console.log('='.repeat(60))

    try {
      const response = await fetch(`${apiUrl}/orderrequests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      })

      const responseText = await response.text()
      const responseData = JSON.parse(responseText)

      if (response.ok) {
        console.log('✅ SUCCESS!')
        console.log('   Response:', JSON.stringify(responseData, null, 2))
        console.log('\n🎉 Deze combinatie werkt! Gebruik deze configuratie.')
        return
      } else {
        console.log(`❌ Error: ${response.status}`)
        const errorCount = Object.keys(responseData.errors || {}).length
        console.log(`   Aantal errors: ${errorCount}`)
        
        // Check specifiek voor agreedAdvancePaymentAmount errors
        const hasAdvancePaymentErrors = 
          responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountElectricity'] ||
          responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountGas']
        
        if (!hasAdvancePaymentErrors) {
          console.log('   ✅ Geen errors voor agreedAdvancePaymentAmount fields!')
        } else {
          console.log('   ❌ Errors voor agreedAdvancePaymentAmount:')
          if (responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountElectricity']) {
            console.log('      - Electricity:', responseData.errors['requestedConnections.agreedAdvancePaymentAmountElectricity'])
          }
          if (responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountGas']) {
            console.log('      - Gas:', responseData.errors['requestedConnections.agreedAdvancePaymentAmountGas'])
          }
        }
        
        // Toon alle errors
        if (errorCount > 0) {
          console.log('   Alle errors:', JSON.stringify(responseData.errors, null, 2))
        }
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`)
    }

    // Wacht even tussen tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Test Complete - Geen werkende combinatie gevonden')
  console.log('='.repeat(60))
}

testAdvancePaymentThorough().catch(console.error)

