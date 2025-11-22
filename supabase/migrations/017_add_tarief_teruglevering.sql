-- Migration: Add tarief_teruglevering_kwh to contract_details_vast
-- Date: 2025-11-22
-- Description: Add return delivery tariff for fixed contracts with solar panels

-- ============================================
-- 1. Add tarief_teruglevering_kwh to contract_details_vast
-- ============================================

ALTER TABLE contract_details_vast 
ADD COLUMN IF NOT EXISTS tarief_teruglevering_kwh DECIMAL(10, 5) DEFAULT 0.00000;

COMMENT ON COLUMN contract_details_vast.tarief_teruglevering_kwh IS 
'Tarief dat klanten betalen per kWh die ze terugleveren aan het net (alleen bij vaste contracten met salderingsregeling)';

-- ============================================
-- 2. Update existing contracts with default value
-- ============================================
-- Set default to 0 for existing contracts (can be updated later via admin panel)
UPDATE contract_details_vast 
SET tarief_teruglevering_kwh = 0.00000 
WHERE tarief_teruglevering_kwh IS NULL;

-- ============================================
-- 3. Verification
-- ============================================
-- Check that all contracts have the new field
DO $$
DECLARE
  missing_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO missing_count
  FROM contract_details_vast
  WHERE tarief_teruglevering_kwh IS NULL;
  
  IF missing_count > 0 THEN
    RAISE WARNING 'Er zijn nog % contracten zonder tarief_teruglevering_kwh', missing_count;
  ELSE
    RAISE NOTICE '✅ Alle contracten hebben nu een tarief_teruglevering_kwh veld';
  END IF;
END $$;

