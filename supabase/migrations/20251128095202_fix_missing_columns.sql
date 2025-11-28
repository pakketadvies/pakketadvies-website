-- Migration: Fix missing columns in email_logs and contract_viewer_access
-- Date: 2025-11-28
-- Description: Ensures resend_id and expires_at columns exist (fix for schema cache errors)

-- Add resend_id to email_logs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'email_logs' 
    AND column_name = 'resend_id'
  ) THEN
    ALTER TABLE email_logs ADD COLUMN resend_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_id);
    COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for tracking and debugging';
  END IF;
END $$;

-- Add expires_at to contract_viewer_access if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_viewer_access' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE contract_viewer_access ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_expires_at ON contract_viewer_access(expires_at);
    COMMENT ON COLUMN contract_viewer_access.expires_at IS 'Token expiration timestamp for contract viewer access';
  END IF;
END $$;

