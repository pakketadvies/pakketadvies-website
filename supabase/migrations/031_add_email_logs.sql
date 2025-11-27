-- Migration: Add email logs and contract viewer access tracking
-- Date: 2025-01-27
-- Description: Creates tables for email logging and contract viewer access tracking

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
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

-- Indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_aanvraag_id ON email_logs(aanvraag_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);

-- Contract viewer access tracking
CREATE TABLE IF NOT EXISTS contract_viewer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL UNIQUE,
  accessed_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for contract_viewer_access
CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_aanvraag_id ON contract_viewer_access(aanvraag_id);
CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_token ON contract_viewer_access(access_token);

-- Add email status flags to contractaanvragen
ALTER TABLE contractaanvragen
ADD COLUMN IF NOT EXISTS email_bevestiging_verzonden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_contact_verzonden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_voltooiing_verzonden BOOLEAN DEFAULT false;

-- Comments
COMMENT ON TABLE email_logs IS 'Tracks all emails sent for contract applications';
COMMENT ON TABLE contract_viewer_access IS 'Tracks access to the digital contract viewer';
COMMENT ON COLUMN contractaanvragen.email_bevestiging_verzonden IS 'Whether the confirmation email has been sent';
COMMENT ON COLUMN contractaanvragen.email_contact_verzonden IS 'Whether the contact email has been sent';
COMMENT ON COLUMN contractaanvragen.email_voltooiing_verzonden IS 'Whether the completion email has been sent';

