-- Create admin user: info@pakketadvies.nl
-- This must be run in the Supabase SQL Editor

-- Insert into auth.users (Supabase Auth)
-- Note: You need to do this via the Supabase Dashboard UI:
-- Go to Authentication → Users → Add User
-- Email: info@pakketadvies.nl
-- Password: Ab49n805!
-- Auto Confirm User: YES ✓

-- After creating the user, run this to set role to admin:
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'info@pakketadvies.nl';

-- Verify:
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE email = 'info@pakketadvies.nl';

