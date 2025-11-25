-- =====================================================
-- CREATE DOCUMENTS BUCKET
-- =====================================================
-- Probeer de documents bucket aan te maken via SQL

-- Check if bucket already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'documents') THEN
    -- Insert bucket
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'documents',
      'documents',
      true, -- public
      NULL, -- no file size limit (or use 10485760 for 10MB)
      NULL  -- no MIME type restrictions (allows all types)
    );
    RAISE NOTICE '✅ Documents bucket created successfully!';
  ELSE
    RAISE NOTICE '⚠️ Documents bucket already exists';
  END IF;
END $$;

-- Verify bucket was created
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE name = 'documents';

