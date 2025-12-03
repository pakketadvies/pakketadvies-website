-- ============================================
-- ADD ADMIN POLICIES FOR MODEL_TARIEVEN
-- ============================================
-- Adds UPDATE and INSERT policies for admin users
-- This allows admins to update Eneco modeltarieven
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can update model_tarieven" ON model_tarieven;
DROP POLICY IF EXISTS "Admins can insert model_tarieven" ON model_tarieven;

-- Allow admins to update model_tarieven
CREATE POLICY "Admins can update model_tarieven" ON model_tarieven 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Allow admins to insert model_tarieven
CREATE POLICY "Admins can insert model_tarieven" ON model_tarieven 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

