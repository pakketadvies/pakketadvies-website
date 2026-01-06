#!/usr/bin/env node
/**
 * Test script om GridHub authenticatie te testen
 * 
 * Usage: node scripts/test-gridhub-auth.js
 */

// Load .env.local if it exists
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
  console.log('📁 Loaded .env.local')
}

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const GRIDHUB_ENCRYPTION_KEY = process.env.GRIDHUB_ENCRYPTION_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten zijn ingesteld')
  process.exit(1)
}

if (!GRIDHUB_ENCRYPTION_KEY) {
  console.error('❌ Error: GRIDHUB_ENCRYPTION_KEY environment variable niet gevonden')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Decrypt password function
function decryptPassword(encryptedPassword) {
  const key = Buffer.from(GRIDHUB_ENCRYPTION_KEY, 'hex')
  const parts = encryptedPassword.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted password format')
  }
  
  const [ivHex, authTagHex, encrypted] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

async function testGridHubAuth() {
  console.log('🔍 Testing GridHub Authentication...\n')

  // 1. Get Energiek.nl config
  console.log('1️⃣ Fetching Energiek.nl GridHub config...')
  const { data: leverancier } = await supabase
    .from('leveranciers')
    .select('id, naam')
    .eq('naam', 'Energiek.nl')
    .single()

  if (!leverancier) {
    console.error('❌ Energiek.nl leverancier niet gevonden')
    return
  }

  const { data: apiConfig } = await supabase
    .from('leverancier_api_config')
    .select('*')
    .eq('leverancier_id', leverancier.id)
    .eq('provider', 'GRIDHUB')
    .eq('actief', true)
    .single()

  if (!apiConfig) {
    console.error('❌ GridHub config niet gevonden')
    return
  }

  console.log(`   ✅ Config gevonden:`)
  console.log(`      - API URL: ${apiConfig.api_url}`)
  console.log(`      - Username: ${apiConfig.api_username}`)
  console.log(`      - Environment: ${apiConfig.environment}`)

  // 2. Decrypt password
  console.log('\n2️⃣ Decrypting password...')
  const password = decryptPassword(apiConfig.api_password_encrypted)
  console.log(`   ✅ Password decrypted (length: ${password.length})`)
  console.log(`      - Starts with: ${password.substring(0, 10)}...`)

  // 3. Test different login endpoints
  console.log('\n3️⃣ Testing login endpoints...')
  
  const baseUrl = apiConfig.api_url.replace('/api/external/v1', '')
  const endpoints = [
    { name: 'Standard login', url: `${baseUrl}/api/auth/login` },
    { name: 'Alternative login 1', url: `${baseUrl}/auth/login` },
    { name: 'Alternative login 2', url: `${apiConfig.api_url}/auth/login` },
    { name: 'Alternative login 3', url: `${baseUrl}/login` },
  ]

  for (const endpoint of endpoints) {
    console.log(`\n   Testing: ${endpoint.name}`)
    console.log(`   URL: ${endpoint.url}`)
    
    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: apiConfig.api_username,
          password: password,
        }),
      })

      console.log(`   Status: ${response.status} ${response.statusText}`)
      
      const responseText = await response.text()
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        responseData = { raw: responseText }
      }

      if (response.ok) {
        console.log(`   ✅ SUCCESS!`)
        console.log(`   Response:`, JSON.stringify(responseData, null, 2))
        
        // Check for token
        const token = responseData.token || responseData.accessToken || responseData.access_token || responseData.data?.token
        if (token) {
          console.log(`   ✅ Token found: ${token.substring(0, 20)}...`)
          return { success: true, endpoint: endpoint.url, token, response: responseData }
        } else {
          console.log(`   ⚠️  No token found in response`)
        }
      } else {
        console.log(`   ❌ Failed:`, JSON.stringify(responseData, null, 2))
      }
    } catch (error) {
      console.log(`   ❌ Error:`, error.message)
    }
  }

  // 4. Test Basic Auth
  console.log('\n4️⃣ Testing Basic Auth...')
  const basicAuth = Buffer.from(`${apiConfig.api_username}:${password}`).toString('base64')
  
  try {
    const response = await fetch(`${apiConfig.api_url}/orderrequests`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
      },
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)
    const responseText = await response.text()
    console.log(`   Response: ${responseText.substring(0, 200)}`)
    
    if (response.ok || response.status === 405) { // 405 = Method Not Allowed (but auth worked)
      console.log(`   ✅ Basic Auth might work!`)
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }

  // 5. Test Bearer with password directly
  console.log('\n5️⃣ Testing Bearer Auth with password as token...')
  try {
    const response = await fetch(`${apiConfig.api_url}/orderrequests`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${password}`,
        'Accept': 'application/json',
      },
    })

    console.log(`   Status: ${response.status} ${response.statusText}`)
    const responseText = await response.text()
    console.log(`   Response: ${responseText.substring(0, 200)}`)
    
    if (response.ok || response.status === 405) {
      console.log(`   ✅ Bearer with password might work!`)
    }
  } catch (error) {
    console.log(`   ❌ Error:`, error.message)
  }

  console.log('\n' + '='.repeat(60))
  console.log('📋 Test Summary:')
  console.log('   Check hierboven welke authenticatie methode werkt')
  console.log('='.repeat(60) + '\n')
}

testGridHubAuth().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

