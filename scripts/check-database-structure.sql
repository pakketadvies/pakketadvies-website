-- Script to check if all database structures are correct
-- Run this in Supabase SQL Editor

-- 1. Check if email_logs table exists and has resend_id column
SELECT 
    'email_logs table check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'email_logs'
        ) THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as status
UNION ALL
SELECT 
    'resend_id column check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'email_logs' 
            AND column_name = 'resend_id'
        ) THEN '✅ Column exists'
        ELSE '❌ Column missing - Run migration 033_add_resend_id_to_email_logs.sql'
    END as status
UNION ALL
-- 2. Check if contract_viewer_access table exists
SELECT 
    'contract_viewer_access table check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'contract_viewer_access'
        ) THEN '✅ Table exists'
        ELSE '❌ Table missing'
    END as status
UNION ALL
-- 3. Check if contractaanvragen table has email status columns
SELECT 
    'email_bevestiging_verzonden column check' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'contractaanvragen' 
            AND column_name = 'email_bevestiging_verzonden'
        ) THEN '✅ Column exists'
        ELSE '❌ Column missing'
    END as status
UNION ALL
-- 4. Check all columns in email_logs
SELECT 
    'email_logs columns' as check_name,
    string_agg(column_name, ', ' ORDER BY ordinal_position) as status
FROM information_schema.columns
WHERE table_name = 'email_logs';

-- Show all columns in email_logs table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'email_logs'
ORDER BY ordinal_position;

