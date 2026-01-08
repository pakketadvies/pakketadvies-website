#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ENCRYPTION_KEY = 'a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761'

const ALGORITHM = 'aes-256-gcm'

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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const { data, error } = await supabase
  .from('leverancier_api_config')
  .select('*')
  .eq('provider', 'GRIDHUB')
  .eq('environment', 'production')
  .single()

if (error) {
  console.error('Error:', error)
  process.exit(1)
}

console.log('\n📋 PRODUCTION GridHub Config:\n')
console.log('Environment:', data.environment)
console.log('Username:', data.api_username)
console.log('URL:', data.api_url)
console.log('Active:', data.actief)
console.log('Product IDs:', JSON.stringify(data.product_ids))
console.log('Tariff IDs:', JSON.stringify(data.tarief_ids))
console.log('Customer Approval IDs:', data.customer_approval_ids)
console.log('\nEncrypted password length:', data.api_password_encrypted.length)

try {
  const decrypted = decryptPassword(data.api_password_encrypted)
  console.log('Decrypted password:', decrypted.substring(0, 10) + '...' + decrypted.substring(decrypted.length - 5))
  console.log('Password length:', decrypted.length)
} catch (err) {
  console.log('Could not decrypt:', err.message)
}

