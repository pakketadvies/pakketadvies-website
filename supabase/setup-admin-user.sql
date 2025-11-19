-- ========================================
-- PAKKETADVIES ADMIN SETUP
-- ========================================
-- 
-- Dit script maakt de eerste admin user aan.
-- 
-- STAPPEN:
-- 1. Ga naar je Supabase Dashboard
-- 2. Ga naar SQL Editor
-- 3. Maak een "New Query"
-- 4. Plak deze hele file
-- 5. Klik op "Run"
-- 
-- ========================================

-- STAP 1: Maak de auth user aan
-- Let op: Dit deel MOET via het Supabase Dashboard
-- Ga naar: Authentication → Users → Add User
-- 
-- Email: info@pakketadvies.nl
-- Password: Ab49n805!
-- 
-- Auto Confirm User: YES (aanvinken!)
-- 
-- Klik op "Create User" en kopieer de User ID

-- ========================================
-- STAP 2: Update de role naar admin
-- ========================================
-- 
-- Nadat je de user hebt aangemaakt via het dashboard,
-- voer deze query uit (vervang YOUR_USER_ID met de echte UUID):

-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE email = 'info@pakketadvies.nl';

-- ========================================
-- VERIFICATIE
-- ========================================
-- Run deze query om te checken of het gelukt is:

-- SELECT id, email, role, created_at 
-- FROM user_profiles 
-- WHERE email = 'info@pakketadvies.nl';

-- Je zou moeten zien:
-- role: 'admin' ✓

-- ========================================
-- KLAAR!
-- ========================================
-- 
-- Je kunt nu inloggen op:
-- http://localhost:3000/admin/login
-- 
-- Email: info@pakketadvies.nl
-- Password: Ab49n805!
-- 
-- ========================================

