/**
 * Quick script to update recent prices via API
 * 
 * Usage:
 *   npx ts-node scripts/update-prices-now.ts
 */

async function main() {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://pakketadvies.nl'

  console.log('🔄 Updating recent prices via API...')
  console.log(`   API URL: ${baseUrl}/api/energieprijzen/update-recent`)
  console.log('')

  try {
    const response = await fetch(`${baseUrl}/api/energieprijzen/update-recent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.success) {
      console.log('✅ Update completed!')
      console.log('')
      console.log('📊 Summary:')
      console.log(`   Total: ${data.summary.total}`)
      console.log(`   ✅ Success: ${data.summary.success}`)
      console.log(`   ❌ Failed: ${data.summary.failed}`)
      console.log('')
      console.log('📅 Results:')
      data.results.forEach((result: any) => {
        if (result.success) {
          console.log(`   ✅ ${result.date}: Elec €${result.electricity.toFixed(5)}/kWh, Gas €${result.gas.toFixed(5)}/m³`)
        } else {
          console.log(`   ❌ ${result.date}: ${result.error}`)
        }
      })
    } else {
      console.error('❌ Update failed:', data.error)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()

