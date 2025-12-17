-- ============================================
-- VERIFY RLS SECURITY FIX
-- ============================================
-- Run this script in Supabase SQL Editor to verify
-- that all RLS policies are correctly set up
-- ============================================

-- 1. Check if RLS is enabled on all required tables
SELECT 
  'RLS Status Check' as check_type,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('hourly_prices', 'dynamic_prices', 'email_logs', 'contract_viewer_access')
ORDER BY tablename;

-- 2. Check policies on hourly_prices
SELECT 
  'hourly_prices policies' as check_type,
  policyname,
  cmd as command,
  qual as using_expression,
  CASE 
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ Public SELECT allowed'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'hourly_prices';

-- 3. Check policies on dynamic_prices
SELECT 
  'dynamic_prices policies' as check_type,
  policyname,
  cmd as command,
  qual as using_expression,
  CASE 
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ Public SELECT allowed'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dynamic_prices';

-- 4. Check policies on email_logs
SELECT 
  'email_logs policies' as check_type,
  policyname,
  cmd as command,
  qual as using_expression,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Admin SELECT policy exists'
    WHEN cmd = 'UPDATE' THEN '✅ Admin UPDATE policy exists'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'email_logs';

-- 5. Check policies on contract_viewer_access
SELECT 
  'contract_viewer_access policies' as check_type,
  policyname,
  cmd as command,
  qual as using_expression,
  CASE 
    WHEN cmd = 'SELECT' AND qual = 'true' THEN '✅ Public SELECT allowed'
    ELSE '⚠️ Check policy'
  END as status
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'contract_viewer_access';

-- 6. Check if functions have search_path set
SELECT 
  'Function search_path check' as check_type,
  proname as function_name,
  CASE 
    WHEN prosrc LIKE '%SET search_path%' OR prosrc LIKE '%SET search_path%' THEN '✅ search_path set'
    ELSE '❌ search_path not set'
  END as status
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND proname IN (
    'update_hourly_prices_updated_at',
    'update_dynamic_prices_updated_at',
    'update_model_tarieven_updated_at',
    'handle_new_user',
    'update_updated_at_column',
    'is_document',
    'update_contractaanvragen_updated_at',
    'generate_aanvraagnummer'
  )
ORDER BY proname;

-- 7. Test SELECT access (as anonymous user - should work for prices, fail for email_logs)
-- Note: This test requires running as anon role, which is not possible in SQL Editor
-- But we can verify the policies exist and are correct

-- Summary
SELECT 
  'SUMMARY' as check_type,
  COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
  COUNT(*) FILTER (WHERE rowsecurity = false) as tables_without_rls,
  CASE 
    WHEN COUNT(*) FILTER (WHERE rowsecurity = false) = 0 THEN '✅ All tables have RLS enabled'
    ELSE '❌ Some tables missing RLS'
  END as overall_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('hourly_prices', 'dynamic_prices', 'email_logs', 'contract_viewer_access');

