#!/usr/bin/env node
/**
 * Simple script to encrypt GridHub password
 * Usage: node scripts/encrypt-password-simple.js <password> <encryption_key>
 */

const crypto = require('crypto')

const password = process.argv[2]
const encryptionKey = process.argv[3]

if (!password || !encryptionKey) {
  console.error('Usage: node scripts/encrypt-password-simple.js <password> <encryption_key>')
  console.error('Encryption key must be 64 hex characters (32 bytes)')
  process.exit(1)
}

if (encryptionKey.length !== 64) {
  console.error('Error: Encryption key must be 64 hex characters (32 bytes)')
  console.error(`Current length: ${encryptionKey.length}`)
  process.exit(1)
}

try {
  const key = Buffer.from(encryptionKey, 'hex')
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted
  const result = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  
  console.log('\n✅ Password encrypted successfully!\n')
  console.log('Encrypted password:')
  console.log(result)
  console.log('\nSQL to update:')
  console.log(`UPDATE leverancier_api_config`)
  console.log(`SET api_password_encrypted = '${result}',`)
  console.log(`    actief = true,`)
  console.log(`    updated_at = NOW()`)
  console.log(`WHERE leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')`)
  console.log(`  AND provider = 'GRIDHUB';\n`)
} catch (error) {
  console.error('Error encrypting password:', error.message)
  process.exit(1)
}

