#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxztyhwiwgrxjnlohapm.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_KEY) {
  console.error('Need SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const { data, error } = await supabase
  .from('leverancier_api_config')
  .select('environment, api_username, api_url')
  .eq('provider', 'GRIDHUB')
  .order('environment')

if (error) {
  console.error('Error:', error)
  process.exit(1)
}

console.log('\n📋 GridHub Configs:\n')
data.forEach(config => {
  console.log(`${config.environment.toUpperCase()}:`)
  console.log(`  Username: ${config.api_username}`)
  console.log(`  URL: ${config.api_url}`)
  console.log()
})

