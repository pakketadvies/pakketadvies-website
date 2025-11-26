-- Migration: Add verbruik_type to contracten_details_maatwerk
-- Date: 2025-01-XX
-- Description: Allows maatwerk contracts to be filtered by kleinverbruik/grootverbruik

-- Add verbruik_type column with default value 'beide' (backwards compatible)
ALTER TABLE contracten_details_maatwerk 
ADD COLUMN IF NOT EXISTS verbruik_type TEXT DEFAULT 'beide' 
CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));

-- Update existing records to have default value (if somehow NULL exists)
UPDATE contracten_details_maatwerk 
SET verbruik_type = 'beide' 
WHERE verbruik_type IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contracten_details_maatwerk_verbruik_type 
ON contracten_details_maatwerk(verbruik_type);

-- Add comment
COMMENT ON COLUMN contracten_details_maatwerk.verbruik_type IS 
'Bepaalt voor welk verbruikstype dit maatwerk contract zichtbaar is: kleinverbruik (≤3x80A/≤G25), grootverbruik (>3x80A/>G25), of beide';

