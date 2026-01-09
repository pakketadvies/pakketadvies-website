-- Migration: Update Energiek.nl tarieven naar CORRECTE waardes
-- Date: 2026-01-09
-- Description: Fix Energiek.nl opslagen en vastrechten naar OFFICIËLE tarieven
--
-- BRON: OFFICIËLE Energiek.nl tarieven (excl. BTW, geldig voor consument EN zakelijk)
-- 
-- ELEKTRICITEIT:
-- - Inkoopvergoeding: €0,01490 per kWh
-- - Afslagtarief bij teruglevering: €0,01490 per kWh
-- - Vaste leveringskosten: €59,40 per jaar = €4,95 per maand
--
-- GAS:
-- - Inkoopvergoeding: €0,04959 per m³
-- - Vaste leveringskosten: €59,40 per jaar = €4,95 per maand

-- =====================================================
-- UPDATE ENERGIEK.NL DYNAMISCHE CONTRACTEN
-- =====================================================
UPDATE contract_details_dynamisch
SET
  opslag_elektriciteit = 0.01490,      -- €0,01490/kWh opslag elektriciteit (inkoopvergoeding)
  opslag_gas = 0.04959,                -- €0,04959/m³ opslag gas (inkoopvergoeding)
  opslag_teruglevering = 0.01490,      -- €0,01490/kWh AFSLAG teruglevering (wordt afgetrokken!)
  vastrecht_stroom_maand = 4.95,       -- €4,95/maand vastrecht stroom (€59,40/jaar)
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
-- Dynamisch Energiecontract         | dynamisch | particulier     | 0.01490              | 0.04959    | 0.01490              | 4.95                   | 4.95
-- Dynamisch Zakelijk Energiecontract| dynamisch | zakelijk        | 0.01490              | 0.04959    | 0.01490              | 4.95                   | 4.95

