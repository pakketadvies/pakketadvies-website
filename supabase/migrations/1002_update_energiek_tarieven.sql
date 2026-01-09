-- Migration: Update Energiek.nl tarieven naar CORRECTE waardes
-- Date: 2026-01-09
-- Description: Fix Energiek.nl opslagen en vastrechten naar OFFICIËLE tarieven
--
-- BRON: Energiek.nl berekening screenshot (2000/3000/1000 voorbeeld)
-- 
-- ANALYSE UIT SCREENSHOT:
-- Levering: 166 kWh × (€0,09364 + €0,0180) = €18,54/m
-- Teruglevering: 250 kWh × (€0,0490 - €0,0180) = €7,75/m credit
-- Netto teruglevering tarief: €0,0310/kWh
-- 
-- BEREKENING VOOR DATABASE:
-- Spotprijs (onze EPEX): €0,09364
-- Gewenst teruglevering tarief: €0,0310
-- Dus: opslag_teruglevering = €0,09364 - €0,0310 = €0,06054
--
-- ELEKTRICITEIT:
-- - Inkoopvergoeding (opslag): €0,0180 per kWh
-- - Teruglevering afslag: €0,06054 per kWh (om van €0,09364 naar €0,0310 te komen)
-- - Vaste leveringskosten: €71,87 per jaar = €5,99 per maand (uit screenshot)
--
-- GAS:
-- - Inkoopvergoeding: €0,04959 per m³
-- - Vaste leveringskosten: €59,40 per jaar = €4,95 per maand

-- =====================================================
-- UPDATE ENERGIEK.NL DYNAMISCHE CONTRACTEN
-- =====================================================
UPDATE contract_details_dynamisch
SET
  opslag_elektriciteit = 0.0180,       -- €0,0180/kWh opslag elektriciteit (uit screenshot)
  opslag_gas = 0.04959,                -- €0,04959/m³ opslag gas
  opslag_teruglevering = 0.06054,      -- €0,06054/kWh AFSLAG om van €0,09364 naar €0,0310 te komen
  vastrecht_stroom_maand = 5.99,       -- €5,99/maand vastrecht stroom (€71,87/jaar uit screenshot)
  vastrecht_gas_maand = 4.95,          -- €4,95/maand vastrecht gas (€59,40/jaar)
  updated_at = NOW()
WHERE contract_id IN (
  SELECT c.id
  FROM contracten c
  JOIN leveranciers l ON c.leverancier_id = l.id
  WHERE l.naam = 'Energiek.nl'
    AND c.type = 'dynamisch'
    AND c.actief = true
);

-- =====================================================
-- VERIFICATIE
-- =====================================================
SELECT 
  c.naam,
  c.type,
  c.target_audience,
  cd.opslag_elektriciteit,
  cd.opslag_gas,
  cd.opslag_teruglevering,
  cd.vastrecht_stroom_maand,
  cd.vastrecht_gas_maand
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
JOIN contract_details_dynamisch cd ON c.id = cd.contract_id
WHERE l.naam = 'Energiek.nl'
  AND c.type = 'dynamisch'
  AND c.actief = true
ORDER BY c.target_audience;

-- Verwachte output:
-- naam                              | type      | target_audience | opslag_elektriciteit | opslag_gas | opslag_teruglevering | vastrecht_stroom_maand | vastrecht_gas_maand
-- ----------------------------------|-----------|-----------------|----------------------|------------|----------------------|------------------------|--------------------
-- Dynamisch Energiecontract         | dynamisch | particulier     | 0.0180               | 0.04959    | 0.06054              | 5.99                   | 4.95
-- Dynamisch Zakelijk Energiecontract| dynamisch | zakelijk        | 0.0180               | 0.04959    | 0.06054              | 5.99                   | 4.95

