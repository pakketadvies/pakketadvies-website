-- Migration: Restructure contract_details_dynamisch for dynamic pricing
-- Date: 2025-01-26
-- Description: 
--   1. Rename opslag_elektriciteit_normaal to opslag_elektriciteit
--   2. Remove opslag_elektriciteit_dal
--   3. Remove vaste_kosten_maand (we have vastrecht_stroom_maand + vastrecht_gas_maand)
--   4. Add opslag_teruglevering for solar panel return pricing

-- ============================================
-- 1. RENAME opslag_elektriciteit_normaal → opslag_elektriciteit
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_dynamisch' 
        AND column_name = 'opslag_elektriciteit_normaal'
        AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'contract_details_dynamisch' 
            AND column_name = 'opslag_elektriciteit'
        )
    ) THEN
        ALTER TABLE contract_details_dynamisch 
        RENAME COLUMN opslag_elektriciteit_normaal TO opslag_elektriciteit;
        
        RAISE NOTICE '✅ Renamed opslag_elektriciteit_normaal to opslag_elektriciteit';
    ELSE
        RAISE NOTICE 'ℹ️ Column already renamed or does not exist';
    END IF;
END $$;

-- ============================================
-- 2. REMOVE opslag_elektriciteit_dal
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_dynamisch' 
        AND column_name = 'opslag_elektriciteit_dal'
    ) THEN
        ALTER TABLE contract_details_dynamisch 
        DROP COLUMN opslag_elektriciteit_dal;
        
        RAISE NOTICE '✅ Removed opslag_elektriciteit_dal column';
    ELSE
        RAISE NOTICE 'ℹ️ Column opslag_elektriciteit_dal does not exist (already removed)';
    END IF;
END $$;

-- ============================================
-- 3. REMOVE vaste_kosten_maand (redundant with vastrecht_stroom_maand + vastrecht_gas_maand)
-- ============================================

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contract_details_dynamisch' 
        AND column_name = 'vaste_kosten_maand'
    ) THEN
        ALTER TABLE contract_details_dynamisch 
        DROP COLUMN vaste_kosten_maand;
        
        RAISE NOTICE '✅ Removed vaste_kosten_maand column (using vastrecht_stroom_maand + vastrecht_gas_maand instead)';
    ELSE
        RAISE NOTICE 'ℹ️ Column vaste_kosten_maand does not exist (already removed)';
    END IF;
END $$;

-- ============================================
-- 4. ADD opslag_teruglevering
-- ============================================

ALTER TABLE contract_details_dynamisch 
ADD COLUMN IF NOT EXISTS opslag_teruglevering DECIMAL(10, 5) DEFAULT 0.00000;

COMMENT ON COLUMN contract_details_dynamisch.opslag_teruglevering IS 
'Opslag bovenop spotprijs voor teruglevering (€/kWh). Meestal negatief of 0. Wordt gebruikt om P_teruglever te berekenen: P_teruglever = S_enkel + opslag_teruglevering';

-- Update existing contracts with default value
UPDATE contract_details_dynamisch 
SET opslag_teruglevering = 0.00000 
WHERE opslag_teruglevering IS NULL;

-- ============================================
-- 5. VERIFICATION
-- ============================================

DO $$
DECLARE
  has_opslag_elektriciteit BOOLEAN;
  has_opslag_teruglevering BOOLEAN;
  has_old_normaal BOOLEAN;
  has_dal BOOLEAN;
  has_vaste_kosten BOOLEAN;
  contract_count INTEGER;
BEGIN
  -- Check new columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_details_dynamisch' 
    AND column_name = 'opslag_elektriciteit'
  ) INTO has_opslag_elektriciteit;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_details_dynamisch' 
    AND column_name = 'opslag_teruglevering'
  ) INTO has_opslag_teruglevering;
  
  -- Check old columns are removed
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_details_dynamisch' 
    AND column_name = 'opslag_elektriciteit_normaal'
  ) INTO has_old_normaal;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_details_dynamisch' 
    AND column_name = 'opslag_elektriciteit_dal'
  ) INTO has_dal;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contract_details_dynamisch' 
    AND column_name = 'vaste_kosten_maand'
  ) INTO has_vaste_kosten;
  
  SELECT COUNT(*) INTO contract_count FROM contract_details_dynamisch;
  
  -- Report
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ MIGRATIE RESULTAAT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Nieuwe kolommen:';
  RAISE NOTICE '  - opslag_elektriciteit: %', CASE WHEN has_opslag_elektriciteit THEN '✅' ELSE '❌' END;
  RAISE NOTICE '  - opslag_teruglevering: %', CASE WHEN has_opslag_teruglevering THEN '✅' ELSE '❌' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Oude kolommen verwijderd:';
  RAISE NOTICE '  - opslag_elektriciteit_normaal: %', CASE WHEN NOT has_old_normaal THEN '✅ Verwijderd' ELSE '❌ Nog aanwezig' END;
  RAISE NOTICE '  - opslag_elektriciteit_dal: %', CASE WHEN NOT has_dal THEN '✅ Verwijderd' ELSE '❌ Nog aanwezig' END;
  RAISE NOTICE '  - vaste_kosten_maand: %', CASE WHEN NOT has_vaste_kosten THEN '✅ Verwijderd' ELSE '❌ Nog aanwezig' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Totaal dynamische contracten: %', contract_count;
  RAISE NOTICE '====================================================';
  
  -- Verify all new fields exist
  IF NOT has_opslag_elektriciteit OR NOT has_opslag_teruglevering THEN
    RAISE EXCEPTION 'Migration failed: Required columns missing';
  END IF;
  
  -- Warn if old columns still exist
  IF has_old_normaal OR has_dal OR has_vaste_kosten THEN
    RAISE WARNING 'Some old columns still exist - manual cleanup may be needed';
  END IF;
END $$;

