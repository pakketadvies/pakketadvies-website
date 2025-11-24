-- Migration: Add documents storage bucket for PDF files
-- Date: 2025-01-27
-- Description: Creates a storage bucket for contract documents (PDFs) with proper policies

-- Create documents bucket (if it doesn't exist)
-- Note: Buckets need to be created via Supabase Dashboard or API
-- This migration sets up the policies

-- Allow authenticated users (admins) to upload documents
CREATE POLICY IF NOT EXISTS "authenticated_users_can_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to update
CREATE POLICY IF NOT EXISTS "authenticated_users_can_update_documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to delete
CREATE POLICY IF NOT EXISTS "authenticated_users_can_delete_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');

-- Allow public read access to documents
CREATE POLICY IF NOT EXISTS "public_can_read_documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

-- Service role full access
CREATE POLICY IF NOT EXISTS "service_role_full_access_documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

RAISE NOTICE '✅ Storage policies for documents bucket created';
RAISE NOTICE '⚠️  Don''t forget to create the "documents" bucket in Supabase Dashboard:';
RAISE NOTICE '    1. Go to Storage in Supabase Dashboard';
RAISE NOTICE '    2. Click "Create a new bucket"';
RAISE NOTICE '    3. Name: "documents"';
RAISE NOTICE '    4. Public bucket: ✅ AAN';

