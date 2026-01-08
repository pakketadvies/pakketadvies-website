#!/usr/bin/env node
/**
 * Decrypt the ACTUAL password from Supabase to verify it's correct
 */
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = 'a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761'

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

// The encrypted password we just put in the database
const encryptedFromDB = '09c366ec463c012beb31eab1dce3b614:52246e3dc38e571e5542c8b12d6f12aa:16b6d57ce13d2811858849289705187ee3ecad9e541bec2bcb90390eed1c2b7e2a60391e5cca83ce5117c926b4a7c2d1bc04acab'

console.log('Decrypting password from database...')
const decrypted = decryptPassword(encryptedFromDB)

console.log('\nDecrypted password:')
console.log(`"${decrypted}"`)
console.log('\nLength:', decrypted.length)
console.log('Has newline at start:', decrypted.startsWith('\n'))
console.log('Has newline at end:', decrypted.endsWith('\n'))
console.log('First char code:', decrypted.charCodeAt(0))
console.log('Last char code:', decrypted.charCodeAt(decrypted.length - 1))

console.log('\nExpected:')
console.log('"751|4mEDu9Wy7Y68ygO724av7G8cYOnyYyDW4wjUzP6u17749a77"')

console.log('\nMatch:', decrypted === '751|4mEDu9Wy7Y68ygO724av7G8cYOnyYyDW4wjUzP6u17749a77')

