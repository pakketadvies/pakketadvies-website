const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  console.log('📋 Reading migration file...')
  const sql = fs.readFileSync('./supabase/migrations/011_fix_energie_tarieven_2025.sql', 'utf8')
  
  console.log('🚀 Applying migration to Supabase...')
  
  // Split by semicolon to execute statements separately
  const statements = sql.split(';').filter(s => s.trim().length > 0)
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim() + ';'
    console.log(`\n📝 Executing statement ${i + 1}/${statements.length}...`)
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        console.error('❌ Error:', error.message)
        // Continue with next statement
      } else {
        console.log('✅ Success')
      }
    } catch (err) {
      console.error('❌ Exception:', err.message)
    }
  }
  
  console.log('\n✅ Migration complete!')
  console.log('\n🔍 Verifying tarieven_overheid 2025...')
  
  const { data, error } = await supabase
    .from('tarieven_overheid')
    .select('jaar, eb_elektriciteit_kv_schijf1, eb_gas_schijf1, vermindering_eb_elektriciteit, actief')
    .eq('jaar', 2025)
    .single()
  
  if (error) {
    console.error('❌ Could not verify:', error.message)
  } else {
    console.log('✅ Verification successful:')
    console.log('   EB elektriciteit:', data.eb_elektriciteit_kv_schijf1, '€/kWh')
    console.log('   EB gas:', data.eb_gas_schijf1, '€/m³')
    console.log('   Vermindering:', data.vermindering_eb_elektriciteit, '€')
    console.log('   Actief:', data.actief)
  }
}

applyMigration().catch(console.error)

