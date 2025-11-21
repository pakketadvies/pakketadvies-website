-- Check energiebelasting tarieven 2025
SELECT 
  jaar,
  eb_elektriciteit_kv_schijf1 as kv_schijf1,
  eb_elektriciteit_kv_schijf2 as kv_schijf2,
  eb_elektriciteit_gv_schijf1 as gv_schijf1,
  eb_elektriciteit_gv_schijf2 as gv_schijf2,
  eb_elektriciteit_gv_schijf3 as gv_schijf3,
  eb_elektriciteit_gv_schijf4 as gv_schijf4,
  vermindering_eb_elektriciteit
FROM tarieven_overheid
WHERE jaar = 2025 AND actief = true;

