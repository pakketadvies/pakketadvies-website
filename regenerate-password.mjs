#!/usr/bin/env node
import crypto from 'crypto'

const ENCRYPTION_KEY = 'a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761'
const stagingPassword = '751|4mEDu9Wy7Y68ygO724av7G8cYOnyYyDW4wjUzP6u17749a77'

function encryptPassword(password) {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return `${iv.toString('hex')}:${encrypted}`
}

const encrypted = encryptPassword(stagingPassword)
console.log('New encrypted password:')
console.log(encrypted)
console.log('\nUpdate SQL:')
console.log(`UPDATE leverancier_api_config SET api_password_encrypted = '${encrypted}' WHERE provider = 'GRIDHUB' AND environment = 'test';`)

