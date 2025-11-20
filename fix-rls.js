const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dxztyhwiwgrxjnlohapm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4enR5aHdpd2dyeGpubG9oYXBtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ1MjI4NSwiZXhwIjoyMDc5MDI4Mjg1fQ.n9u7aOE8GdYKY2pBLYg8tJxO90d5UU6vWmlgKm4baFo'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const sql = `
-- Fix RLS policies voor leveranciers tabel

-- Drop bestaande policies
DROP POLICY IF EXISTS "Enable read access for all users" ON leveranciers;
DROP POLICY IF EXISTS "Admins can insert leveranciers" ON leveranciers;
DROP POLICY IF EXISTS "Admins can update leveranciers" ON leveranciers;
DROP POLICY IF EXISTS "Admins can delete leveranciers" ON leveranciers;

-- Enable RLS
ALTER TABLE leveranciers ENABLE ROW LEVEL SECURITY;

-- Iedereen kan lezen
CREATE POLICY "Enable read access for all users" ON leveranciers
  FOR SELECT 
  USING (true);

-- Alleen admins CRUD
CREATE POLICY "Admins can insert leveranciers" ON leveranciers
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update leveranciers" ON leveranciers
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete leveranciers" ON leveranciers
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Contracten tabel
DROP POLICY IF EXISTS "Enable read access for all users" ON contracten;
DROP POLICY IF EXISTS "Admins can insert contracten" ON contracten;
DROP POLICY IF EXISTS "Admins can update contracten" ON contracten;
DROP POLICY IF EXISTS "Admins can delete contracten" ON contracten;

ALTER TABLE contracten ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON contracten
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert contracten" ON contracten
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update contracten" ON contracten
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete contracten" ON contracten
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Contract details tabellen
ALTER TABLE contract_details_vast ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all" ON contract_details_vast;
DROP POLICY IF EXISTS "Admins can manage" ON contract_details_vast;
CREATE POLICY "Enable read for all" ON contract_details_vast FOR SELECT USING (true);
CREATE POLICY "Admins can manage" ON contract_details_vast FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE contract_details_dynamisch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all" ON contract_details_dynamisch;
DROP POLICY IF EXISTS "Admins can manage" ON contract_details_dynamisch;
CREATE POLICY "Enable read for all" ON contract_details_dynamisch FOR SELECT USING (true);
CREATE POLICY "Admins can manage" ON contract_details_dynamisch FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE contract_details_maatwerk ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for all" ON contract_details_maatwerk;
DROP POLICY IF EXISTS "Admins can manage" ON contract_details_maatwerk;
CREATE POLICY "Enable read for all" ON contract_details_maatwerk FOR SELECT USING (true);
CREATE POLICY "Admins can manage" ON contract_details_maatwerk FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
`

async function fixRLS() {
  try {
    console.log('🔧 Fixing RLS policies...')
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Error:', error)
      // Try alternative method via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql_query: sql })
      })
      
      if (!response.ok) {
        console.error('Failed to execute SQL via REST API')
        console.log('⚠️  Please run this SQL manually in Supabase Dashboard > SQL Editor:')
        console.log(sql)
      } else {
        console.log('✅ RLS policies fixed via REST API!')
      }
    } else {
      console.log('✅ RLS policies fixed!')
      console.log(data)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
    console.log('\n⚠️  Please run the migration manually in Supabase Dashboard:')
    console.log('Path: supabase/migrations/004_fix_leveranciers_rls.sql')
  }
}

fixRLS()

