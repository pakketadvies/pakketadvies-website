-- Voeg enkeltarief veld toe aan contract_details_vast
ALTER TABLE contract_details_vast 
ADD COLUMN IF NOT EXISTS tarief_elektriciteit_enkel DECIMAL(10, 6);

-- Verander precisie van bestaande tarief velden naar 6 decimalen
ALTER TABLE contract_details_vast 
ALTER COLUMN tarief_elektriciteit_normaal TYPE DECIMAL(10, 6),
ALTER COLUMN tarief_elektriciteit_dal TYPE DECIMAL(10, 6),
ALTER COLUMN tarief_gas TYPE DECIMAL(10, 6);

-- Ook voor dynamisch
ALTER TABLE contract_details_dynamisch
ALTER COLUMN opslag_elektriciteit_normaal TYPE DECIMAL(10, 6),
ALTER COLUMN opslag_elektriciteit_dal TYPE DECIMAL(10, 6),
ALTER COLUMN opslag_gas TYPE DECIMAL(10, 6);

COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_enkel IS 'Enkeltarief voor contracten zonder dag/nacht onderscheid (excl belastingen)';
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_normaal IS 'Dagtarief voor dubbele meter contracten (excl belastingen)';
COMMENT ON COLUMN contract_details_vast.tarief_elektriciteit_dal IS 'Nachttarief voor dubbele meter contracten (excl belastingen)';

