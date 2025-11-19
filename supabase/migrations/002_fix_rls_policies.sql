-- Fix RLS policies for user_profiles table
-- This fixes the 500 error when checking admin role

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin full access leveranciers" ON leveranciers;
DROP POLICY IF EXISTS "Public read active leveranciers" ON leveranciers;

-- User profiles: Allow authenticated users to read their own profile
CREATE POLICY "authenticated_users_read_own_profile" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- User profiles: Allow service role full access  
CREATE POLICY "service_role_full_access_user_profiles" 
ON user_profiles FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Leveranciers: Authenticated users can read active ones
CREATE POLICY "authenticated_read_active_leveranciers" 
ON leveranciers FOR SELECT 
TO authenticated 
USING (actief = true OR auth.jwt() ->> 'role' = 'admin');

-- Leveranciers: Service role full access
CREATE POLICY "service_role_full_access_leveranciers" 
ON leveranciers FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Contracten: Similar pattern
DROP POLICY IF EXISTS "Admin full access contracten" ON contracten;
DROP POLICY IF EXISTS "Public read active contracten" ON contracten;

CREATE POLICY "authenticated_read_active_contracten" 
ON contracten FOR SELECT 
TO authenticated 
USING (actief = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "service_role_full_access_contracten" 
ON contracten FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Contract details tables
DROP POLICY IF EXISTS "Admin full access contract_details_vast" ON contract_details_vast;
DROP POLICY IF EXISTS "Public read contract_details_vast" ON contract_details_vast;

CREATE POLICY "authenticated_read_contract_details_vast" 
ON contract_details_vast FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM contracten 
    WHERE contracten.id = contract_details_vast.contract_id 
    AND (contracten.actief = true OR auth.jwt() ->> 'role' = 'admin')
  )
);

CREATE POLICY "service_role_full_access_contract_details_vast" 
ON contract_details_vast FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Dynamisch
DROP POLICY IF EXISTS "Admin full access contract_details_dynamisch" ON contract_details_dynamisch;
DROP POLICY IF EXISTS "Public read contract_details_dynamisch" ON contract_details_dynamisch;

CREATE POLICY "authenticated_read_contract_details_dynamisch" 
ON contract_details_dynamisch FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM contracten 
    WHERE contracten.id = contract_details_dynamisch.contract_id 
    AND (contracten.actief = true OR auth.jwt() ->> 'role' = 'admin')
  )
);

CREATE POLICY "service_role_full_access_contract_details_dynamisch" 
ON contract_details_dynamisch FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Maatwerk
DROP POLICY IF EXISTS "Admin full access contract_details_maatwerk" ON contract_details_maatwerk;
DROP POLICY IF EXISTS "Public read contract_details_maatwerk" ON contract_details_maatwerk;

CREATE POLICY "authenticated_read_contract_details_maatwerk" 
ON contract_details_maatwerk FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM contracten 
    WHERE contracten.id = contract_details_maatwerk.contract_id 
    AND (contracten.actief = true OR auth.jwt() ->> 'role' = 'admin')
  )
);

CREATE POLICY "service_role_full_access_contract_details_maatwerk" 
ON contract_details_maatwerk FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Verify
SELECT 'Policies updated successfully!' as status;

