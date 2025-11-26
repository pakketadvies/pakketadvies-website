-- Migration: Add verbruik_type to contract_details_vast and contract_details_dynamisch
-- Date: 2025-01-XX
-- Description: Allows vast and dynamisch contracts to be filtered by kleinverbruik/grootverbruik

-- Add verbruik_type column to contract_details_vast
ALTER TABLE contract_details_vast 
ADD COLUMN IF NOT EXISTS verbruik_type TEXT DEFAULT 'beide' 
CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));

-- Update existing records to have default value
UPDATE contract_details_vast 
SET verbruik_type = 'beide' 
WHERE verbruik_type IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contract_details_vast_verbruik_type 
ON contract_details_vast(verbruik_type);

-- Add comment
COMMENT ON COLUMN contract_details_vast.verbruik_type IS 
'Bepaalt voor welk verbruikstype dit contract zichtbaar is: kleinverbruik (≤3x80A/≤G25), grootverbruik (>3x80A/>G25), of beide';

-- Add verbruik_type column to contract_details_dynamisch
ALTER TABLE contract_details_dynamisch 
ADD COLUMN IF NOT EXISTS verbruik_type TEXT DEFAULT 'beide' 
CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));

-- Update existing records to have default value
UPDATE contract_details_dynamisch 
SET verbruik_type = 'beide' 
WHERE verbruik_type IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contract_details_dynamisch_verbruik_type 
ON contract_details_dynamisch(verbruik_type);

-- Add comment
COMMENT ON COLUMN contract_details_dynamisch.verbruik_type IS 
'Bepaalt voor welk verbruikstype dit contract zichtbaar is: kleinverbruik (≤3x80A/≤G25), grootverbruik (>3x80A/>G25), of beide';

