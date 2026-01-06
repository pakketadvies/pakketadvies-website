#!/usr/bin/env node
/**
 * Test script om toegestane enum waarden te vinden voor GridHub
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

async function testEnumValues() {
  console.log('🔍 Testing GridHub Enum Values...\n')

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

  // Test verschillende enum waarden
  const paymentMethods = ['DIRECT_DEBIT', 'SEPA_DIRECT_DEBIT', 'AUTOMATIC_COLLECTION', 'DIRECTDEBIT', 'SEPA']
  const signTypes = ['DIGITAL', 'EMAIL', 'SMS', 'PAPER', 'DIGITAAL', 'ELEKTRONISCH']
  const signSources = ['DIRECT_DEBIT_MANDATE', 'MANDATE', 'SEPA_MANDATE', 'CONTRACT', 'FORM']

  // Base payload
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
      mandateDate: '2026-01-06',
      mandateReference: 'TEST-REF-001',
    },
    requestedConnections: [{
      postalCode: '1234AB',
      houseNumber: 1,
      hasElectricity: true,
      hasGas: false,
      customerApprovalLEDs: true,
      expectedAdvancePaymentAmountElectricity: '100.00', // Probeer expectedAdvancePaymentAmount
      expectedAdvancePaymentAmountGas: '0.00',
    }],
    productID: '1',
    tariffID: '37',
    customerApprovalIDs: [1, 2, 3],
    signTimestamp: formatDateTime(now),
    signIP: '127.0.0.1',
    signData: 'mandate',
    originalCreateTimestamp: formatDateTime(now),
    expectedAdvancePaymentAmount: '100.00', // Probeer expectedAdvancePaymentAmount
  }

  // Test paymentMethod
  console.log('1️⃣ Testing paymentMethod values...')
  for (const pm of paymentMethods) {
    const payload = { ...basePayload }
    payload.relation.paymentMethod = pm
    payload.relation.signType = 'EMAIL' // Gebruik EMAIL als default
    payload.relation.signSource = 'MANDATE' // Gebruik MANDATE als default

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

      if (!responseData.errors?.relation?.paymentMethod) {
        console.log(`   ✅ paymentMethod: "${pm}" is VALID!`)
        basePayload.relation.paymentMethod = pm
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test signType
  console.log('\n2️⃣ Testing signType values...')
  for (const st of signTypes) {
    const payload = { ...basePayload }
    payload.relation.signType = st

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
        basePayload.signType = st
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test signSource
  console.log('\n3️⃣ Testing signSource values...')
  for (const ss of signSources) {
    const payload = { ...basePayload }
    payload.signSource = ss

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
        basePayload.signSource = ss
        break
      }
    } catch (error) {
      // Continue
    }
  }

  // Test advance payment amount field names
  console.log('\n4️⃣ Testing advance payment amount field names...')
  const fieldNames = [
    { electricity: 'agreedAdvancePaymentAmountElectricity', gas: 'agreedAdvancePaymentAmountGas', total: 'agreedAdvancePaymentAmount' },
    { electricity: 'expectedAdvancePaymentAmountElectricity', gas: 'expectedAdvancePaymentAmountGas', total: 'expectedAdvancePaymentAmount' },
    { electricity: 'advancePaymentAmountElectricity', gas: 'advancePaymentAmountGas', total: 'advancePaymentAmount' },
  ]

  for (const fields of fieldNames) {
    const payload = { ...basePayload }
    delete payload.requestedConnections[0].expectedAdvancePaymentAmountElectricity
    delete payload.requestedConnections[0].expectedAdvancePaymentAmountGas
    delete payload.expectedAdvancePaymentAmount

    payload.requestedConnections[0][fields.electricity] = '100.00'
    payload.requestedConnections[0][fields.gas] = '0.00'
    payload[fields.total] = '100.00'

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
        console.log(`   ✅ Field names: "${fields.electricity}", "${fields.gas}", "${fields.total}" are VALID!`)
        break
      }
    } catch (error) {
      // Continue
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Test Complete')
  console.log('='.repeat(60) + '\n')
}

testEnumValues().catch(console.error)

