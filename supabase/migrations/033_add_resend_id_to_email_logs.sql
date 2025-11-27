-- Migration: Add resend_id column to email_logs table and expires_at to contract_viewer_access
-- Date: 2025-11-27
-- Description: Adds resend_id column to track Resend email IDs and expires_at for token expiration

-- Add resend_id to email_logs
ALTER TABLE email_logs
ADD COLUMN IF NOT EXISTS resend_id TEXT;

-- Add index for resend_id lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_id);

-- Add comment
COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for tracking and debugging';

-- Add expires_at to contract_viewer_access
ALTER TABLE contract_viewer_access
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for expires_at lookups
CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_expires_at ON contract_viewer_access(expires_at);

-- Add comment
COMMENT ON COLUMN contract_viewer_access.expires_at IS 'Token expiration timestamp for contract viewer access';

