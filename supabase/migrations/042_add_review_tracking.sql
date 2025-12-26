-- Migration: Add review tracking to contractaanvragen
-- Date: 2025-01-27
-- Description: Adds columns to track review email sending and review completion

-- Add review tracking columns
ALTER TABLE contractaanvragen
ADD COLUMN IF NOT EXISTS review_email_verzonden BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_email_verzonden_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS review_gegeven BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_gegeven_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_contractaanvragen_review_email 
ON contractaanvragen(review_email_verzonden, review_gegeven);

-- Add comment
COMMENT ON COLUMN contractaanvragen.review_email_verzonden IS 'Whether the review request email has been sent';
COMMENT ON COLUMN contractaanvragen.review_email_verzonden_at IS 'When the review request email was sent';
COMMENT ON COLUMN contractaanvragen.review_gegeven IS 'Whether the customer has given a review';
COMMENT ON COLUMN contractaanvragen.review_gegeven_at IS 'When the customer gave a review';

