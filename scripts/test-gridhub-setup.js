#!/usr/bin/env node
/**
 * Test script om te verifiëren dat GridHub setup correct is
 * 
 * Usage: node scripts/test-gridhub-setup.js
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
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        process.env[key.trim()] = value
      }
    }
  })
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
  console.error('   Zet deze in .env.local of als environment variable')
  process.exit(1)
}

if (GRIDHUB_ENCRYPTION_KEY.length !== 64) {
  console.error('❌ Error: GRIDHUB_ENCRYPTION_KEY moet 64 hex characters zijn (32 bytes)')
  console.error(`   Huidige lengte: ${GRIDHUB_ENCRYPTION_KEY.length}`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Encryption functions (simplified version)
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

async function testGridHubSetup() {
  console.log('🔍 Testing GridHub Setup...\n')

  let allTestsPassed = true

  // Test 1: Check Energiek.nl leverancier
  console.log('1️⃣ Checking Energiek.nl leverancier...')
  const { data: leverancier, error: leverancierError } = await supabase
    .from('leveranciers')
    .select('id, naam, actief')
    .eq('naam', 'Energiek.nl')
    .single()

  if (leverancierError || !leverancier) {
    console.error('   ❌ Energiek.nl leverancier niet gevonden')
    allTestsPassed = false
  } else {
    console.log(`   ✅ Energiek.nl gevonden (ID: ${leverancier.id}, Actief: ${leverancier.actief})`)
  }

  // Test 2: Check GridHub API config
  console.log('\n2️⃣ Checking GridHub API config...')
  const { data: apiConfig, error: configError } = await supabase
    .from('leverancier_api_config')
    .select('*')
    .eq('leverancier_id', leverancier?.id)
    .eq('provider', 'GRIDHUB')
    .single()

  if (configError || !apiConfig) {
    console.error('   ❌ GridHub API config niet gevonden')
    allTestsPassed = false
  } else {
    console.log(`   ✅ GridHub config gevonden:`)
    console.log(`      - Environment: ${apiConfig.environment}`)
    console.log(`      - API URL: ${apiConfig.api_url}`)
    console.log(`      - API Username: ${apiConfig.api_username}`)
    console.log(`      - Actief: ${apiConfig.actief}`)
    console.log(`      - Product IDs: ${JSON.stringify(apiConfig.product_ids)}`)
    console.log(`      - Tariff IDs: ${JSON.stringify(apiConfig.tarief_ids)}`)

    // Test 3: Check password encryption
    console.log('\n3️⃣ Testing password encryption/decryption...')
    if (!apiConfig.api_password_encrypted) {
      console.error('   ❌ Geen encrypted password gevonden in config')
      allTestsPassed = false
    } else {
      try {
        const decrypted = decryptPassword(apiConfig.api_password_encrypted)
        console.log('   ✅ Password kan worden gedecrypteerd')
        console.log(`      - Encrypted length: ${apiConfig.api_password_encrypted.length} characters`)
        console.log(`      - Decrypted length: ${decrypted.length} characters`)
        console.log(`      - Decrypted starts with: ${decrypted.substring(0, 10)}...`)
        
        // Verify it's the correct password
        if (decrypted === '5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024') {
          console.log('   ✅ Decrypted password komt overeen met Energiek.nl API wachtwoord')
        } else {
          console.warn('   ⚠️  Decrypted password komt niet overeen met verwacht wachtwoord')
          console.warn('      Dit kan betekenen dat de encryption key niet klopt')
          allTestsPassed = false
        }
      } catch (error) {
        console.error('   ❌ Fout bij decrypten password:', error.message)
        allTestsPassed = false
      }
    }
  }

  // Test 4: Check contracts
  console.log('\n4️⃣ Checking Energiek.nl contracts...')
  const { data: contracten, error: contractenError } = await supabase
    .from('contracten')
    .select('id, naam, type, actief, target_audience')
    .eq('leverancier_id', leverancier?.id)

  if (contractenError) {
    console.error('   ❌ Fout bij ophalen contracten:', contractenError.message)
    allTestsPassed = false
  } else if (!contracten || contracten.length === 0) {
    console.error('   ❌ Geen contracten gevonden voor Energiek.nl')
    allTestsPassed = false
  } else {
    console.log(`   ✅ ${contracten.length} contract(en) gevonden:`)
    for (const contract of contracten) {
      console.log(`      - ${contract.naam} (${contract.type}, ${contract.target_audience || 'both'}, actief: ${contract.actief})`)
      
      // Check contract details
      if (contract.type === 'dynamisch') {
        const { data: details } = await supabase
          .from('contract_details_dynamisch')
          .select('opslag_elektriciteit, opslag_gas, vastrecht_stroom_maand, vastrecht_gas_maand')
          .eq('contract_id', contract.id)
          .single()
        
        if (details) {
          console.log(`        Opslag elektriciteit: €${details.opslag_elektriciteit}/kWh`)
          console.log(`        Opslag gas: €${details.opslag_gas}/m³`)
          console.log(`        Vastrecht stroom: €${details.vastrecht_stroom_maand}/maand`)
          console.log(`        Vastrecht gas: €${details.vastrecht_gas_maand}/maand`)
          
          if (details.opslag_elektriciteit === 0 && details.opslag_gas === 0) {
            console.warn('        ⚠️  Opslagen zijn 0 - moeten worden geconfigureerd!')
          } else {
            console.log('        ✅ Tarieven zijn geconfigureerd')
          }
        }
      }
    }
  }

  // Test 5: Check environment
  console.log('\n5️⃣ Checking environment configuration...')
  if (apiConfig?.environment === 'production') {
    console.log('   ✅ Environment is production')
    const tariefIds = apiConfig.tarief_ids
    if (tariefIds && tariefIds.production) {
      console.log(`   ✅ Production tariff ID: ${tariefIds.production}`)
    } else {
      console.error('   ❌ Production tariff ID niet gevonden')
      allTestsPassed = false
    }
  } else {
    console.warn(`   ⚠️  Environment is ${apiConfig?.environment} (niet production)`)
  }

  // Test 6: Check if contracts are visible in API
  console.log('\n6️⃣ Checking if contracts are visible via API...')
  try {
    const { data: actieveContracten } = await supabase
      .from('contracten')
      .select(`
        *,
        leverancier:leveranciers(*)
      `)
      .eq('actief', true)
      .eq('leverancier_id', leverancier?.id)

    const energiekContracten = actieveContracten?.filter(c => c.leverancier?.naam === 'Energiek.nl') || []
    if (energiekContracten.length > 0) {
      console.log(`   ✅ ${energiekContracten.length} Energiek.nl contract(en) zijn actief en zichtbaar via API`)
    } else {
      console.warn('   ⚠️  Geen actieve Energiek.nl contracten gevonden via API')
      allTestsPassed = false
    }
  } catch (error) {
    console.error('   ❌ Fout bij checken API zichtbaarheid:', error.message)
    allTestsPassed = false
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  if (allTestsPassed) {
    console.log('✅ ALLE TESTS GESLAAGD!')
    console.log('\n📋 Volgende stappen:')
    console.log('   1. Test een vergelijking op de website')
    console.log('   2. Test een aanvraag voor een Energiek.nl contract')
    console.log('   3. Check in /admin/aanvragen of GridHub integratie werkt')
    console.log('   4. Deploy naar Vercel (als nog niet gedaan)')
  } else {
    console.log('❌ SOMIGE TESTS GEFAALD!')
    console.log('\n⚠️  Check de errors hierboven en los ze op.')
  }
  console.log('='.repeat(60) + '\n')
}

testGridHubSetup().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

