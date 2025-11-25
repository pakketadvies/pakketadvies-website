-- =====================================================
-- COMPLETE SETUP: All storage fixes in one script
-- =====================================================
-- Run this in Supabase SQL Editor to fix everything at once

-- =====================================================
-- STEP 1: Create documents bucket (if it doesn't exist)
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'documents',
      'documents',
      true, -- public
      NULL, -- no file size limit
      NULL  -- no MIME type restrictions (allows all types)
    );
    RAISE NOTICE '✅ Documents bucket created!';
  ELSE
    RAISE NOTICE '⚠️ Documents bucket already exists';
  END IF;
END $$;

-- =====================================================
-- STEP 2: Fix logos bucket MIME types (remove restrictions)
-- =====================================================
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE name = 'logos'
  AND (allowed_mime_types IS NOT NULL AND array_length(allowed_mime_types, 1) > 0);

-- =====================================================
-- STEP 3: Drop ALL existing storage policies to start fresh
-- =====================================================
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

-- =====================================================
-- STEP 4: Create comprehensive policies for DOCUMENTS bucket
-- =====================================================

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

-- =====================================================
-- STEP 5: Create comprehensive policies for LOGOS bucket
-- =====================================================

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

-- =====================================================
-- STEP 6: Verify everything was created
-- =====================================================
SELECT 
  'BUCKETS' as type,
  name,
  public,
  CASE 
    WHEN allowed_mime_types IS NULL THEN '✅ All types allowed'
    ELSE '⚠️ Restricted: ' || array_to_string(allowed_mime_types, ', ')
  END as mime_status
FROM storage.buckets
WHERE name IN ('documents', 'logos')
ORDER BY name;

SELECT 
  'POLICIES' as type,
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%documents%' THEN 'documents'
    WHEN policyname LIKE '%logos%' THEN 'logos'
    ELSE 'other'
  END as bucket
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND (policyname LIKE '%documents%' OR policyname LIKE '%logos%')
ORDER BY bucket, cmd;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅✅✅ SETUP COMPLETE! ✅✅✅';
  RAISE NOTICE '';
  RAISE NOTICE 'The documents bucket and all policies have been configured.';
  RAISE NOTICE 'You can now test PDF/DOC uploads in the admin panel.';
END $$;

