const fs = require('fs')

const supabaseUrl = 'https://emmbycvdwkmugepvgtfj.supabase.co'
const supabasePassword = 'Ab49n805!'

async function applyMigration() {
  console.log('📋 Reading migration file...')
  const sql = fs.readFileSync('./supabase/migrations/011_fix_energie_tarieven_2025.sql', 'utf8')
  
  console.log('🚀 Applying migration to Supabase via REST API...')
  console.log('📝 SQL to execute:')
  console.log(sql)
  console.log('\n' + '='.repeat(80) + '\n')
  
  // Use the postgres connection via REST
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI'}`,
    },
    body: JSON.stringify({ sql_query: sql })
  })

  if (!response.ok) {
    console.error('❌ Error:', await response.text())
    process.exit(1)
  }

  console.log('✅ Migration applied successfully!')
  
  // Verify
  console.log('\n🔍 Verifying tarieven_overheid 2025...')
  const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/tarieven_overheid?jaar=eq.2025&select=*`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbWJ5Y3Zkd2ttdWdlcHZndGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAxOTk2NDcsImV4cCI6MjA0NTc3NTY0N30.qxK7LYl0m_QEAQ3G3-SdpY3LqNfZQZi1VfxZZbE4PeI',
    }
  })

  const data = await verifyResponse.json()
  console.log('✅ Verification result:', JSON.stringify(data, null, 2))
}

applyMigration().catch(console.error)

