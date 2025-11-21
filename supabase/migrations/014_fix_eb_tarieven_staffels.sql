-- ============================================================
-- FIX: CORRECTE ENERGIEBELASTING TARIEVEN 2025
-- ============================================================
-- PROBLEEM: Alle EB staffels staan op €0.10154
-- OPLOSSING: Correcte staffels uit Sepa offerte
-- ============================================================

UPDATE tarieven_overheid
SET
  -- Energiebelasting Elektriciteit KLEINVERBRUIK (blijft hetzelfde)
  eb_elektriciteit_kv_schijf1_max = 10000,
  eb_elektriciteit_kv_schijf1 = 0.10154,
  eb_elektriciteit_kv_schijf2 = 0.10154,
  
  -- Energiebelasting Elektriciteit GROOTVERBRUIK (4 staffels)
  eb_elektriciteit_gv_schijf1_max = 2900,
  eb_elektriciteit_gv_schijf1 = 0.10154,    -- 0-2.900 kWh
  eb_elektriciteit_gv_schijf2_max = 10000,
  eb_elektriciteit_gv_schijf2 = 0.10154,    -- 2.901-10.000 kWh
  eb_elektriciteit_gv_schijf3_max = 50000,
  eb_elektriciteit_gv_schijf3 = 0.06937,    -- 10.001-50.000 kWh ✓ FIX
  eb_elektriciteit_gv_schijf4 = 0.03868,    -- 50.001+ kWh ✓ FIX
  
  -- Energiebelasting Gas (blijft hetzelfde)
  eb_gas_schijf1_max = 1000,
  eb_gas_schijf1 = 0.57816,
  eb_gas_schijf2 = 0.57816,
  
  -- Vermindering EB
  vermindering_eb_elektriciteit = 524.95,
  
  updated_at = NOW()
WHERE jaar = 2025 AND actief = true;

-- ============================================================
-- VERIFICATIE
-- ============================================================
SELECT 
  'Kleinverbruik schijf 1' as staffel,
  eb_elektriciteit_kv_schijf1 as tarief,
  '0.10154 verwacht' as check
FROM tarieven_overheid WHERE jaar = 2025
UNION ALL
SELECT 
  'Grootverbruik schijf 3' as staffel,
  eb_elektriciteit_gv_schijf3::text as tarief,
  '0.06937 verwacht' as check
FROM tarieven_overheid WHERE jaar = 2025
UNION ALL
SELECT 
  'Grootverbruik schijf 4' as staffel,
  eb_elektriciteit_gv_schijf4::text as tarief,
  '0.03868 verwacht' as check
FROM tarieven_overheid WHERE jaar = 2025;

