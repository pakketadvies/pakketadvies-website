#!/usr/bin/env node
/**
 * Test verschillende field name varianten voor agreedAdvancePaymentAmount
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
    <rect width="500" height="150" fill="white" stroke="#000" stroke-width="2" rx="4"/>
    <text x="10" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#000">Digitale Handtekening</text>
    <line x1="10" y1="30" x2="490" y2="30" stroke="#000" stroke-width="1"/>
    <text x="10" y="55" font-family="Arial, sans-serif" font-size="14" fill="#000">Naam: ${name}</text>
    <text x="10" y="80" font-family="Arial, sans-serif" font-size="14" fill="#000">Email: ${email}</text>
    <text x="10" y="105" font-family="Arial, sans-serif" font-size="14" fill="#000">Datum: ${date}</text>
    <text x="10" y="130" font-family="Arial, sans-serif" font-size="12" fill="#666">Aanvraagnummer: ${aanvraagnummer}</text>
  </svg>`
  return Buffer.from(svg).toString('base64')
}

async function testFieldNameVariants() {
  console.log('🧪 Test verschillende field name varianten...\n')

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

  const basePayload = {
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
  }

  // Test verschillende field name varianten
  const fieldNameVariants = [
    {
      name: 'camelCase (huidig)',
      electricity: 'agreedAdvancePaymentAmountElectricity',
      gas: 'agreedAdvancePaymentAmountGas',
    },
    {
      name: 'snake_case',
      electricity: 'agreed_advance_payment_amount_electricity',
      gas: 'agreed_advance_payment_amount_gas',
    },
    {
      name: 'PascalCase',
      electricity: 'AgreedAdvancePaymentAmountElectricity',
      gas: 'AgreedAdvancePaymentAmountGas',
    },
    {
      name: 'ALL_CAPS',
      electricity: 'AGREED_ADVANCE_PAYMENT_AMOUNT_ELECTRICITY',
      gas: 'AGREED_ADVANCE_PAYMENT_AMOUNT_GAS',
    },
    {
      name: 'kebab-case',
      electricity: 'agreed-advance-payment-amount-electricity',
      gas: 'agreed-advance-payment-amount-gas',
    },
    {
      name: 'Zonder "Agreed" prefix',
      electricity: 'advancePaymentAmountElectricity',
      gas: 'advancePaymentAmountGas',
    },
    {
      name: 'Alleen "amount"',
      electricity: 'amountElectricity',
      gas: 'amountGas',
    },
  ]

  for (const variant of fieldNameVariants) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`Test: ${variant.name}`)
    console.log(`  Electricity field: ${variant.electricity}`)
    console.log(`  Gas field: ${variant.gas}`)
    console.log('='.repeat(60))

    const requestedConnection = {
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
    }

    // Voeg fields toe met de variant naam
    requestedConnection[variant.electricity] = '100.00'
    requestedConnection[variant.gas] = '0.00'

    const payload = {
      ...basePayload,
      requestedConnections: [requestedConnection],
    }

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
        console.log('✅ SUCCESS! Deze field names werken!')
        console.log('   Response:', JSON.stringify(responseData, null, 2))
        return
      } else {
        const hasAdvancePaymentErrors = 
          responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountElectricity'] ||
          responseData.errors?.['requestedConnections.agreedAdvancePaymentAmountGas']
        
        if (!hasAdvancePaymentErrors) {
          console.log('✅ Geen errors voor agreedAdvancePaymentAmount fields!')
          console.log('   Alle errors:', JSON.stringify(responseData.errors, null, 2))
        } else {
          console.log('❌ Nog steeds errors voor agreedAdvancePaymentAmount')
        }
      }
    } catch (error) {
      console.log(`❌ Exception: ${error.message}`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Test Complete')
  console.log('='.repeat(60))
}

testFieldNameVariants().catch(console.error)

