-- Migration: Add resend_id column to email_logs table
-- Date: 2025-11-27
-- Description: Adds resend_id column to track Resend email IDs for email logs

-- Add resend_id column to email_logs table
ALTER TABLE email_logs
ADD COLUMN IF NOT EXISTS resend_id TEXT;

-- Add index for resend_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_resend_id ON email_logs(resend_id);

-- Add comment
COMMENT ON COLUMN email_logs.resend_id IS 'Resend API email ID for tracking sent emails';

