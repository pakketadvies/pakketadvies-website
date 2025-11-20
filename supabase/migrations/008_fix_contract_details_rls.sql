-- Fix RLS policies voor contract details tabellen

-- contract_details_vast
ALTER TABLE contract_details_vast ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON contract_details_vast;
DROP POLICY IF EXISTS "Admins can insert contract_details_vast" ON contract_details_vast;
DROP POLICY IF EXISTS "Admins can update contract_details_vast" ON contract_details_vast;
DROP POLICY IF EXISTS "Admins can delete contract_details_vast" ON contract_details_vast;

CREATE POLICY "Enable read access for all users" ON contract_details_vast 
FOR SELECT USING (true);

CREATE POLICY "Admins can insert contract_details_vast" ON contract_details_vast 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update contract_details_vast" ON contract_details_vast 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete contract_details_vast" ON contract_details_vast 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- contract_details_dynamisch
ALTER TABLE contract_details_dynamisch ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON contract_details_dynamisch;
DROP POLICY IF EXISTS "Admins can insert contract_details_dynamisch" ON contract_details_dynamisch;
DROP POLICY IF EXISTS "Admins can update contract_details_dynamisch" ON contract_details_dynamisch;
DROP POLICY IF EXISTS "Admins can delete contract_details_dynamisch" ON contract_details_dynamisch;

CREATE POLICY "Enable read access for all users" ON contract_details_dynamisch 
FOR SELECT USING (true);

CREATE POLICY "Admins can insert contract_details_dynamisch" ON contract_details_dynamisch 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update contract_details_dynamisch" ON contract_details_dynamisch 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete contract_details_dynamisch" ON contract_details_dynamisch 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- contract_details_maatwerk
ALTER TABLE contract_details_maatwerk ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON contract_details_maatwerk;
DROP POLICY IF EXISTS "Admins can insert contract_details_maatwerk" ON contract_details_maatwerk;
DROP POLICY IF EXISTS "Admins can update contract_details_maatwerk" ON contract_details_maatwerk;
DROP POLICY IF EXISTS "Admins can delete contract_details_maatwerk" ON contract_details_maatwerk;

CREATE POLICY "Enable read access for all users" ON contract_details_maatwerk 
FOR SELECT USING (true);

CREATE POLICY "Admins can insert contract_details_maatwerk" ON contract_details_maatwerk 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can update contract_details_maatwerk" ON contract_details_maatwerk 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete contract_details_maatwerk" ON contract_details_maatwerk 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

