-- Migration: Fix RLS policy for contractaanvragen public insert
-- Date: 2025-01-27
-- Description: Fixes the public insert policy to allow unauthenticated form submissions

-- Drop existing policy
DROP POLICY IF EXISTS "Public can insert contractaanvragen" ON contractaanvragen;

-- Create new policy that allows public inserts (for form submissions)
-- This allows anyone to insert, but only admins can read/update/delete
CREATE POLICY "Public can insert contractaanvragen" ON contractaanvragen
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Also ensure admins can still do everything
DROP POLICY IF EXISTS "Admin full access contractaanvragen" ON contractaanvragen;

CREATE POLICY "Admin full access contractaanvragen" ON contractaanvragen
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

