/**
 * Password Encryption for GridHub API Credentials
 * 
 * Uses AES-256-GCM encryption to securely store API passwords
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

/**
 * Get encryption key from environment variable
 * Must be 32 bytes (64 hex characters)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.GRIDHUB_ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('GRIDHUB_ENCRYPTION_KEY environment variable is not set')
  }
  
  if (key.length !== 64) {
    throw new Error('GRIDHUB_ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt a password for storage in database
 */
export function encryptPassword(password: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt a password from database
 */
export function decryptPassword(encryptedPassword: string): string {
  const key = getEncryptionKey()
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

