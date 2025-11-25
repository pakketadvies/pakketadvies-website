-- Check netbeheertarieven in database
SELECT 
  n.naam as netbeheerder,
  'elektriciteit' as type,
  COUNT(*) as aantal,
  COUNT(CASE WHEN jaar = 2025 THEN 1 END) as aantal_2025,
  COUNT(CASE WHEN actief = true THEN 1 END) as aantal_actief,
  COUNT(CASE WHEN jaar = 2025 AND actief = true THEN 1 END) as aantal_2025_actief
FROM netbeheer_tarieven_elektriciteit t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
GROUP BY n.naam

UNION ALL

SELECT 
  n.naam as netbeheerder,
  'gas' as type,
  COUNT(*) as aantal,
  COUNT(CASE WHEN jaar = 2025 THEN 1 END) as aantal_2025,
  COUNT(CASE WHEN actief = true THEN 1 END) as aantal_actief,
  COUNT(CASE WHEN jaar = 2025 AND actief = true THEN 1 END) as aantal_2025_actief
FROM netbeheer_tarieven_gas t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
GROUP BY n.naam

ORDER BY netbeheerder, type;
