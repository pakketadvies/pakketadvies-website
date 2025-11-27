-- Migration: Fix aanvraagnummer generation function
-- Date: 2025-01-27
-- Description: Fixes the SUBSTRING logic to correctly extract the sequence number from PA-YYYY-XXXXXX format

-- Drop and recreate the function with correct logic
CREATE OR REPLACE FUNCTION generate_aanvraagnummer()
RETURNS TEXT AS $$
DECLARE
  jaar INTEGER;
  volgnummer INTEGER;
  nieuw_nummer TEXT;
BEGIN
  jaar := EXTRACT(YEAR FROM NOW());
  
  -- Vind het hoogste volgnummer voor dit jaar
  -- Format is PA-YYYY-XXXXXX, dus we moeten alles na "PA-YYYY-" pakken
  -- We gebruiken SPLIT_PART om het laatste deel (na de laatste "-") te krijgen
  SELECT COALESCE(MAX(CAST(SPLIT_PART(aanvraagnummer, '-', 3) AS INTEGER)), 0) + 1
  INTO volgnummer
  FROM contractaanvragen
  WHERE aanvraagnummer LIKE 'PA-' || jaar || '-%';
  
  -- Format: PA-YYYY-XXXXXX (6 cijfers)
  nieuw_nummer := 'PA-' || jaar || '-' || LPAD(volgnummer::TEXT, 6, '0');
  
  RETURN nieuw_nummer;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_aanvraagnummer() IS 'Generates unique application number in format PA-YYYY-XXXXXX with sequential numbering per year';

