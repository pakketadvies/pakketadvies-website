-- Migration: Maak maatwerkcontracten identiek aan vaste contracten + min_verbruik velden
-- Date: 2025-01-27
-- Description: Voeg alle velden van contract_details_vast toe aan contract_details_maatwerk
--              zodat maatwerkcontracten exact hetzelfde zijn als vaste contracten,
--              maar met extra velden voor minimale drempelwaarden (min_verbruik_elektriciteit, min_verbruik_gas)

-- ============================================
-- 1. Add looptijd (required for maatwerk contracts)
-- ============================================
ALTER TABLE contract_details_maatwerk
ADD COLUMN IF NOT EXISTS looptijd INTEGER CHECK (looptijd IN (1, 2, 3, 5));

COMMENT ON COLUMN contract_details_maatwerk.looptijd IS 'Contract looptijd in jaren (1, 2, 3, of 5)';

-- ============================================
-- 2. Add tarieven (same as vast contracts)
-- ============================================
ALTER TABLE contract_details_maatwerk
ADD COLUMN IF NOT EXISTS tarief_elektriciteit_enkel DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS tarief_elektriciteit_normaal DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS tarief_elektriciteit_dal DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS tarief_gas DECIMAL(10, 6),
ADD COLUMN IF NOT EXISTS tarief_teruglevering_kwh DECIMAL(10, 5) DEFAULT 0.00000;

COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_enkel IS 'Enkeltarief voor contracten zonder dag/nacht onderscheid (excl belastingen)';
COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_normaal IS 'Dagtarief voor dubbele meter contracten (excl belastingen)';
COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_dal IS 'Nachttarief voor dubbele meter contracten (excl belastingen)';
COMMENT ON COLUMN contract_details_maatwerk.tarief_gas IS 'Gastarief per m³ (excl belastingen)';
COMMENT ON COLUMN contract_details_maatwerk.tarief_teruglevering_kwh IS 'Tarief dat klanten betalen per kWh die ze terugleveren aan het net';

-- ============================================
-- 3. Add contract eigenschappen
-- ============================================
ALTER TABLE contract_details_maatwerk
ADD COLUMN IF NOT EXISTS groene_energie BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS prijsgarantie BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS opzegtermijn INTEGER DEFAULT 1;

COMMENT ON COLUMN contract_details_maatwerk.groene_energie IS '100% groene energie';
COMMENT ON COLUMN contract_details_maatwerk.prijsgarantie IS 'Prijsgarantie tijdens looptijd';
COMMENT ON COLUMN contract_details_maatwerk.opzegtermijn IS 'Opzegtermijn in maanden';

-- ============================================
-- 4. Add bijzonderheden array (same as vast contracts)
-- ============================================
ALTER TABLE contract_details_maatwerk
ADD COLUMN IF NOT EXISTS bijzonderheden TEXT[] DEFAULT '{}';

COMMENT ON COLUMN contract_details_maatwerk.bijzonderheden IS 'Lijst van bijzonderheden/speciale features';

-- ============================================
-- 5. Ensure vastrecht columns exist (already added in migration 016, but check)
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_maatwerk' 
                   AND column_name = 'vastrecht_stroom_maand') THEN
        ALTER TABLE contract_details_maatwerk ADD COLUMN vastrecht_stroom_maand DECIMAL(10,2) DEFAULT 4.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contract_details_maatwerk' 
                   AND column_name = 'vastrecht_gas_maand') THEN
        ALTER TABLE contract_details_maatwerk ADD COLUMN vastrecht_gas_maand DECIMAL(10,2) DEFAULT 4.00;
    END IF;
END $$;

-- ============================================
-- 6. Set defaults for existing maatwerk contracts
-- ============================================
UPDATE contract_details_maatwerk
SET 
    looptijd = COALESCE(looptijd, 1),
    tarief_teruglevering_kwh = COALESCE(tarief_teruglevering_kwh, 0.00000),
    groene_energie = COALESCE(groene_energie, false),
    prijsgarantie = COALESCE(prijsgarantie, false),
    opzegtermijn = COALESCE(opzegtermijn, 1),
    bijzonderheden = COALESCE(bijzonderheden, '{}'::TEXT[]),
    vastrecht_stroom_maand = COALESCE(vastrecht_stroom_maand, 4.00),
    vastrecht_gas_maand = COALESCE(vastrecht_gas_maand, 4.00)
WHERE looptijd IS NULL 
   OR tarief_teruglevering_kwh IS NULL
   OR groene_energie IS NULL
   OR prijsgarantie IS NULL
   OR opzegtermijn IS NULL
   OR bijzonderheden IS NULL
   OR vastrecht_stroom_maand IS NULL
   OR vastrecht_gas_maand IS NULL;

-- ============================================
-- 7. Verification
-- ============================================
DO $$
DECLARE
  maatwerk_count INTEGER;
  missing_fields_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO maatwerk_count FROM contract_details_maatwerk;
  
  SELECT COUNT(*) INTO missing_fields_count
  FROM contract_details_maatwerk
  WHERE looptijd IS NULL
     OR tarief_teruglevering_kwh IS NULL
     OR groene_energie IS NULL
     OR prijsgarantie IS NULL
     OR opzegtermijn IS NULL
     OR bijzonderheden IS NULL
     OR vastrecht_stroom_maand IS NULL
     OR vastrecht_gas_maand IS NULL;
  
  IF missing_fields_count > 0 THEN
    RAISE WARNING 'Er zijn nog % maatwerk contracten met ontbrekende velden', missing_fields_count;
  ELSE
    RAISE NOTICE '✅ Alle % maatwerk contracten hebben nu alle vereiste velden', maatwerk_count;
  END IF;
END $$;

