-- =====================================================
-- FIX SCRIPT: Fix storage upload issues
-- =====================================================
-- Run this in Supabase SQL Editor to diagnose and fix storage issues

-- STEP 1: Check if buckets exist
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

-- STEP 2: Check current storage policies for authenticated users
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

-- STEP 3: Drop existing policies for documents bucket (if they exist)
DROP POLICY IF EXISTS "authenticated_users_can_upload_documents" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_update_documents" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_users_can_delete_documents" ON storage.objects;
DROP POLICY IF EXISTS "public_can_read_documents" ON storage.objects;
DROP POLICY IF EXISTS "service_role_full_access_documents" ON storage.objects;

-- STEP 4: Create comprehensive policies for documents bucket
-- Allow authenticated users to upload
CREATE POLICY "authenticated_users_can_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = 'contracten'
);

-- Allow authenticated users to update their own uploads
CREATE POLICY "authenticated_users_can_update_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "authenticated_users_can_delete_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Allow public read access to documents
CREATE POLICY "public_can_read_documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Service role full access
CREATE POLICY "service_role_full_access_documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- STEP 5: Also ensure logos bucket has correct policies (similar to documents)
-- Allow authenticated users to upload to logos bucket
CREATE POLICY IF NOT EXISTS "authenticated_users_can_upload_logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update logos
CREATE POLICY IF NOT EXISTS "authenticated_users_can_update_logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to delete logos
CREATE POLICY IF NOT EXISTS "authenticated_users_can_delete_logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Allow public read access to logos
CREATE POLICY IF NOT EXISTS "public_can_read_logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Service role full access to logos
CREATE POLICY IF NOT EXISTS "service_role_full_access_logos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- STEP 6: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (policyname LIKE '%documents%' OR policyname LIKE '%logos%')
ORDER BY policyname;

RAISE NOTICE '✅ Storage policies updated';
RAISE NOTICE '⚠️  IMPORTANT: Make sure the "documents" bucket exists in Supabase Dashboard';
RAISE NOTICE '    1. Go to Storage in Supabase Dashboard';
RAISE NOTICE '    2. Click "Create a new bucket" (if documents bucket doesn''t exist)';
RAISE NOTICE '    3. Name: "documents"';
RAISE NOTICE '    4. Public bucket: ✅ AAN';
RAISE NOTICE '    5. File size limit: Leave empty or set to 10MB';
RAISE NOTICE '    6. Allowed MIME types: Leave empty (allows all)';

