import { NextResponse } from 'next/server'

/**
 * Test endpoint to check if CRON_SECRET is loaded
 * This helps debug env var loading issues
 */
export async function GET() {
  const cronSecret = process.env.CRON_SECRET
  
  return NextResponse.json({
    hasCronSecret: !!cronSecret,
    cronSecretLength: cronSecret?.length || 0,
    cronSecretPrefix: cronSecret ? cronSecret.substring(0, 5) + '...' : 'none',
    cronSecretSuffix: cronSecret ? '...' + cronSecret.substring(cronSecret.length - 5) : 'none',
    // Don't expose the full secret, but show enough to verify it's loaded
    matchesTestSecret: cronSecret === 'test-secret-123',
  })
}

