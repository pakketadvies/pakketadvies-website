/**
 * Rate Limiter voor API routes
 * Gebruikt in-memory storage (Vercel Edge Functions compatible)
 * 
 * In productie: Overweeg Redis of Vercel Edge Config voor persistentie
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (werkt per server instance)
// In productie: gebruik Redis of Vercel Edge Config
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup oude entries elke 5 minuten
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000) // 5 minuten
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

/**
 * Check rate limit voor een IP adres
 * @param ip - IP adres van de client
 * @param maxRequests - Maximum aantal requests
 * @param windowMs - Tijdvenster in milliseconden
 * @returns RateLimitResult
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 3600000 // 1 uur
): RateLimitResult {
  const now = Date.now()
  const key = `rate_limit:${ip}`
  
  const entry = rateLimitStore.get(key)
  
  // Geen entry of window is verlopen
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    })
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    }
  }
  
  // Entry bestaat, check count
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: `Te veel aanvragen. Probeer het over ${Math.ceil((entry.resetTime - now) / 60000)} minuten opnieuw.`
    }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * Haal IP adres op uit request headers
 */
export function getClientIP(request: Request): string {
  // Check verschillende headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for kan meerdere IPs bevatten (client, proxy1, proxy2)
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback
  return 'unknown'
}

