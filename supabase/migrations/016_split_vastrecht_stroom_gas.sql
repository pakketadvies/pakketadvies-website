-- Migration: Split vaste_kosten_maand into separate stroom and gas vastrecht
-- Datum: 2025-11-21
-- Beschrijving: Leveranciers kunnen verschillende vastrechten hanteren voor stroom en gas

-- =====================================================
-- 1. CONTRACT_DETAILS_VAST
-- =====================================================

-- Add new columns
ALTER TABLE contract_details_vast
ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2),
ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);

-- Migrate existing data: split current vaste_kosten_maand equally
-- (admin can adjust these manually later if needed)
UPDATE contract_details_vast
SET 
  vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
  vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
WHERE vaste_kosten_maand IS NOT NULL;

-- For records with NULL vaste_kosten_maand, set defaults
UPDATE contract_details_vast
SET 
  vastrecht_stroom_maand = 4.00,
  vastrecht_gas_maand = 4.00
WHERE vaste_kosten_maand IS NULL;

-- Make new columns NOT NULL with defaults
ALTER TABLE contract_details_vast
ALTER COLUMN vastrecht_stroom_maand SET NOT NULL,
ALTER COLUMN vastrecht_stroom_maand SET DEFAULT 4.00,
ALTER COLUMN vastrecht_gas_maand SET NOT NULL,
ALTER COLUMN vastrecht_gas_maand SET DEFAULT 4.00;

-- Keep old column for backward compatibility (for now)
-- We can remove it in a future migration after all systems are updated
-- ALTER TABLE contract_details_vast DROP COLUMN vaste_kosten_maand;

COMMENT ON COLUMN contract_details_vast.vastrecht_stroom_maand IS 'Maandelijks vastrecht voor elektriciteit (EUR excl. BTW)';
COMMENT ON COLUMN contract_details_vast.vastrecht_gas_maand IS 'Maandelijks vastrecht voor gas (EUR excl. BTW)';

-- =====================================================
-- 2. CONTRACT_DETAILS_DYNAMISCH
-- =====================================================

-- Add new columns
ALTER TABLE contract_details_dynamisch
ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2),
ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);

-- Migrate existing data
UPDATE contract_details_dynamisch
SET 
  vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
  vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
WHERE vaste_kosten_maand IS NOT NULL;

-- For records with NULL vaste_kosten_maand, set defaults
UPDATE contract_details_dynamisch
SET 
  vastrecht_stroom_maand = 4.00,
  vastrecht_gas_maand = 4.00
WHERE vaste_kosten_maand IS NULL;

-- Make new columns NOT NULL with defaults
ALTER TABLE contract_details_dynamisch
ALTER COLUMN vastrecht_stroom_maand SET NOT NULL,
ALTER COLUMN vastrecht_stroom_maand SET DEFAULT 4.00,
ALTER COLUMN vastrecht_gas_maand SET NOT NULL,
ALTER COLUMN vastrecht_gas_maand SET DEFAULT 4.00;

COMMENT ON COLUMN contract_details_dynamisch.vastrecht_stroom_maand IS 'Maandelijks vastrecht voor elektriciteit (EUR excl. BTW)';
COMMENT ON COLUMN contract_details_dynamisch.vastrecht_gas_maand IS 'Maandelijks vastrecht voor gas (EUR excl. BTW)';

-- =====================================================
-- 3. CONTRACT_DETAILS_MAATWERK
-- =====================================================

-- Add new columns
ALTER TABLE contract_details_maatwerk
ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2),
ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);

-- Migrate existing data
UPDATE contract_details_maatwerk
SET 
  vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
  vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
WHERE vaste_kosten_maand IS NOT NULL;

-- For records with NULL vaste_kosten_maand, set defaults
UPDATE contract_details_maatwerk
SET 
  vastrecht_stroom_maand = 4.00,
  vastrecht_gas_maand = 4.00
WHERE vaste_kosten_maand IS NULL;

-- Make new columns NOT NULL with defaults
ALTER TABLE contract_details_maatwerk
ALTER COLUMN vastrecht_stroom_maand SET NOT NULL,
ALTER COLUMN vastrecht_stroom_maand SET DEFAULT 4.00,
ALTER COLUMN vastrecht_gas_maand SET NOT NULL,
ALTER COLUMN vastrecht_gas_maand SET DEFAULT 4.00;

COMMENT ON COLUMN contract_details_maatwerk.vastrecht_stroom_maand IS 'Maandelijks vastrecht voor elektriciteit (EUR excl. BTW)';
COMMENT ON COLUMN contract_details_maatwerk.vastrecht_gas_maand IS 'Maandelijks vastrecht voor gas (EUR excl. BTW)';

-- =====================================================
-- VERIFICATIE
-- =====================================================

-- Check vast contracts
DO $$
DECLARE
  vast_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO vast_count
  FROM contract_details_vast
  WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;
  
  IF vast_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % vast contracts have NULL vastrecht values', vast_count;
  END IF;
  
  RAISE NOTICE '✅ All % vast contracts migrated successfully', (SELECT COUNT(*) FROM contract_details_vast);
END $$;

-- Check dynamisch contracts
DO $$
DECLARE
  dynamisch_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dynamisch_count
  FROM contract_details_dynamisch
  WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;
  
  IF dynamisch_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % dynamisch contracts have NULL vastrecht values', dynamisch_count;
  END IF;
  
  RAISE NOTICE '✅ All % dynamisch contracts migrated successfully', (SELECT COUNT(*) FROM contract_details_dynamisch);
END $$;

-- Check maatwerk contracts
DO $$
DECLARE
  maatwerk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO maatwerk_count
  FROM contract_details_maatwerk
  WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;
  
  IF maatwerk_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % maatwerk contracts have NULL vastrecht values', maatwerk_count;
  END IF;
  
  RAISE NOTICE '✅ All % maatwerk contracts migrated successfully', (SELECT COUNT(*) FROM contract_details_maatwerk);
END $$;

-- =====================================================
-- NOTITIE VOOR ADMIN
-- =====================================================

-- Na deze migratie moet de admin de vastrechten controleren en aanpassen waar nodig.
-- De huidige vaste_kosten_maand is 50/50 gesplitst, maar dit kan per leverancier verschillen.

