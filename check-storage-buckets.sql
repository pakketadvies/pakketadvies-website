-- =====================================================
-- CHECK SCRIPT: Verify storage buckets exist
-- =====================================================
-- Run this in Supabase SQL Editor to check if buckets exist

-- Check if documents bucket exists
SELECT 
  'documents' as bucket_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'documents'
    ) THEN '✅ EXISTS'
    ELSE '❌ DOES NOT EXIST - CREATE IT IN DASHBOARD'
  END as status;

-- Check if logos bucket exists
SELECT 
  'logos' as bucket_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM storage.buckets WHERE name = 'logos'
    ) THEN '✅ EXISTS'
    ELSE '❌ DOES NOT EXIST - CREATE IT IN DASHBOARD'
  END as status;

-- List all buckets
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets
ORDER BY name;

-- Check storage policies for documents bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%documents%'
ORDER BY policyname;

-- Check storage policies for logos bucket
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%logos%'
ORDER BY policyname;

