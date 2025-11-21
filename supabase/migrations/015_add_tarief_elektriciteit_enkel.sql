-- =====================================================
-- MIGRATION: Add tarief_elektriciteit_enkel to contract_details_vast
-- =====================================================
-- Dit veld was missing in de originele schema en is nodig voor 
-- contracten met enkele meters (geen normaal/dal splitsing)

-- Voeg tarief_elektriciteit_enkel toe aan contract_details_vast
ALTER TABLE contract_details_vast
ADD COLUMN IF NOT EXISTS tarief_elektriciteit_enkel DECIMAL(6,6);

-- Voeg comment toe voor duidelijkheid
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_enkel IS 'Elektriciteit tarief voor enkele meters (zonder dag/nacht splitsing) in €/kWh';

-- Update bestaande contracten: gebruik normaal tarief als enkeltarief (fallback)
-- Dit is een eenmalige data migratie voor bestaande contracten
UPDATE contract_details_vast
SET tarief_elektriciteit_enkel = tarief_elektriciteit_normaal
WHERE tarief_elektriciteit_enkel IS NULL;

-- Verification query
SELECT 
  c.naam as contract_naam,
  cdv.tarief_elektriciteit_enkel,
  cdv.tarief_elektriciteit_normaal,
  cdv.tarief_elektriciteit_dal,
  CASE 
    WHEN cdv.tarief_elektriciteit_enkel IS NOT NULL THEN '✅ Heeft enkeltarief'
    ELSE '❌ Geen enkeltarief'
  END as status
FROM contracten c
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE c.actief = true
ORDER BY c.naam;

