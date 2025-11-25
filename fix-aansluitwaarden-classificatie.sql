-- ============================================================
-- Fix aansluitwaarden kleinverbruik/grootverbruik classificatie
-- 
-- Regels volgens gebruiker:
-- - Elektriciteit: alleen > 3x80A is grootverbruik (dus 3x80A zelf is nog kleinverbruik)
-- - Gas: alleen > G25 is grootverbruik (dus G25 zelf is nog kleinverbruik)
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

-- Alleen > 3x80A wordt grootverbruik (als die bestaat in de toekomst)
UPDATE aansluitwaarden_elektriciteit
SET is_kleinverbruik = false
WHERE code LIKE '>3x80A%' OR code LIKE '%>3x80A%';

-- Update gas: G25 en kleiner zijn allemaal kleinverbruik
UPDATE aansluitwaarden_gas
SET 
  is_kleinverbruik = true,
  beschrijving = CASE
    WHEN code = 'G10' THEN 'Zakelijk kleinverbruik (tot 10 m³/uur)'
    WHEN code = 'G16' THEN 'Zakelijk kleinverbruik (tot 16 m³/uur)'
    WHEN code = 'G25' THEN 'Zakelijk kleinverbruik (tot 25 m³/uur)'
    ELSE beschrijving  -- Behoud bestaande beschrijvingen voor G6 varianten
  END
WHERE code IN ('G6_LAAG', 'G6_MIDDEN', 'G6_HOOG', 'G10', 'G16', 'G25');

-- Alleen > G25 wordt grootverbruik (als die bestaat in de toekomst)
UPDATE aansluitwaarden_gas
SET is_kleinverbruik = false
WHERE code LIKE '>G25%' OR code LIKE '%>G25%';

-- Verify changes
SELECT 
  'ELEKTRICITEIT' as type,
  code,
  naam,
  is_kleinverbruik,
  beschrijving
FROM aansluitwaarden_elektriciteit
WHERE code IN ('3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A')
ORDER BY volgorde;

SELECT 
  'GAS' as type,
  code,
  naam,
  is_kleinverbruik,
  beschrijving
FROM aansluitwaarden_gas
WHERE code IN ('G6_LAAG', 'G6_MIDDEN', 'G6_HOOG', 'G10', 'G16', 'G25')
ORDER BY volgorde;

