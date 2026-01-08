import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function getGridHubConfigs() {
  const { data, error } = await supabase
    .from('leverancier_api_config')
    .select('*')
    .eq('provider', 'GRIDHUB')
    .order('environment')

  if (error) {
    console.error('Error fetching configs:', error.message)
    return []
  }
  return data
}

async function main() {
  console.log('\n📋 GridHub Tariff IDs:\n')
  const configs = await getGridHubConfigs()

  configs.forEach(config => {
    console.log(`${config.environment.toUpperCase()}:`)
    console.log(`  Tariff IDs: ${JSON.stringify(config.tarief_ids, null, 2)}`)
    console.log()
  })
}

main()

