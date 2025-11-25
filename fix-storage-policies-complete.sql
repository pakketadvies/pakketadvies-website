-- =====================================================
-- COMPLETE FIX: Storage policies voor document uploads
-- =====================================================
-- Run this in Supabase SQL Editor to fix all storage policies

-- STEP 1: Check current buckets
SELECT 
  id,
  name,
  public,
  created_at,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('documents', 'logos')
ORDER BY name;

-- STEP 2: Drop ALL existing storage policies to start fresh
DROP POLICY IF EXISTS "authenticated_users_can_upload_documents" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_update_documents" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_delete_documents" ON storage.objects;
DROP POLICY IF EXISTS "public_can_read_documents" ON storage.objects;
DROP POLICY IF EXISTS "service_role_full_access_documents" ON storage.objects;

DROP POLICY IF EXISTS "authenticated_users_can_upload_logos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_update_logos" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_delete_logos" ON storage.objects;
DROP POLICY IF EXISTS "public_can_read_logos" ON storage.objects;
DROP POLICY IF EXISTS "service_role_full_access_logos" ON storage.objects;

-- STEP 3: Create comprehensive policies for DOCUMENTS bucket
-- These policies allow authenticated users to upload any file to the documents bucket

-- INSERT: Allow authenticated users to upload
CREATE POLICY "authenticated_users_can_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- UPDATE: Allow authenticated users to update
CREATE POLICY "authenticated_users_can_update_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- DELETE: Allow authenticated users to delete
CREATE POLICY "authenticated_users_can_delete_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- SELECT: Allow public read access
CREATE POLICY "public_can_read_documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Service role: Full access
CREATE POLICY "service_role_full_access_documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- STEP 4: Create comprehensive policies for LOGOS bucket
-- These policies allow authenticated users to upload any file to the logos bucket

-- INSERT: Allow authenticated users to upload
CREATE POLICY "authenticated_users_can_upload_logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- UPDATE: Allow authenticated users to update
CREATE POLICY "authenticated_users_can_update_logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- DELETE: Allow authenticated users to delete
CREATE POLICY "authenticated_users_can_delete_logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- SELECT: Allow public read access
CREATE POLICY "public_can_read_logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Service role: Full access
CREATE POLICY "service_role_full_access_logos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- STEP 5: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_qual,
  CASE 
    WHEN with_check IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END as has_with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (policyname LIKE '%documents%' OR policyname LIKE '%logos%')
ORDER BY policyname;

-- STEP 6: Check RLS is enabled on storage.objects
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'storage'
  AND tablename = 'objects';

-- Final message
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Make sure both buckets exist in Supabase Dashboard:';
  RAISE NOTICE '';
  RAISE NOTICE '1. DOCUMENTS BUCKET:';
  RAISE NOTICE '   - Go to Storage → Create a new bucket';
  RAISE NOTICE '   - Name: "documents"';
  RAISE NOTICE '   - Public bucket: ✅ AAN';
  RAISE NOTICE '   - File size limit: Leave empty or set to 10MB';
  RAISE NOTICE '   - Allowed MIME types: Leave empty (allows all)';
  RAISE NOTICE '';
  RAISE NOTICE '2. LOGOS BUCKET (als die nog niet bestaat):';
  RAISE NOTICE '   - Go to Storage → Create a new bucket';
  RAISE NOTICE '   - Name: "logos"';
  RAISE NOTICE '   - Public bucket: ✅ AAN';
  RAISE NOTICE '   - File size limit: Leave empty or set to 5MB';
  RAISE NOTICE '   - Allowed MIME types: Leave empty (allows all)';
END $$;

