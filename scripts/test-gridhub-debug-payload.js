#!/usr/bin/env node
/**
 * Debug script om exact te zien wat er wordt verstuurd naar GridHub
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

async function debugPayload() {
  console.log('🔍 Debug: Exact Payload Test...\n')

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

  // Test ALLE mogelijke combinaties systematisch
  console.log('Testing ALL possible combinations...\n')

  const paymentMethods = ['SEPA_DIRECT_DEBIT', 'DIRECT_DEBIT', 'SEPA', 'AUTOMATIC_COLLECTION']
  const signTypes = ['EMAIL', 'SMS', 'PAPER', 'DIGITAL', 'DIGITAAL', 'ELEKTRONISCH', 'ONLINE', 'WEB', 'FORM', '1', '2', '3']
  const signDataOptions = ['sepa', 'SEPA', 'sepa-mandate', 'sepa mandate', 'sepa_direct_debit', 'sepa-direct-debit', 'sepa direct debit', 'sepa_incasso', 'sepa-incasso', 'direct-debit-sepa', 'mandate-sepa', 'mandate sepa', 'sepa-test', 'test-sepa']

  let bestResult = null
  let minErrors = Infinity

  for (const pm of paymentMethods) {
    for (const st of signTypes) {
      for (const sd of signDataOptions) {
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
            paymentMethod: pm,
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
          signType: st,
          signSource: 'EMAIL',
          signIP: '127.0.0.1',
          signData: sd,
          originalCreateTimestamp: formatDateTime(now),
          agreedAdvancePaymentAmount: '100.00',
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
            console.log('✅ SUCCESS!')
            console.log(`   paymentMethod: "${pm}"`)
            console.log(`   signType: "${st}"`)
            console.log(`   signData: "${sd}"`)
            console.log('   Response:', JSON.stringify(responseData, null, 2))
            return
          } else {
            const errorCount = Object.keys(responseData.errors || {}).length
            if (errorCount < minErrors) {
              minErrors = errorCount
              bestResult = {
                paymentMethod: pm,
                signType: st,
                signData: sd,
                errors: responseData.errors,
                errorCount,
              }
            }
          }
        } catch (error) {
          // Continue
        }
      }
    }
  }

  if (bestResult) {
    console.log('\n📊 Best Result (minste errors):')
    console.log(`   paymentMethod: "${bestResult.paymentMethod}"`)
    console.log(`   signType: "${bestResult.signType}"`)
    console.log(`   signData: "${bestResult.signData}"`)
    console.log(`   Error count: ${bestResult.errorCount}`)
    console.log('   Errors:', JSON.stringify(bestResult.errors, null, 2))
  }
}

debugPayload().catch(console.error)

