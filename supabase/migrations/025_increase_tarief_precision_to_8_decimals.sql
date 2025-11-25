-- Migration: Verhoog precisie tarieven naar 8 decimalen achter de komma
-- Date: 2025-01-27
-- Description: Verhoog DECIMAL precisie van 6 naar 8 decimalen voor alle tarieven in contract_details_vast en contract_details_maatwerk

-- ============================================
-- 1. Update contract_details_vast tarieven
-- ============================================
ALTER TABLE contract_details_vast
ALTER COLUMN tarief_elektriciteit_enkel TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_elektriciteit_normaal TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_elektriciteit_dal TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_gas TYPE DECIMAL(10, 8);

-- ============================================
-- 2. Update contract_details_maatwerk tarieven
-- ============================================
ALTER TABLE contract_details_maatwerk
ALTER COLUMN tarief_elektriciteit_enkel TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_elektriciteit_normaal TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_elektriciteit_dal TYPE DECIMAL(10, 8),
ALTER COLUMN tarief_gas TYPE DECIMAL(10, 8);

-- ============================================
-- 3. Update comments
-- ============================================
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_enkel IS 'Enkeltarief voor contracten zonder dag/nacht onderscheid (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_normaal IS 'Dagtarief voor dubbele meter contracten (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_dal IS 'Nachttarief voor dubbele meter contracten (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_vast.tarief_gas IS 'Gastarief per m³ (excl belastingen) - precisie: 8 decimalen';

COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_enkel IS 'Enkeltarief voor contracten zonder dag/nacht onderscheid (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_normaal IS 'Dagtarief voor dubbele meter contracten (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_maatwerk.tarief_elektriciteit_dal IS 'Nachttarief voor dubbele meter contracten (excl belastingen) - precisie: 8 decimalen';
COMMENT ON COLUMN contract_details_maatwerk.tarief_gas IS 'Gastarief per m³ (excl belastingen) - precisie: 8 decimalen';

