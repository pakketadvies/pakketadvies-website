-- Migration: Add overheidstarieven 2026
-- Date: 2026-01-05
-- Description: Adds 2026 government tariffs (energiebelasting, BTW, vermindering)
-- Based on: Prinsjesdag 2025 wijzigingen

-- =====================================================
-- OVERHEIDSTARIEVEN 2026
-- =====================================================
-- Bron: Officiële overheidsdocumentatie "BELANGRIJKSTE WIJZIGINGEN BELASTINGEN 2026"
-- Alle tarieven zijn EXCLUSIEF BTW (zoals opgeslagen in database)
--
-- Wijzigingen t.o.v. 2025:
-- - Energiebelasting elektriciteit: verschillende schijven hebben verschillende tarieven
-- - Energiebelasting gas: stijging van €0.57816 naar €0.60066 per m³
-- - Vermindering EB: €524.95 → €519.80 per jaar (excl. BTW)
-- - BTW: 21% (ongewijzigd)
--
-- Exacte tarieven 2026 (excl. BTW) volgens overheidsdocumentatie:
-- =====================================================

INSERT INTO tarieven_overheid (
  jaar,
  
  -- Energiebelasting Elektriciteit KLEINVERBRUIK
  -- Schijven: 0-10000 kWh, >10000 kWh
  eb_elektriciteit_kv_schijf1_max,
  eb_elektriciteit_kv_schijf1,
  eb_elektriciteit_kv_schijf2,
  
  -- Energiebelasting Elektriciteit GROOTVERBRUIK (4 schijven)
  -- Schijf 1: 0-2.900 kWh
  -- Schijf 2: 2.901-10.000 kWh
  -- Schijf 3: 10.001-50.000 kWh
  -- Schijf 4: >50.000 kWh
  eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4,
  
  -- Energiebelasting Gas (2 schijven)
  -- Schijf 1: 0-1.000 m³
  -- Schijf 2: >1.000 m³
  eb_gas_schijf1_max,
  eb_gas_schijf1,
  eb_gas_schijf2,
  
  -- ODE (Opslag Duurzame Energie) - nog te verifiëren voor 2026
  -- Voorlopig: zelfde als 2025 (wordt later bijgewerkt indien nodig)
  ode_elektriciteit,
  ode_gas,
  
  -- BTW
  btw_percentage,
  
  -- Vermindering Energiebelasting
  vermindering_eb_elektriciteit,
  vermindering_eb_gas,
  
  -- Gas omrekenfactor (ongewijzigd)
  gas_omrekenfactor,
  
  -- Datums
  ingangsdatum,
  einddatum,
  
  -- Status
  actief
) VALUES (
  2026,
  
  -- Energiebelasting Elektriciteit KLEINVERBRUIK
  -- Bron: Tabel 6 - Tarieven energiebelastingtarieven 2025-2026 voor elektriciteit per kWh (excl. btw)
  10000,  -- Schijf 1 max: 10.000 kWh
  0.09161, -- Schijf 1: €0.09161/kWh (excl. BTW) - 0-2.900 kWh
  0.09161, -- Schijf 2: €0.09161/kWh (excl. BTW) - 2.900-10.000 kWh
  
  -- Energiebelasting Elektriciteit GROOTVERBRUIK
  -- Bron: Tabel 6 - Tarieven energiebelastingtarieven 2025-2026 voor elektriciteit per kWh (excl. btw)
  2900,   -- Schijf 1 max: 2.900 kWh
  0.09161, -- Schijf 1: €0.09161/kWh (excl. BTW) - 0-2.900 kWh
  10000,  -- Schijf 2 max: 10.000 kWh
  0.09161, -- Schijf 2: €0.09161/kWh (excl. BTW) - 2.900-10.000 kWh
  50000,  -- Schijf 3 max: 50.000 kWh
  0.06671, -- Schijf 3: €0.06671/kWh (excl. BTW) - 10.000-50.000 kWh (NIET uniform!)
  0.03735, -- Schijf 4: €0.03735/kWh (excl. BTW) - 50.000-10 mln. kWh (NIET uniform!)
  
  -- Energiebelasting Gas
  -- Bron: Tabel 5 - Tarieven energiebelastingtarieven 2025-2026 voor aardgas per m3 (excl. btw)
  1000,   -- Schijf 1 max: 1.000 m³
  0.60066, -- Schijf 1: €0.60066/m³ (excl. BTW) - 0-1.000 m³
  0.60066, -- Schijf 2: €0.60066/m³ (excl. BTW) - 1.000-170.000 m³
  
  -- ODE (voorlopig zelfde als 2025, wordt later bijgewerkt indien nodig)
  -- Deze waarden moeten worden geverifieerd voor 2026
  (SELECT ode_elektriciteit FROM tarieven_overheid WHERE jaar = 2025 AND actief = true LIMIT 1),
  (SELECT ode_gas FROM tarieven_overheid WHERE jaar = 2025 AND actief = true LIMIT 1),
  
  -- BTW (ongewijzigd)
  21.00,
  
  -- Vermindering Energiebelasting
  -- Bron: Officiële overheidsdocumentatie
  -- 2026: €519.80 per jaar (excl. BTW)
  -- Incl. BTW: €519.80 * 1.21 = €628.96 (dit is wat gaslicht.com toont)
  519.80, -- €519.80 per jaar (excl. BTW) - 2026
  0,      -- Vermindering gas (niet van toepassing)
  
  -- Gas omrekenfactor (ongewijzigd)
  10.3158,
  
  -- Datums
  '2026-01-01', -- Ingangsdatum: 1 januari 2026
  NULL,         -- Einddatum: onbepaald
  
  -- Status
  true          -- Actief
)
ON CONFLICT (jaar) DO UPDATE SET
  eb_elektriciteit_kv_schijf1_max = EXCLUDED.eb_elektriciteit_kv_schijf1_max,
  eb_elektriciteit_kv_schijf1 = EXCLUDED.eb_elektriciteit_kv_schijf1,
  eb_elektriciteit_kv_schijf2 = EXCLUDED.eb_elektriciteit_kv_schijf2,
  eb_elektriciteit_gv_schijf1_max = EXCLUDED.eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1 = EXCLUDED.eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max = EXCLUDED.eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2 = EXCLUDED.eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max = EXCLUDED.eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3 = EXCLUDED.eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4 = EXCLUDED.eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1_max = EXCLUDED.eb_gas_schijf1_max,
  eb_gas_schijf1 = EXCLUDED.eb_gas_schijf1,
  eb_gas_schijf2 = EXCLUDED.eb_gas_schijf2,
  btw_percentage = EXCLUDED.btw_percentage,
  vermindering_eb_elektriciteit = EXCLUDED.vermindering_eb_elektriciteit,
  vermindering_eb_gas = EXCLUDED.vermindering_eb_gas,
  ingangsdatum = EXCLUDED.ingangsdatum,
  einddatum = EXCLUDED.einddatum,
  actief = EXCLUDED.actief,
  updated_at = NOW();

-- =====================================================
-- DEACTIVEER 2025 TARIEVEN (optioneel)
-- =====================================================
-- Als 2026 actief is, kunnen we 2025 deactiveren
-- (of beide actief houden voor historische berekeningen)
-- UPDATE tarieven_overheid
-- SET actief = false, einddatum = '2025-12-31'
-- WHERE jaar = 2025 AND actief = true;

-- =====================================================
-- VERIFICATIE
-- =====================================================
SELECT 
  jaar,
  eb_elektriciteit_gv_schijf1 as "Schijf 1 (0-2.9k)",
  eb_elektriciteit_gv_schijf2 as "Schijf 2 (2.9k-10k)",
  eb_elektriciteit_gv_schijf3 as "Schijf 3 (10k-50k)",
  eb_elektriciteit_gv_schijf4 as "Schijf 4 (>50k)",
  eb_gas_schijf1 as "Gas (0-1k)",
  eb_gas_schijf2 as "Gas (>1k)",
  vermindering_eb_elektriciteit as "Vermindering",
  actief
FROM tarieven_overheid
WHERE jaar IN (2025, 2026)
ORDER BY jaar DESC;

