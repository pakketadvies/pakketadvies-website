-- Migration: Add GridHub logs table for debugging
-- Date: 2026-01-07
-- Description: Creates table for storing GridHub API debugging logs

-- GridHub logs table
CREATE TABLE IF NOT EXISTS gridhub_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for gridhub_logs
CREATE INDEX IF NOT EXISTS idx_gridhub_logs_level ON gridhub_logs(level);
CREATE INDEX IF NOT EXISTS idx_gridhub_logs_created_at ON gridhub_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gridhub_logs_message ON gridhub_logs USING gin(to_tsvector('english', message));

-- Comments
COMMENT ON TABLE gridhub_logs IS 'Stores GridHub API debugging logs for admin debugging page';
COMMENT ON COLUMN gridhub_logs.level IS 'Log level: info, warn, error, debug';
COMMENT ON COLUMN gridhub_logs.message IS 'Log message';
COMMENT ON COLUMN gridhub_logs.data IS 'Additional log data (JSON)';
COMMENT ON COLUMN gridhub_logs.context IS 'Context information (JSON)';

