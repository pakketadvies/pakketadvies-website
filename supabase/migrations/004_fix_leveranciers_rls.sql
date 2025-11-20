-- Create a function to execute arbitrary SQL (only for admin setup)
CREATE OR REPLACE FUNCTION public.setup_rls_policies()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Leveranciers RLS
  DROP POLICY IF EXISTS "Enable read access for all users" ON leveranciers;
  DROP POLICY IF EXISTS "Admins can insert leveranciers" ON leveranciers;
  DROP POLICY IF EXISTS "Admins can update leveranciers" ON leveranciers;
  DROP POLICY IF EXISTS "Admins can delete leveranciers" ON leveranciers;

  ALTER TABLE leveranciers ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Enable read access for all users" ON leveranciers FOR SELECT USING (true);

  CREATE POLICY "Admins can insert leveranciers" ON leveranciers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

  CREATE POLICY "Admins can update leveranciers" ON leveranciers FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

  CREATE POLICY "Admins can delete leveranciers" ON leveranciers FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

  -- Contracten RLS  
  DROP POLICY IF EXISTS "Enable read access for all users" ON contracten;
  DROP POLICY IF EXISTS "Admins can insert contracten" ON contracten;
  DROP POLICY IF EXISTS "Admins can update contracten" ON contracten;
  DROP POLICY IF EXISTS "Admins can delete contracten" ON contracten;

  ALTER TABLE contracten ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Enable read access for all users" ON contracten FOR SELECT USING (true);

  CREATE POLICY "Admins can insert contracten" ON contracten FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

  CREATE POLICY "Admins can update contracten" ON contracten FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

  CREATE POLICY "Admins can delete contracten" ON contracten FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
END;
$$;

-- Execute the function
SELECT public.setup_rls_policies();

-- Drop the function after use
DROP FUNCTION IF EXISTS public.setup_rls_policies();
