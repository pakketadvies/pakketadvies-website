-- Migration: Update Energiek.nl tarieven naar CORRECTE waardes
-- Date: 2026-01-09
-- Description: Fix Energiek.nl opslagen en vastrechten naar exact wat ze op hun site tonen
--
-- BRON: Energiek.nl aanmeldstraat screenshot (2000/3000/1000 voorbeeld)
-- Inkoop: €0,11164 = Spotprijs (€0,09364) + Opslag (€0,018)
-- Teruglevering: €0,07564 = Spotprijs (€0,09364) - Afslag (€0,018)
-- Gas: €0,33568 = Spotprijs (€0,28500) + Opslag (€0,05068)
-- Vastrecht stroom: €71,87/jaar = €5,99/maand
-- Vastrecht gas: €71,87/jaar = €5,99/maand

-- =====================================================
-- UPDATE ENERGIEK.NL DYNAMISCHE CONTRACTEN
-- =====================================================
UPDATE contract_details_dynamisch
SET
  opslag_elektriciteit = 0.018,        -- €0,018/kWh opslag elektriciteit
  opslag_gas = 0.05068,                -- €0,05068/m³ opslag gas
  opslag_teruglevering = 0.018,        -- €0,018/kWh AFSLAG teruglevering (wordt afgetrokken!)
  vastrecht_stroom_maand = 5.99,       -- €5,99/maand vastrecht stroom
  vastrecht_gas_maand = 5.99,          -- €5,99/maand vastrecht gas
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
-- Dynamisch Energiecontract         | dynamisch | particulier     | 0.018                | 0.05068    | 0.018                | 5.99                   | 5.99
-- Dynamisch Zakelijk Energiecontract| dynamisch | zakelijk        | 0.018                | 0.05068    | 0.018                | 5.99                   | 5.99

