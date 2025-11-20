-- Storage policies voor logo uploads

-- Allow authenticated users (admins) to upload
CREATE POLICY "authenticated_users_can_upload_logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to update
CREATE POLICY "authenticated_users_can_update_logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

-- Allow authenticated users to delete
CREATE POLICY "authenticated_users_can_delete_logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Allow public read access to logos
CREATE POLICY "public_can_read_logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Service role full access
CREATE POLICY "service_role_full_access_logos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'logos')
WITH CHECK (bucket_id = 'logos');

