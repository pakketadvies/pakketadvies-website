-- Migration: Add debug logs table
-- Date: 2025-01-27
-- Description: Creates table for storing debug logs from client-side components

CREATE TABLE IF NOT EXISTS debug_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_debug_logs_timestamp ON debug_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_debug_logs_level ON debug_logs(level);
CREATE INDEX IF NOT EXISTS idx_debug_logs_url ON debug_logs(url);

-- Add comment
COMMENT ON TABLE debug_logs IS 'Stores debug logs from client-side components for troubleshooting mobile issues';

