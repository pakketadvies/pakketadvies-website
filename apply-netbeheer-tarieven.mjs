#!/usr/bin/env node

/**
 * Script om de complete netbeheertarieven 2025 toe te passen op de Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Ontbrekende environment variabelen')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('📂 Lees migration bestand...')
    const migrationPath = join(__dirname, 'supabase', 'migrations', '012_complete_netbeheer_tarieven_2025.sql')
    const sql = readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Voer migration uit op Supabase...')
    console.log('   Bestand:', migrationPath)
    console.log('   Grootte:', sql.length, 'characters')
    console.log('')
    
    // Supabase heeft geen directe SQL execute functie via de client
    // We moeten de queries opsplitsen en via de REST API uitvoeren
    // Of we gebruiken de Supabase CLI
    
    console.log('⚠️  Dit script kan niet direct SQL uitvoeren op Supabase.')
    console.log('    Gebruik een van de volgende methoden:')
    console.log('')
    console.log('    1. Supabase Dashboard → SQL Editor → Plak de inhoud van:')
    console.log('       supabase/migrations/012_complete_netbeheer_tarieven_2025.sql')
    console.log('')
    console.log('    2. Of gebruik: npx supabase db reset --db-url <connection-string>')
    console.log('')
    
  } catch (error) {
    console.error('❌ Fout:', error.message)
    process.exit(1)
  }
}

applyMigration()

