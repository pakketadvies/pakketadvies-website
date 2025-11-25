-- =====================================================
-- EENVOUDIGE CHECK: Contracten met voorwaarden
-- =====================================================
-- Dit script controleert eerst of er überhaupt contracten met voorwaarden zijn
-- Run dit in Supabase SQL Editor

-- =====================================================
-- STAP 1: Check of er contracten zijn met voorwaarden
-- =====================================================
-- Dit laat zien hoeveel contracten er zijn per type

SELECT 
  'TOTAAL CONTRACTEN' as check_type,
  COUNT(*) FILTER (WHERE c.type = 'vast') as totaal_vast,
  COUNT(*) FILTER (WHERE c.type = 'dynamisch') as totaal_dynamisch,
  COUNT(*) FILTER (WHERE c.type = 'maatwerk') as totaal_maatwerk
FROM contracten c;

-- Check Vaste contracten met voorwaarden
SELECT 
  'VAST - Contracten met voorwaarden' as check_type,
  COUNT(*) as aantal,
  COUNT(*) FILTER (WHERE cdv.voorwaarden IS NOT NULL AND array_length(cdv.voorwaarden, 1) > 0) as met_voorwaarden
FROM contracten c
LEFT JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE c.type = 'vast';

-- Check Dynamische contracten met voorwaarden
SELECT 
  'DYNAMISCH - Contracten met voorwaarden' as check_type,
  COUNT(*) as aantal,
  COUNT(*) FILTER (WHERE cdd.voorwaarden IS NOT NULL AND array_length(cdd.voorwaarden, 1) > 0) as met_voorwaarden
FROM contracten c
LEFT JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
WHERE c.type = 'dynamisch';

-- Check Maatwerk contracten met voorwaarden
SELECT 
  'MAATWERK - Contracten met voorwaarden' as check_type,
  COUNT(*) as aantal,
  COUNT(*) FILTER (WHERE cdm.voorwaarden IS NOT NULL AND array_length(cdm.voorwaarden, 1) > 0) as met_voorwaarden
FROM contracten c
LEFT JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
WHERE c.type = 'maatwerk';

-- =====================================================
-- STAP 2: Laat alle voorwaarden zien (raw data)
-- =====================================================
-- Dit laat de ruwe data zien van voorwaarden

-- Vast - toon alle voorwaarden
SELECT 
  'VAST - Raw voorwaarden' as check_type,
  c.id as contract_id,
  c.naam as contract_naam,
  cdv.voorwaarden,
  array_length(cdv.voorwaarden, 1) as aantal_voorwaarden
FROM contracten c
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE cdv.voorwaarden IS NOT NULL AND array_length(cdv.voorwaarden, 1) > 0
LIMIT 10;

-- Dynamisch - toon alle voorwaarden
SELECT 
  'DYNAMISCH - Raw voorwaarden' as check_type,
  c.id as contract_id,
  c.naam as contract_naam,
  cdd.voorwaarden,
  array_length(cdd.voorwaarden, 1) as aantal_voorwaarden
FROM contracten c
JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
WHERE cdd.voorwaarden IS NOT NULL AND array_length(cdd.voorwaarden, 1) > 0
LIMIT 10;

-- Maatwerk - toon alle voorwaarden
SELECT 
  'MAATWERK - Raw voorwaarden' as check_type,
  c.id as contract_id,
  c.naam as contract_naam,
  cdm.voorwaarden,
  array_length(cdm.voorwaarden, 1) as aantal_voorwaarden
FROM contracten c
JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
WHERE cdm.voorwaarden IS NOT NULL AND array_length(cdm.voorwaarden, 1) > 0
LIMIT 10;

-- =====================================================
-- STAP 3: Check of voorwaarden JSON bevatten
-- =====================================================
-- Functie om te checken of een voorwaarde een document is
CREATE OR REPLACE FUNCTION is_document(voorwaarde_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Probeer te parsen als JSON
  BEGIN
    DECLARE
      parsed JSON;
    BEGIN
      parsed := voorwaarde_text::JSON;
      -- Check of het een object is met url en type pdf/doc
      IF parsed->>'url' IS NOT NULL AND (parsed->>'type' = 'pdf' OR parsed->>'type' = 'doc') THEN
        RETURN TRUE;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Als parsing faalt, is het waarschijnlijk een oude tekstvoorwaarde
      RETURN FALSE;
    END;
  END;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Nu checken met de functie
SELECT 
  'DOCUMENTEN CHECK' as check_type,
  contract_type,
  contract_id,
  contract_naam,
  voorwaarde_text,
  is_document(voorwaarde_text) as is_document,
  CASE 
    WHEN voorwaarde_text::text LIKE '{%' THEN 'JSON format'
    ELSE 'String format'
  END as format_type
FROM (
  -- Vast
  SELECT 
    'VAST' as contract_type,
    c.id as contract_id,
    c.naam as contract_naam,
    vw as voorwaarde_text
  FROM contracten c
  JOIN contract_details_vast cdv ON c.id = cdv.contract_id
  CROSS JOIN LATERAL unnest(cdv.voorwaarden) AS vw
  WHERE cdv.voorwaarden IS NOT NULL AND array_length(cdv.voorwaarden, 1) > 0
  
  UNION ALL
  
  -- Dynamisch
  SELECT 
    'DYNAMISCH' as contract_type,
    c.id as contract_id,
    c.naam as contract_naam,
    vw as voorwaarde_text
  FROM contracten c
  JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
  CROSS JOIN LATERAL unnest(cdd.voorwaarden) AS vw
  WHERE cdd.voorwaarden IS NOT NULL AND array_length(cdd.voorwaarden, 1) > 0
  
  UNION ALL
  
  -- Maatwerk
  SELECT 
    'MAATWERK' as contract_type,
    c.id as contract_id,
    c.naam as contract_naam,
    vw as voorwaarde_text
  FROM contracten c
  JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
  CROSS JOIN LATERAL unnest(cdm.voorwaarden) AS vw
  WHERE cdm.voorwaarden IS NOT NULL AND array_length(cdm.voorwaarden, 1) > 0
) all_voorwaarden
LIMIT 20;

