/**
 * Direct check of netbeheer tarieven in Supabase
 * This will show us exactly what's in the database
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dxztyhwiwgrxjnlohapm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTIyODUsImV4cCI6MjA3OTAyODI4NX0.TDv9_TJlZ0uhMar3LPKE6paRr1wa5zTUEweS5ibK_yc'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('=== Checking Netbeheerders ===\n')

// Get all netbeheerders
const { data: netbeheerders, error: nbError } = await supabase
  .from('netbeheerders')
  .select('*')
  .eq('actief', true)

if (nbError) {
  console.error('❌ Error fetching netbeheerders:', nbError)
  process.exit(1)
}

console.log(`Found ${netbeheerders.length} active netbeheerders:`)
for (const nb of netbeheerders) {
  console.log(`  - ${nb.naam} (${nb.code}): id=${nb.id}`)
}

console.log('\n=== Checking Coteq Netbeheer Tarieven ===\n')

const coteq = netbeheerders.find(n => n.code === 'COTEQ')
if (!coteq) {
  console.error('❌ Coteq Netbeheer not found!')
  process.exit(1)
}

console.log(`Coteq ID: ${coteq.id}\n`)

// Check elektriciteit tarieven
console.log('--- Elektriciteit Tarieven (raw, no filters) ---')
const { data: elekAll, error: elekAllError } = await supabase
  .from('netbeheer_tarieven_elektriciteit')
  .select('*')
  .eq('netbeheerder_id', coteq.id)

if (elekAllError) {
  console.error('❌ Error:', elekAllError)
} else {
  console.log(`Total: ${elekAll.length} tarieven`)
  for (const t of elekAll) {
    console.log(`  - ID: ${t.id}, jaar: ${t.jaar}, actief: ${t.actief}, aansluitwaarde_id: ${t.aansluitwaarde_id}`)
  }
}

console.log('\n--- Elektriciteit Tarieven (filtered: jaar=2025, actief=true) ---')
const { data: elekFiltered, error: elekFilteredError } = await supabase
  .from('netbeheer_tarieven_elektriciteit')
  .select('*')
  .eq('netbeheerder_id', coteq.id)
  .eq('jaar', 2025)
  .eq('actief', true)

if (elekFilteredError) {
  console.error('❌ Error:', elekFilteredError)
} else {
  console.log(`Found: ${elekFiltered.length} tarieven`)
  for (const t of elekFiltered) {
    console.log(`  - ID: ${t.id}, aansluitwaarde_id: ${t.aansluitwaarde_id}, all_in_tarief_jaar: ${t.all_in_tarief_jaar}`)
  }
}

console.log('\n--- Elektriciteit Tarieven (with join) ---')
const { data: elekWithJoin, error: elekJoinError } = await supabase
  .from('netbeheer_tarieven_elektriciteit')
  .select('*, aansluitwaarde:aansluitwaarden_elektriciteit(*)')
  .eq('netbeheerder_id', coteq.id)
  .eq('jaar', 2025)
  .eq('actief', true)

if (elekJoinError) {
  console.error('❌ Error with join:', elekJoinError)
} else {
  console.log(`Found: ${elekWithJoin.length} tarieven`)
  for (const t of elekWithJoin) {
    console.log(`  - ID: ${t.id}`)
    console.log(`    aansluitwaarde:`, t.aansluitwaarde)
  }
}

console.log('\n=== Summary ===')
console.log(`Coteq Netbeheer has ${elekAll?.length || 0} total elektriciteit tarieven`)
console.log(`  - ${elekFiltered?.length || 0} with jaar=2025 AND actief=true`)
console.log(`  - Join query returned: ${elekWithJoin?.length || 0} tarieven`)

