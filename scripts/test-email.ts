/**
 * Test script voor email functionaliteit
 * 
 * Gebruik:
 * 1. Zorg dat je een test aanvraag hebt in de database
 * 2. Run: npx tsx scripts/test-email.ts <aanvraagId> <aanvraagnummer>
 * 
 * Of gebruik de API endpoint:
 * curl -X POST http://localhost:3000/api/test-email \
 *   -H "Content-Type: application/json" \
 *   -d '{"aanvraagId": "...", "aanvraagnummer": "..."}'
 */

import { sendBevestigingEmail } from '../src/lib/send-email-internal'

async function testEmail() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('❌ Gebruik: npx tsx scripts/test-email.ts <aanvraagId> <aanvraagnummer>')
    console.error('   Of gebruik de API endpoint: POST /api/test-email')
    process.exit(1)
  }

  const [aanvraagId, aanvraagnummer] = args

  console.log('🧪 Testing email send...')
  console.log('   Aanvraag ID:', aanvraagId)
  console.log('   Aanvraagnummer:', aanvraagnummer)
  console.log('')

  try {
    const result = await sendBevestigingEmail(aanvraagId, aanvraagnummer)
    console.log('')
    console.log('✅ Email test successful!')
    console.log('   Result:', result)
  } catch (error: any) {
    console.error('')
    console.error('❌ Email test failed!')
    console.error('   Error:', error.message)
    if (error.stack) {
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  }
}

testEmail()

