-- Check contract_viewer_access table schema
-- Run this in Supabase SQL Editor

-- 1. Check if table exists
SELECT 
    'Table exists' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'contract_viewer_access'
        ) THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as status;

-- 2. Check all columns in contract_viewer_access
SELECT 
    'Columns in contract_viewer_access' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'contract_viewer_access'
ORDER BY ordinal_position;

-- 3. Check if expires_at column exists
SELECT 
    'expires_at column check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'contract_viewer_access' 
            AND column_name = 'expires_at'
        ) THEN '✅ Column exists'
        ELSE '❌ Column missing - NEEDS MIGRATION'
    END as status;

-- 4. Check sample records (if any)
SELECT 
    'Sample records' as check_type,
    COUNT(*) as total_tokens,
    COUNT(expires_at) as tokens_with_expires_at,
    COUNT(*) - COUNT(expires_at) as tokens_without_expires_at
FROM contract_viewer_access;

-- 5. Show recent tokens with expires_at status
SELECT 
    id,
    aanvraag_id,
    access_token,
    expires_at,
    created_at,
    accessed_at,
    CASE 
        WHEN expires_at IS NULL THEN '⚠️ NULL'
        WHEN expires_at < NOW() THEN '❌ EXPIRED'
        ELSE '✅ VALID'
    END as status
FROM contract_viewer_access
ORDER BY created_at DESC
LIMIT 10;

