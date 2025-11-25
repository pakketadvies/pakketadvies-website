-- =====================================================
-- CHECK SCRIPT: Contracten met documenten (PDF/DOC)
-- =====================================================
-- Dit script controleert welke contracten al documenten hebben geüpload
-- Run dit in Supabase SQL Editor

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

-- =====================================================
-- 1. VASTE CONTRACTEN
-- =====================================================
SELECT 
  'VAST' as contract_type,
  c.id as contract_id,
  c.naam as contract_naam,
  l.naam as leverancier_naam,
  COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
  COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden,
  array_agg(vw ORDER BY vw) FILTER (WHERE is_document(vw)) as documenten,
  array_agg(vw ORDER BY vw) FILTER (WHERE NOT is_document(vw)) as tekstvoorwaarden
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
CROSS JOIN LATERAL unnest(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[])) AS vw
WHERE array_length(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
GROUP BY c.id, c.naam, l.naam
ORDER BY aantal_documenten DESC, c.naam;

-- =====================================================
-- 2. DYNAMISCHE CONTRACTEN
-- =====================================================
SELECT 
  'DYNAMISCH' as contract_type,
  c.id as contract_id,
  c.naam as contract_naam,
  l.naam as leverancier_naam,
  COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
  COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden,
  array_agg(vw ORDER BY vw) FILTER (WHERE is_document(vw)) as documenten,
  array_agg(vw ORDER BY vw) FILTER (WHERE NOT is_document(vw)) as tekstvoorwaarden
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
CROSS JOIN LATERAL unnest(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[])) AS vw
WHERE array_length(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
GROUP BY c.id, c.naam, l.naam
ORDER BY aantal_documenten DESC, c.naam;

-- =====================================================
-- 3. MAATWERK CONTRACTEN
-- =====================================================
SELECT 
  'MAATWERK' as contract_type,
  c.id as contract_id,
  c.naam as contract_naam,
  l.naam as leverancier_naam,
  COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
  COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden,
  array_agg(vw ORDER BY vw) FILTER (WHERE is_document(vw)) as documenten,
  array_agg(vw ORDER BY vw) FILTER (WHERE NOT is_document(vw)) as tekstvoorwaarden
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
CROSS JOIN LATERAL unnest(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[])) AS vw
WHERE array_length(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
GROUP BY c.id, c.naam, l.naam
ORDER BY aantal_documenten DESC, c.naam;

-- =====================================================
-- 4. SAMENVATTING: Overzicht van alle contracten
-- =====================================================
SELECT 
  'OVERZICHT' as type,
  COUNT(DISTINCT CASE WHEN contract_type = 'VAST' THEN contract_id END) as vast_contracten_met_voorwaarden,
  COUNT(DISTINCT CASE WHEN contract_type = 'DYNAMISCH' THEN contract_id END) as dynamisch_contracten_met_voorwaarden,
  COUNT(DISTINCT CASE WHEN contract_type = 'MAATWERK' THEN contract_id END) as maatwerk_contracten_met_voorwaarden,
  COUNT(*) FILTER (WHERE is_document(vw)) as totaal_documenten,
  COUNT(*) FILTER (WHERE NOT is_document(vw)) as totaal_tekstvoorwaarden
FROM (
  -- Vast
  SELECT 'VAST' as contract_type, c.id as contract_id, vw
  FROM contracten c
  JOIN contract_details_vast cdv ON c.id = cdv.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
  
  UNION ALL
  
  -- Dynamisch
  SELECT 'DYNAMISCH' as contract_type, c.id as contract_id, vw
  FROM contracten c
  JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
  
  UNION ALL
  
  -- Maatwerk
  SELECT 'MAATWERK' as contract_type, c.id as contract_id, vw
  FROM contracten c
  JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
) all_voorwaarden;

-- =====================================================
-- 5. ALTERNATIEF: Simpel overzicht per contract type
-- =====================================================
-- Deze query geeft een korter overzicht zonder details

SELECT 
  contract_type,
  COUNT(DISTINCT contract_id) as aantal_contracten_met_voorwaarden,
  SUM(aantal_documenten) as totaal_documenten,
  SUM(aantal_tekstvoorwaarden) as totaal_tekstvoorwaarden
FROM (
  -- Vast
  SELECT 
    'VAST' as contract_type,
    c.id as contract_id,
    COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
    COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden
  FROM contracten c
  JOIN contract_details_vast cdv ON c.id = cdv.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdv.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
  GROUP BY c.id
  
  UNION ALL
  
  -- Dynamisch
  SELECT 
    'DYNAMISCH' as contract_type,
    c.id as contract_id,
    COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
    COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden
  FROM contracten c
  JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdd.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
  GROUP BY c.id
  
  UNION ALL
  
  -- Maatwerk
  SELECT 
    'MAATWERK' as contract_type,
    c.id as contract_id,
    COUNT(*) FILTER (WHERE is_document(vw)) as aantal_documenten,
    COUNT(*) FILTER (WHERE NOT is_document(vw)) as aantal_tekstvoorwaarden
  FROM contracten c
  JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
  CROSS JOIN LATERAL unnest(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[])) AS vw
  WHERE array_length(COALESCE(cdm.voorwaarden, ARRAY[]::TEXT[]), 1) > 0
  GROUP BY c.id
) per_contract
GROUP BY contract_type
ORDER BY contract_type;

