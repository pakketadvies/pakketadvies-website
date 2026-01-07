-- Migration: Add aanvraag_id to gridhub_logs table
-- Date: 2026-01-07
-- Description: Adds aanvraag_id column to link GridHub logs to specific aanvragen

-- Add aanvraag_id column to gridhub_logs
ALTER TABLE gridhub_logs
ADD COLUMN IF NOT EXISTS aanvraag_id UUID REFERENCES contractaanvragen(id) ON DELETE CASCADE;

-- Add index for faster lookups by aanvraag_id
CREATE INDEX IF NOT EXISTS idx_gridhub_logs_aanvraag_id ON gridhub_logs(aanvraag_id);

-- Add comment
COMMENT ON COLUMN gridhub_logs.aanvraag_id IS 'Links GridHub log to specific contractaanvraag';

