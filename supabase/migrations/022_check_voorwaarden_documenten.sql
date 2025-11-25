-- Script om te controleren welke contracten al documenten (PDF/DOC) hebben geüpload
-- Dit is een check script, geen migration

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

-- Check voor VASTE CONTRACTEN
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

-- Check voor DYNAMISCHE CONTRACTEN
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

-- Check voor MAATWERK CONTRACTEN
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

-- SAMENVATTING: Overzicht van alle contracten met voorwaarden
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

