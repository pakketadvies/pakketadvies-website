import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'

export type OidcDiscovery = {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  jwks_uri: string
  userinfo_endpoint?: string
}

let discoveryCache: { key: string; value: OidcDiscovery } | null = null

function base64Url(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function createPkcePair() {
  const verifier = base64Url(randomBytes(32))
  const challenge = base64Url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge }
}

export function createState() {
  return base64Url(randomBytes(24))
}

export function createNonce() {
  return base64Url(randomBytes(24))
}

export function getIdinDiscoveryUrl() {
  const explicit = process.env.IDIN_DISCOVERY_URL?.trim()
  if (explicit) return explicit

  const issuer = process.env.IDIN_ISSUER_URL?.trim()
  if (!issuer) return null

  // Allow passing either issuer base or a full discovery URL
  if (issuer.includes('/.well-known/openid-configuration')) return issuer
  return issuer.replace(/\/+$/g, '') + '/.well-known/openid-configuration'
}

export async function fetchOidcDiscovery(): Promise<OidcDiscovery> {
  const url = getIdinDiscoveryUrl()
  if (!url) throw new Error('Missing IDIN_DISCOVERY_URL or IDIN_ISSUER_URL')

  if (discoveryCache?.key === url) return discoveryCache.value

  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`Failed to fetch OIDC discovery (${res.status})`)
  }
  const json = (await res.json()) as OidcDiscovery
  if (!json?.authorization_endpoint || !json?.token_endpoint || !json?.jwks_uri || !json?.issuer) {
    throw new Error('Invalid OIDC discovery response')
  }

  discoveryCache = { key: url, value: json }
  return json
}

type SignedPayload = { payloadB64: string; sigB64: string }

export function signPayload(payload: unknown, secret: string): string {
  const payloadB64 = base64Url(Buffer.from(JSON.stringify(payload), 'utf8'))
  const sig = createHmac('sha256', secret).update(payloadB64).digest()
  const sigB64 = base64Url(sig)
  const packed: SignedPayload = { payloadB64, sigB64 }
  return base64Url(Buffer.from(JSON.stringify(packed), 'utf8'))
}

export function verifyPayload<T>(packedB64: string, secret: string): T | null {
  try {
    const packedJson = Buffer.from(packedB64, 'base64').toString('utf8')
    const packed = JSON.parse(packedJson) as SignedPayload
    if (!packed?.payloadB64 || !packed?.sigB64) return null

    const expectedSig = createHmac('sha256', secret).update(packed.payloadB64).digest()
    const expectedSigB64 = base64Url(expectedSig)

    const a = Buffer.from(packed.sigB64, 'utf8')
    const b = Buffer.from(expectedSigB64, 'utf8')
    if (a.length !== b.length) return null
    if (!timingSafeEqual(a, b)) return null

    const payloadJson = Buffer.from(packed.payloadB64, 'base64').toString('utf8')
    return JSON.parse(payloadJson) as T
  } catch {
    return null
  }
}


