-- Migration: Add expires_at column to contract_viewer_access
-- Date: 2025-01-27
-- Description: Adds expires_at column to contract_viewer_access table (NULL = permanent access)

-- Add expires_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'contract_viewer_access' 
    AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE contract_viewer_access
    ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
    
    -- Keep existing tokens without expiration (NULL = permanent access)
    -- No UPDATE needed - NULL means permanent access
    
    -- Add comment
    COMMENT ON COLUMN contract_viewer_access.expires_at IS 'Token expiration date. NULL = permanent access (no expiration).';
    
    RAISE NOTICE '✅ Added expires_at column to contract_viewer_access table';
  ELSE
    RAISE NOTICE '⚠️  expires_at column already exists';
  END IF;
END $$;

-- Create index on expires_at for faster queries (only for non-NULL values)
CREATE INDEX IF NOT EXISTS idx_contract_viewer_access_expires_at 
ON contract_viewer_access(expires_at)
WHERE expires_at IS NOT NULL;

-- Update comment on table
COMMENT ON TABLE contract_viewer_access IS 'Tracks access to the digital contract viewer. Tokens with expires_at = NULL have permanent access.';

