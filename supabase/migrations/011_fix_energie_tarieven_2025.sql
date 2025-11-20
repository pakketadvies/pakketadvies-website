-- Update tarieven_overheid 2025 met CORRECTE industrietarieven
-- Gebaseerd op echte energie-offerte tarieven (Sepa Green)

UPDATE tarieven_overheid
SET
  -- Energiebelasting Elektriciteit KLEINVERBRUIK
  -- Sepa gebruikt €0,10154/kWh voor BEIDE schijven (gestaffeld maar zelfde tarief)
  eb_elektriciteit_kv_schijf1_max = 2900,
  eb_elektriciteit_kv_schijf1 = 0.10154,
  eb_elektriciteit_kv_schijf2 = 0.10154,
  
  -- Energiebelasting Elektriciteit GROOTVERBRUIK
  eb_elektriciteit_gv_schijf1_max = 2900,
  eb_elektriciteit_gv_schijf1 = 0.10154,
  eb_elektriciteit_gv_schijf2_max = 10000,
  eb_elektriciteit_gv_schijf2 = 0.10154,
  eb_elektriciteit_gv_schijf3_max = 50000,
  eb_elektriciteit_gv_schijf3 = 0.10154,
  eb_elektriciteit_gv_schijf4 = 0.10154,
  
  -- Energiebelasting Gas
  -- Sepa gebruikt €0,57816 voor BEIDE schijven
  eb_gas_schijf1_max = 1000,
  eb_gas_schijf1 = 0.57816,
  eb_gas_schijf2 = 0.57816,
  
  -- Vermindering EB (exact zoals Sepa)
  vermindering_eb_elektriciteit = 524.95,
  
  -- BTW
  btw_percentage = 21,
  
  -- Actief
  actief = true,
  
  updated_at = NOW()
WHERE jaar = 2025 AND actief = true;

-- Als er geen 2025 tarief is, insert het
INSERT INTO tarieven_overheid (
  jaar,
  btw_percentage,
  vermindering_eb_elektriciteit,
  eb_elektriciteit_kv_schijf1_max,
  eb_elektriciteit_kv_schijf1,
  eb_elektriciteit_kv_schijf2,
  eb_elektriciteit_gv_schijf1_max,
  eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max,
  eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max,
  eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4,
  eb_gas_schijf1_max,
  eb_gas_schijf1,
  eb_gas_schijf2,
  actief,
  ingangsdatum,
  einddatum
) SELECT
  2025,
  21,
  524.95,
  2900,
  0.10154,
  0.10154,
  2900,
  0.10154,
  10000,
  0.10154,
  50000,
  0.10154,
  0.10154,
  1000,
  0.57816,
  0.57816,
  true,
  '2025-01-01',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM tarieven_overheid WHERE jaar = 2025 AND actief = true
);

