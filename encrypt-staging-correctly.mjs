#!/usr/bin/env node
/**
 * Encrypt GridHub staging password using CORRECT algorithm (AES-256-GCM)
 * Matches the production encryption exactly
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const ENCRYPTION_KEY = 'a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761'
const STAGING_PASSWORD = '751|4mEDu9Wy7Y68ygO724av7G8cYOnyYyDW4wjUzP6u17749a77'

function encryptPassword(password) {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted (3 parts!)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

function decryptPassword(encryptedPassword) {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const parts = encryptedPassword.split(':')
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted password format')
  }
  
  const [ivHex, authTagHex, encrypted] = parts
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

console.log('='.repeat(60))
console.log('TESTING ENCRYPTION/DECRYPTION')
console.log('='.repeat(60))

// First test: decrypt production password to verify our function works
console.log('\n1. Testing with PRODUCTION password...')
const productionEncrypted = '10d1d32c87c888cc457c5e5d494ed678:3d0508adabe25adca5f59a3cb115ac8c:6827de13c864b6b15fc7392e357dc080b1152d2b93c8507e04484b52353677f4a98e1f480db2118d7c8739d6a3d78e65288ccebcb2'

try {
  const productionDecrypted = decryptPassword(productionEncrypted)
  console.log('✅ Production password decrypted successfully!')
  console.log('   Length:', productionDecrypted.length)
  console.log('   First 10 chars:', productionDecrypted.substring(0, 10))
} catch (error) {
  console.error('❌ Failed to decrypt production password:', error.message)
  process.exit(1)
}

// Now encrypt staging password
console.log('\n2. Encrypting STAGING password...')
const stagingEncrypted = encryptPassword(STAGING_PASSWORD)
console.log('✅ Staging password encrypted!')
console.log('   Format:', stagingEncrypted.split(':').length, 'parts (should be 3)')
console.log('   Length:', stagingEncrypted.length)

// Test decrypt to verify it works
console.log('\n3. Verifying by decrypting staging password...')
try {
  const stagingDecrypted = decryptPassword(stagingEncrypted)
  if (stagingDecrypted === STAGING_PASSWORD) {
    console.log('✅ Staging password verified! Encryption/decryption works perfectly!')
  } else {
    console.error('❌ Decrypted password does not match original!')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Failed to decrypt staging password:', error.message)
  process.exit(1)
}

console.log('\n' + '='.repeat(60))
console.log('ENCRYPTED STAGING PASSWORD (ready to use):')
console.log('='.repeat(60))
console.log(stagingEncrypted)
console.log('\n' + '='.repeat(60))
console.log('UPDATE SQL:')
console.log('='.repeat(60))
console.log(`UPDATE leverancier_api_config SET api_password_encrypted = '${stagingEncrypted}' WHERE provider = 'GRIDHUB' AND environment = 'test';`)
console.log('='.repeat(60))

