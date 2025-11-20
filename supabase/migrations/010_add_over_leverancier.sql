-- Add 'over_leverancier' field to leveranciers table
ALTER TABLE leveranciers 
ADD COLUMN IF NOT EXISTS over_leverancier TEXT;

COMMENT ON COLUMN leveranciers.over_leverancier IS 'Beschrijving over de leverancier (voor "Over leverancier" tab in resultaten)';

