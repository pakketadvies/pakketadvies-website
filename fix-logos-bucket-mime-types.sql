-- =====================================================
-- FIX: Logos bucket MIME type restricties
-- =====================================================
-- Dit script toont de huidige MIME type restricties en geeft instructies

-- Check current bucket settings
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN allowed_mime_types IS NULL OR array_length(allowed_mime_types, 1) IS NULL THEN '✅ Geen restricties (alle types toegestaan)'
    ELSE '⚠️ Heeft restricties: ' || array_to_string(allowed_mime_types, ', ')
  END as mime_type_status
FROM storage.buckets
WHERE name IN ('logos', 'documents')
ORDER BY name;

-- Note: MIME types kunnen niet direct via SQL worden aangepast.
-- Je moet dit doen via Supabase Dashboard:
-- 1. Ga naar Storage → Buckets
-- 2. Klik op de bucket naam
-- 3. Klik op "Edit bucket" (potlood icoon)
-- 4. Laat "Allowed MIME types" leeg (of voeg toe: application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document)
-- 5. Klik op "Update bucket"

