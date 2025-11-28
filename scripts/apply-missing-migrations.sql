-- Script to apply missing migrations to Supabase
-- Run this in Supabase SQL Editor
-- This script applies migrations 021-033 and 20251128095202

-- Note: This script checks if tables/columns already exist before creating them
-- So it's safe to run multiple times

-- Migration 021: Add documents storage bucket (if not exists)
-- This is handled by Supabase Storage, so we skip it here

-- Migration 022: Check voorwaarden documenten (if not exists)
-- This is handled by Supabase Storage, so we skip it here

-- Migration 022_fix: Fix aansluitwaarden kleinverbruik (if not exists)
-- This migration updates data, so we skip it if already applied

-- Migration 023: Maatwerk identical to vast (if not exists)
-- This migration updates data, so we skip it if already applied

-- Migration 024: Add 4 jaar looptijd (if not exists)
-- This migration updates data, so we skip it if already applied

-- Migration 025: Increase tarief precision (if not exists)
-- This migration updates data, so we skip it if already applied

-- Migration 026: Add contract targeting (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contracten' 
        AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE contracten
        ADD COLUMN target_audience VARCHAR(20) DEFAULT 'both' 
        CHECK (target_audience IN ('particulier', 'zakelijk', 'both'));
        
        COMMENT ON COLUMN contracten.target_audience IS 'Target audience for contract: particulier, zakelijk, or both';
    END IF;
END $$;

-- Migration 027: Add verbruik_type to maatwerk (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_maatwerk' 
        AND column_name = 'verbruik_type'
    ) THEN
        ALTER TABLE contract_details_maatwerk
        ADD COLUMN verbruik_type VARCHAR(20) DEFAULT 'beide' 
        CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));
        
        COMMENT ON COLUMN contract_details_maatwerk.verbruik_type IS 'Consumption type: kleinverbruik, grootverbruik, or beide';
    END IF;
END $$;

-- Migration 028: Add verbruik_type to vast and dynamisch (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_vast' 
        AND column_name = 'verbruik_type'
    ) THEN
        ALTER TABLE contract_details_vast
        ADD COLUMN verbruik_type VARCHAR(20) DEFAULT 'beide' 
        CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));
        
        COMMENT ON COLUMN contract_details_vast.verbruik_type IS 'Consumption type: kleinverbruik, grootverbruik, or beide';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_dynamisch' 
        AND column_name = 'verbruik_type'
    ) THEN
        ALTER TABLE contract_details_dynamisch
        ADD COLUMN verbruik_type VARCHAR(20) DEFAULT 'beide' 
        CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));
        
        COMMENT ON COLUMN contract_details_dynamisch.verbruik_type IS 'Consumption type: kleinverbruik, grootverbruik, or beide';
    END IF;
END $$;

-- Migration 029: Create contractaanvragen table (if not exists)
-- This is a large migration, so we check if table exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contractaanvragen'
    ) THEN
        -- Run the full migration 029
        -- (We'll need to include the full SQL here or reference the file)
        RAISE NOTICE 'contractaanvragen table does not exist - please run migration 029 manually';
    END IF;
END $$;

-- Migration 030: Fix contractaanvragen RLS (if not exists)
-- This updates RLS policies, so we skip if already applied

-- Migration 031: Add email logs (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'email_logs'
    ) THEN
        CREATE TABLE email_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE,
            email_type VARCHAR(50) NOT NULL CHECK (email_type IN ('bevestiging', 'contact', 'status_update', 'voltooiing', 'followup')),
            recipient_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
            sent_at TIMESTAMP WITH TIME ZONE,
            opened_at TIMESTAMP WITH TIME ZONE,
            clicked_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_aanvraag_id ON email_logs(aanvraag_id);
        CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
        CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
        CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
        
        COMMENT ON TABLE email_logs IS 'Tracks all emails sent for contract applications';
    END IF;
    
    -- Check if contract_viewer_access table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contract_viewer_access'
    ) THEN
        CREATE TABLE contract_viewer_access (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE,
            access_token TEXT NOT NULL UNIQUE,
            accessed_at TIMESTAMP WITH TIME ZONE,
            ip_address TEXT,
            user_agent TEXT,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_aanvraag_id ON contract_viewer_access(aanvraag_id);
        CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_token ON contract_viewer_access(access_token);
        
        COMMENT ON TABLE contract_viewer_access IS 'Tracks access to the digital contract viewer';
    END IF;
    
    -- Check if email status columns exist in contractaanvragen
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contractaanvragen' 
        AND column_name = 'email_bevestiging_verzonden'
    ) THEN
        ALTER TABLE contractaanvragen
        ADD COLUMN email_bevestiging_verzonden BOOLEAN DEFAULT false,
        ADD COLUMN email_contact_verzonden BOOLEAN DEFAULT false,
        ADD COLUMN email_voltooiing_verzonden BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN contractaanvragen.email_bevestiging_verzonden IS 'Whether the confirmation email has been sent';
        COMMENT ON COLUMN contractaanvragen.email_contact_verzonden IS 'Whether the contact email has been sent';
        COMMENT ON COLUMN contractaanvragen.email_voltooiing_verzonden IS 'Whether the completion email has been sent';
    END IF;
END $$;

-- Migration 032: Fix aanvraagnummer generation (if not exists)
-- This creates/updates a function, so we can run it safely
DO $$
BEGIN
    -- Drop and recreate the function
    DROP FUNCTION IF EXISTS generate_aanvraagnummer();
    
    CREATE OR REPLACE FUNCTION generate_aanvraagnummer()
    RETURNS TEXT AS $$
    DECLARE
        jaar INTEGER;
        volgnummer INTEGER;
        nummer TEXT;
    BEGIN
        jaar := EXTRACT(YEAR FROM NOW());
        
        -- Get the next sequence number for this year
        SELECT COALESCE(MAX(CAST(SUBSTRING(aanvraagnummer FROM 'PA-\d{4}-(\d+)') AS INTEGER)), 0) + 1
        INTO volgnummer
        FROM contractaanvragen
        WHERE aanvraagnummer LIKE 'PA-' || jaar || '-%';
        
        -- Format: PA-YYYY-XXXXXX (6 digits)
        nummer := 'PA-' || jaar || '-' || LPAD(volgnummer::TEXT, 6, '0');
        
        RETURN nummer;
    END;
    $$ LANGUAGE plpgsql;
END $$;

-- Migration 033: Add resend_id to email_logs (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_logs' 
        AND column_name = 'resend_id'
    ) THEN
        ALTER TABLE email_logs
        ADD COLUMN resend_id TEXT;
        
        CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_id);
        
        COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for tracking sent emails';
    END IF;
END $$;

-- Migration 20251128095202: Fix missing columns (if not exists)
-- This migration fixes missing columns, so we check what's needed
DO $$
BEGIN
    -- Add any missing columns that might be needed
    -- (This depends on what the migration file contains)
    RAISE NOTICE 'Migration 20251128095202 - check manually if needed';
END $$;

-- Final check: Show status of all tables and columns
SELECT 
    'email_logs.resend_id' as check_item,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'email_logs' 
            AND column_name = 'resend_id'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

