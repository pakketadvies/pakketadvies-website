-- =====================================================
-- DIAGNOSE SCRIPT: Check voorwaarden in database
-- =====================================================
-- Dit script checkt stap voor stap wat er in de database staat

-- STAP 1: Check of er überhaupt contracten zijn
SELECT 
  'STAP 1: Totaal aantal contracten' as stap,
  COUNT(*) as totaal,
  COUNT(*) FILTER (WHERE type = 'vast') as vast,
  COUNT(*) FILTER (WHERE type = 'dynamisch') as dynamisch,
  COUNT(*) FILTER (WHERE type = 'maatwerk') as maatwerk
FROM contracten;

-- STAP 2: Check of er contract_details records zijn
SELECT 
  'STAP 2: Contract details records' as stap,
  'VAST' as type,
  COUNT(*) as aantal
FROM contract_details_vast
UNION ALL
SELECT 
  'STAP 2: Contract details records' as stap,
  'DYNAMISCH' as type,
  COUNT(*) as aantal
FROM contract_details_dynamisch
UNION ALL
SELECT 
  'STAP 2: Contract details records' as stap,
  'MAATWERK' as type,
  COUNT(*) as aantal
FROM contract_details_maatwerk;

-- STAP 3: Check of voorwaarden kolommen NULL of leeg zijn
SELECT 
  'STAP 3: Voorwaarden status VAST' as stap,
  COUNT(*) as totaal_records,
  COUNT(*) FILTER (WHERE voorwaarden IS NULL) as null_voorwaarden,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) IS NULL) as lege_array,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) = 0) as array_length_0,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) > 0) as heeft_voorwaarden
FROM contract_details_vast;

SELECT 
  'STAP 3: Voorwaarden status DYNAMISCH' as stap,
  COUNT(*) as totaal_records,
  COUNT(*) FILTER (WHERE voorwaarden IS NULL) as null_voorwaarden,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) IS NULL) as lege_array,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) = 0) as array_length_0,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) > 0) as heeft_voorwaarden
FROM contract_details_dynamisch;

SELECT 
  'STAP 3: Voorwaarden status MAATWERK' as stap,
  COUNT(*) as totaal_records,
  COUNT(*) FILTER (WHERE voorwaarden IS NULL) as null_voorwaarden,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) IS NULL) as lege_array,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) = 0) as array_length_0,
  COUNT(*) FILTER (WHERE voorwaarden IS NOT NULL AND array_length(voorwaarden, 1) > 0) as heeft_voorwaarden
FROM contract_details_maatwerk;

-- STAP 4: Toon eerste paar contracten met hun voorwaarden (als die er zijn)
SELECT 
  'STAP 4: Sample VAST contracten' as stap,
  c.id,
  c.naam,
  cdv.voorwaarden,
  array_length(cdv.voorwaarden, 1) as array_length,
  CASE 
    WHEN cdv.voorwaarden IS NULL THEN 'NULL'
    WHEN array_length(cdv.voorwaarden, 1) IS NULL THEN 'Lege array'
    WHEN array_length(cdv.voorwaarden, 1) = 0 THEN 'Array lengte 0'
    ELSE 'Heeft voorwaarden: ' || array_length(cdv.voorwaarden, 1)::text
  END as status
FROM contracten c
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
LIMIT 5;

SELECT 
  'STAP 4: Sample DYNAMISCH contracten' as stap,
  c.id,
  c.naam,
  cdd.voorwaarden,
  array_length(cdd.voorwaarden, 1) as array_length,
  CASE 
    WHEN cdd.voorwaarden IS NULL THEN 'NULL'
    WHEN array_length(cdd.voorwaarden, 1) IS NULL THEN 'Lege array'
    WHEN array_length(cdd.voorwaarden, 1) = 0 THEN 'Array lengte 0'
    ELSE 'Heeft voorwaarden: ' || array_length(cdd.voorwaarden, 1)::text
  END as status
FROM contracten c
JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
LIMIT 5;

SELECT 
  'STAP 4: Sample MAATWERK contracten' as stap,
  c.id,
  c.naam,
  cdm.voorwaarden,
  array_length(cdm.voorwaarden, 1) as array_length,
  CASE 
    WHEN cdm.voorwaarden IS NULL THEN 'NULL'
    WHEN array_length(cdm.voorwaarden, 1) IS NULL THEN 'Lege array'
    WHEN array_length(cdm.voorwaarden, 1) = 0 THEN 'Array lengte 0'
    ELSE 'Heeft voorwaarden: ' || array_length(cdm.voorwaarden, 1)::text
  END as status
FROM contracten c
JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
LIMIT 5;

-- STAP 5: Als er voorwaarden zijn, toon ze dan
SELECT 
  'STAP 5: Individuele voorwaarden VAST' as stap,
  c.id as contract_id,
  c.naam as contract_naam,
  vw as voorwaarde,
  CASE 
    WHEN vw::text LIKE '{%' THEN 'JSON (mogelijk document)'
    ELSE 'String (tekstvoorwaarde)'
  END as type
FROM contracten c
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
CROSS JOIN LATERAL unnest(cdv.voorwaarden) AS vw
WHERE cdv.voorwaarden IS NOT NULL AND array_length(cdv.voorwaarden, 1) > 0
LIMIT 10;

SELECT 
  'STAP 5: Individuele voorwaarden DYNAMISCH' as stap,
  c.id as contract_id,
  c.naam as contract_naam,
  vw as voorwaarde,
  CASE 
    WHEN vw::text LIKE '{%' THEN 'JSON (mogelijk document)'
    ELSE 'String (tekstvoorwaarde)'
  END as type
FROM contracten c
JOIN contract_details_dynamisch cdd ON c.id = cdd.contract_id
CROSS JOIN LATERAL unnest(cdd.voorwaarden) AS vw
WHERE cdd.voorwaarden IS NOT NULL AND array_length(cdd.voorwaarden, 1) > 0
LIMIT 10;

SELECT 
  'STAP 5: Individuele voorwaarden MAATWERK' as stap,
  c.id as contract_id,
  c.naam as contract_naam,
  vw as voorwaarde,
  CASE 
    WHEN vw::text LIKE '{%' THEN 'JSON (mogelijk document)'
    ELSE 'String (tekstvoorwaarde)'
  END as type
FROM contracten c
JOIN contract_details_maatwerk cdm ON c.id = cdm.contract_id
CROSS JOIN LATERAL unnest(cdm.voorwaarden) AS vw
WHERE cdm.voorwaarden IS NOT NULL AND array_length(cdm.voorwaarden, 1) > 0
LIMIT 10;

