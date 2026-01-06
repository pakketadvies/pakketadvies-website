#!/usr/bin/env ts-node
/**
 * Script om GridHub API wachtwoord te encrypten
 * 
 * Usage:
 *   GRIDHUB_ENCRYPTION_KEY=<key> npx ts-node scripts/encrypt-gridhub-password.ts <password>
 * 
 * Of via .env.local:
 *   npx ts-node scripts/encrypt-gridhub-password.ts <password>
 */

import { encryptPassword } from '../src/lib/integrations/gridhub/encryption'

const password = process.argv[2]
const encryptionKey = process.env.GRIDHUB_ENCRYPTION_KEY

if (!password) {
  console.error('❌ Error: Geen wachtwoord opgegeven')
  console.error('Usage: GRIDHUB_ENCRYPTION_KEY=<key> npx ts-node scripts/encrypt-gridhub-password.ts <password>')
  process.exit(1)
}

if (!encryptionKey) {
  console.error('❌ Error: GRIDHUB_ENCRYPTION_KEY environment variable niet gevonden')
  console.error('Zet deze in .env.local of geef deze mee als environment variable')
  process.exit(1)
}

if (encryptionKey.length !== 64) {
  console.error('❌ Error: GRIDHUB_ENCRYPTION_KEY moet 64 hex characters zijn (32 bytes)')
  console.error(`Huidige lengte: ${encryptionKey.length}`)
  process.exit(1)
}

try {
  const encrypted = encryptPassword(password)
  console.log('\n✅ Wachtwoord succesvol geëncrypteerd!\n')
  console.log('Gebruik deze waarde in de database:\n')
  console.log(encrypted)
  console.log('\nSQL om te updaten:\n')
  console.log(`UPDATE leverancier_api_config`)
  console.log(`SET api_password_encrypted = '${encrypted}',`)
  console.log(`    actief = true,`)
  console.log(`    updated_at = NOW()`)
  console.log(`WHERE leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')`)
  console.log(`  AND provider = 'GRIDHUB';\n`)
} catch (error: any) {
  console.error('❌ Error bij encrypten:', error.message)
  process.exit(1)
}

