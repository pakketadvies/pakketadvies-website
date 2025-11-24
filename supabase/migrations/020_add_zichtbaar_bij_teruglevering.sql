-- Migration: Add zichtbaar_bij_teruglevering field to contracten table
-- Date: 2025-11-25
-- Description: Allows contracts to be filtered based on whether customer has solar panels/teruglevering

-- Add zichtbaar_bij_teruglevering column
-- NULL = always show (default)
-- TRUE = only show when customer has teruglevering (terugleveringJaar > 0)
-- FALSE = only show when customer has NO teruglevering (terugleveringJaar = 0)
ALTER TABLE contracten
ADD COLUMN IF NOT EXISTS zichtbaar_bij_teruglevering BOOLEAN DEFAULT NULL;

-- Add comment to explain the field
COMMENT ON COLUMN contracten.zichtbaar_bij_teruglevering IS 
'NULL = altijd tonen (default), TRUE = alleen tonen bij teruglevering, FALSE = alleen tonen zonder teruglevering';

-- Verification
DO $$
DECLARE
  contract_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO contract_count FROM contracten;
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ MIGRATIE RESULTAAT';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Nieuw veld toegevoegd:';
  RAISE NOTICE '  - zichtbaar_bij_teruglevering: ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'Totaal contracten: %', contract_count;
  RAISE NOTICE '====================================================';
END $$;

