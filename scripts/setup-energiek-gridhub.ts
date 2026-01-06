#!/usr/bin/env ts-node
/**
 * Script om Energiek.nl GridHub configuratie toe te voegen
 * 
 * Usage:
 *   GRIDHUB_ENCRYPTION_KEY=<key> npx ts-node scripts/setup-energiek-gridhub.ts
 * 
 * Dit script:
 * 1. Voegt Energiek.nl toe als leverancier (als deze nog niet bestaat)
 * 2. Encrypteert het API wachtwoord
 * 3. Voegt GridHub API configuratie toe
 */

import { createClient } from '@supabase/supabase-js'
import { encryptPassword } from '../src/lib/integrations/gridhub/encryption'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY moeten zijn ingesteld')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Energiek.nl configuratie
const ENERGIEK_CONFIG = {
  naam: 'Energiek.nl',
  website: 'https://www.energiek.nl',
  apiUrl: 'https://energiek.gridhub.cloud/api/external/v1',
  apiUsername: 'energiek', // API username (standaard, kan worden aangepast)
  apiPassword: '5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024',
  productIds: {
    particulier: '1',
    zakelijk: '5',
  },
  tariefIds: {
    test: '11',
    production: '37',
  },
  customerApprovalIds: [1, 2, 3],
  minStartdatumDagen: 20,
  minStartdatumInhuizingDagen: 3,
  automatischeIncassoVerplicht: true,
  webhookUrl: 'https://pakketadvies.nl/api/webhooks/gridhub',
}

async function setupEnergiek() {
  console.log('🚀 Starting Energiek.nl GridHub setup...\n')

  try {
    // 1. Check of Energiek.nl al bestaat
    console.log('1️⃣ Checking if Energiek.nl leverancier exists...')
    const { data: existingLeverancier, error: leverancierError } = await supabase
      .from('leveranciers')
      .select('id, naam')
      .eq('naam', ENERGIEK_CONFIG.naam)
      .single()

    let leverancierId: string

    if (existingLeverancier) {
      console.log(`   ✅ Energiek.nl bestaat al (ID: ${existingLeverancier.id})`)
      leverancierId = existingLeverancier.id
    } else {
      console.log('   ➕ Adding Energiek.nl as new leverancier...')
      const { data: newLeverancier, error: insertError } = await supabase
        .from('leveranciers')
        .insert({
          naam: ENERGIEK_CONFIG.naam,
          website: ENERGIEK_CONFIG.website,
          actief: true,
          volgorde: 100,
        })
        .select('id')
        .single()

      if (insertError || !newLeverancier) {
        throw new Error(`Failed to create leverancier: ${insertError?.message}`)
      }

      leverancierId = newLeverancier.id
      console.log(`   ✅ Energiek.nl toegevoegd (ID: ${leverancierId})`)
    }

    // 2. Encrypt password
    console.log('\n2️⃣ Encrypting API password...')
    const encryptedPassword = encryptPassword(ENERGIEK_CONFIG.apiPassword)
    console.log('   ✅ Password encrypted')

    // 3. Check of GridHub config al bestaat
    console.log('\n3️⃣ Checking if GridHub config exists...')
    const { data: existingConfig, error: configError } = await supabase
      .from('leverancier_api_config')
      .select('id')
      .eq('leverancier_id', leverancierId)
      .eq('provider', 'GRIDHUB')
      .single()

    if (existingConfig) {
      console.log('   ⚠️  GridHub config bestaat al. Updating...')
      const { error: updateError } = await supabase
        .from('leverancier_api_config')
        .update({
          api_url: ENERGIEK_CONFIG.apiUrl,
          api_username: ENERGIEK_CONFIG.apiUsername,
          api_password_encrypted: encryptedPassword,
          product_ids: ENERGIEK_CONFIG.productIds,
          tarief_ids: ENERGIEK_CONFIG.tariefIds,
          customer_approval_ids: ENERGIEK_CONFIG.customerApprovalIds,
          min_startdatum_dagen: ENERGIEK_CONFIG.minStartdatumDagen,
          min_startdatum_inhuizing_dagen: ENERGIEK_CONFIG.minStartdatumInhuizingDagen,
          automatische_incasso_verplicht: ENERGIEK_CONFIG.automatischeIncassoVerplicht,
          webhook_url: ENERGIEK_CONFIG.webhookUrl,
          actief: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConfig.id)

      if (updateError) {
        throw new Error(`Failed to update config: ${updateError.message}`)
      }
      console.log('   ✅ GridHub config updated')
    } else {
      console.log('   ➕ Adding GridHub config...')
      const { error: insertError } = await supabase
        .from('leverancier_api_config')
        .insert({
          leverancier_id: leverancierId,
          provider: 'GRIDHUB',
          environment: 'test', // Start with test
          api_url: ENERGIEK_CONFIG.apiUrl,
          api_username: ENERGIEK_CONFIG.apiUsername,
          api_password_encrypted: encryptedPassword,
          product_ids: ENERGIEK_CONFIG.productIds,
          tarief_ids: ENERGIEK_CONFIG.tariefIds,
          customer_approval_ids: ENERGIEK_CONFIG.customerApprovalIds,
          min_startdatum_dagen: ENERGIEK_CONFIG.minStartdatumDagen,
          min_startdatum_inhuizing_dagen: ENERGIEK_CONFIG.minStartdatumInhuizingDagen,
          automatische_incasso_verplicht: ENERGIEK_CONFIG.automatischeIncassoVerplicht,
          webhook_enabled: true,
          webhook_url: ENERGIEK_CONFIG.webhookUrl,
          actief: true,
        })

      if (insertError) {
        throw new Error(`Failed to create config: ${insertError.message}`)
      }
      console.log('   ✅ GridHub config toegevoegd')
    }

    console.log('\n✅ Setup compleet!')
    console.log('\n📋 Volgende stappen:')
    console.log('   1. Check of Energiek.nl verschijnt in /admin/leveranciers')
    console.log('   2. Voeg contracten toe voor Energiek.nl in /admin/contracten')
    console.log('   3. Test een aanvraag om te verifiëren dat GridHub integratie werkt')
    console.log('   4. Zet environment naar "production" zodra alles werkt\n')

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

setupEnergiek()

