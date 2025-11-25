-- ============================================================
-- Fix aansluitwaarden kleinverbruik/grootverbruik classificatie
-- 
-- Regels:
-- - Elektriciteit: alleen > 3x80A is grootverbruik
-- - Gas: alleen > G25 is grootverbruik
-- ============================================================

-- Update elektriciteit: 3x80A en kleiner zijn allemaal kleinverbruik
UPDATE aansluitwaarden_elektriciteit
SET 
  is_kleinverbruik = true,
  beschrijving = CASE
    WHEN code = '3x25A' THEN 'Standaard huishouden (tot 17,25 kW)'
    WHEN code = '3x35A' THEN 'Groot huishouden (tot 24,15 kW)'
    WHEN code = '3x40A' THEN 'Groot huishouden (tot 27,6 kW)'
    WHEN code = '3x50A' THEN 'Zakelijk kleinverbruik (tot 34,5 kW)'
    WHEN code = '3x63A' THEN 'Zakelijk kleinverbruik (tot 43,47 kW)'
    WHEN code = '3x80A' THEN 'Zakelijk kleinverbruik (tot 55,2 kW)'
    ELSE beschrijving
  END
WHERE code IN ('3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A');

-- Alleen > 3x80A wordt grootverbruik (als die bestaat)
UPDATE aansluitwaarden_elektriciteit
SET is_kleinverbruik = false
WHERE code LIKE '>3x80A%' OR code LIKE '%>3x80A%';

-- Update gas: G25 en kleiner zijn allemaal kleinverbruik
UPDATE aansluitwaarden_gas
SET 
  is_kleinverbruik = true,
  beschrijving = CASE
    WHEN code LIKE 'G6_%' THEN beschrijving  -- Behoud bestaande beschrijvingen voor G6 varianten
    WHEN code = 'G10' THEN 'Zakelijk kleinverbruik (tot 10 m³/uur)'
    WHEN code = 'G16' THEN 'Zakelijk kleinverbruik (tot 16 m³/uur)'
    WHEN code = 'G25' THEN 'Zakelijk kleinverbruik (tot 25 m³/uur)'
    ELSE beschrijving
  END
WHERE code IN ('G6_LAAG', 'G6_MIDDEN', 'G6_HOOG', 'G10', 'G16', 'G25');

-- Alleen > G25 wordt grootverbruik (als die bestaat)
UPDATE aansluitwaarden_gas
SET is_kleinverbruik = false
WHERE code LIKE '>G25%' OR code LIKE '%>G25%';

-- Verify changes
DO $$
DECLARE
  elek_count INT;
  gas_count INT;
BEGIN
  -- Count elektriciteit kleinverbruik (should be 6: 3x25A, 3x35A, 3x40A, 3x50A, 3x63A, 3x80A)
  SELECT COUNT(*) INTO elek_count
  FROM aansluitwaarden_elektriciteit
  WHERE code IN ('3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A')
    AND is_kleinverbruik = true;
  
  -- Count gas kleinverbruik (should include G6 variants, G10, G16, G25)
  SELECT COUNT(*) INTO gas_count
  FROM aansluitwaarden_gas
  WHERE code IN ('G6_LAAG', 'G6_MIDDEN', 'G6_HOOG', 'G10', 'G16', 'G25')
    AND is_kleinverbruik = true;
  
  RAISE NOTICE 'Updated elektriciteit kleinverbruik: % records', elek_count;
  RAISE NOTICE 'Updated gas kleinverbruik: % records', gas_count;
END $$;

