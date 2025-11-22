-- Migration: Split vastrecht into separate stroom and gas fields
-- Datum: 2025-11-21
-- Beschrijving: Leveranciers kunnen verschillende vastrechten hanteren voor stroom en gas
-- VERSIE 2: Werkt ook als vaste_kosten_maand kolom niet bestaat

-- =====================================================
-- 1. CONTRACT_DETAILS_VAST
-- =====================================================

-- Add new columns (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_vast' 
                   AND column_name = 'vastrecht_stroom_maand') THEN
        ALTER TABLE contract_details_vast ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_vast' 
                   AND column_name = 'vastrecht_gas_maand') THEN
        ALTER TABLE contract_details_vast ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);
    END IF;
END $$;

-- Check if vaste_kosten_maand exists and migrate data if it does
DO $$ 
DECLARE
    has_old_column BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_vast' 
        AND column_name = 'vaste_kosten_maand'
    ) INTO has_old_column;
    
    IF has_old_column THEN
        -- Migrate existing data: split current vaste_kosten_maand equally
        UPDATE contract_details_vast
        SET 
            vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
            vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
        WHERE vaste_kosten_maand IS NOT NULL AND vastrecht_stroom_maand IS NULL;
        
        RAISE NOTICE 'Migrated data from vaste_kosten_maand';
    END IF;
END $$;

-- Set defaults for NULL values
UPDATE contract_details_vast
SET 
    vastrecht_stroom_maand = 4.00,
    vastrecht_gas_maand = 4.00
WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;

-- Make new columns NOT NULL with defaults
ALTER TABLE contract_details_vast
ALTER COLUMN vastrecht_stroom_maand SET NOT NULL,
ALTER COLUMN vastrecht_stroom_maand SET DEFAULT 4.00,
ALTER COLUMN vastrecht_gas_maand SET NOT NULL,
ALTER COLUMN vastrecht_gas_maand SET DEFAULT 4.00;

COMMENT ON COLUMN contract_details_vast.vastrecht_stroom_maand IS 'Maandelijks vastrecht voor elektriciteit (EUR excl. BTW)';
COMMENT ON COLUMN contract_details_vast.vastrecht_gas_maand IS 'Maandelijks vastrecht voor gas (EUR excl. BTW)';

-- =====================================================
-- 2. CONTRACT_DETAILS_DYNAMISCH
-- =====================================================

-- Add new columns (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_dynamisch' 
                   AND column_name = 'vastrecht_stroom_maand') THEN
        ALTER TABLE contract_details_dynamisch ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_dynamisch' 
                   AND column_name = 'vastrecht_gas_maand') THEN
        ALTER TABLE contract_details_dynamisch ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);
    END IF;
END $$;

-- Check if vaste_kosten_maand exists and migrate data if it does
DO $$ 
DECLARE
    has_old_column BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_dynamisch' 
        AND column_name = 'vaste_kosten_maand'
    ) INTO has_old_column;
    
    IF has_old_column THEN
        -- Migrate existing data
        UPDATE contract_details_dynamisch
        SET 
            vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
            vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
        WHERE vaste_kosten_maand IS NOT NULL AND vastrecht_stroom_maand IS NULL;
        
        RAISE NOTICE 'Migrated data from vaste_kosten_maand';
    END IF;
END $$;

-- Set defaults for NULL values
UPDATE contract_details_dynamisch
SET 
    vastrecht_stroom_maand = 4.00,
    vastrecht_gas_maand = 4.00
WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;

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

-- Add new columns (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_maatwerk' 
                   AND column_name = 'vastrecht_stroom_maand') THEN
        ALTER TABLE contract_details_maatwerk ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_maatwerk' 
                   AND column_name = 'vastrecht_gas_maand') THEN
        ALTER TABLE contract_details_maatwerk ADD COLUMN vastrecht_gas_maand DECIMAL(10,2);
    END IF;
END $$;

-- Check if vaste_kosten_maand exists and migrate data if it does
DO $$ 
DECLARE
    has_old_column BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_maatwerk' 
        AND column_name = 'vaste_kosten_maand'
    ) INTO has_old_column;
    
    IF has_old_column THEN
        -- Migrate existing data
        UPDATE contract_details_maatwerk
        SET 
            vastrecht_stroom_maand = COALESCE(vaste_kosten_maand, 0) * 0.5,
            vastrecht_gas_maand = COALESCE(vaste_kosten_maand, 0) * 0.5
        WHERE vaste_kosten_maand IS NOT NULL AND vastrecht_stroom_maand IS NULL;
        
        RAISE NOTICE 'Migrated data from vaste_kosten_maand';
    END IF;
END $$;

-- Set defaults for NULL values (maatwerk can have NULL)
UPDATE contract_details_maatwerk
SET 
    vastrecht_stroom_maand = 4.00,
    vastrecht_gas_maand = 4.00
WHERE vastrecht_stroom_maand IS NULL OR vastrecht_gas_maand IS NULL;

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
  
  SELECT COUNT(*) INTO vast_count FROM contract_details_vast;
  RAISE NOTICE '✅ All % vast contracts migrated successfully', vast_count;
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
  
  SELECT COUNT(*) INTO dynamisch_count FROM contract_details_dynamisch;
  RAISE NOTICE '✅ All % dynamisch contracts migrated successfully', dynamisch_count;
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
  
  SELECT COUNT(*) INTO maatwerk_count FROM contract_details_maatwerk;
  RAISE NOTICE '✅ All % maatwerk contracts migrated successfully', maatwerk_count;
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '====================================================';
    RAISE NOTICE '✅ MIGRATIE SUCCESVOL VOLTOOID';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Nieuwe kolommen toegevoegd:';
    RAISE NOTICE '  - vastrecht_stroom_maand (default €4.00)';
    RAISE NOTICE '  - vastrecht_gas_maand (default €4.00)';
    RAISE NOTICE '';
    RAISE NOTICE 'Volgende stap: Update contracten in admin panel';
    RAISE NOTICE '====================================================';
END $$;

