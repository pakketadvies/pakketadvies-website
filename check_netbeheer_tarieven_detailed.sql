-- Check netbeheertarieven in detail - wat zien we voor Coteq Netbeheer?
-- Dit helpt ons te begrijpen waarom er "0 tarieven" wordt getoond

-- Check voor Coteq Netbeheer - Elektriciteit
SELECT 
  'ELEKTRICITEIT - Coteq' as type,
  t.id,
  t.jaar,
  t.actief,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar,
  t.opmerkingen
FROM netbeheer_tarieven_elektriciteit t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_elektriciteit a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'COTEQ'
ORDER BY t.jaar DESC, a.code;

-- Check voor Coteq Netbeheer - Gas
SELECT 
  'GAS - Coteq' as type,
  t.id,
  t.jaar,
  t.actief,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar,
  t.opmerkingen
FROM netbeheer_tarieven_gas t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_gas a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'COTEQ'
ORDER BY t.jaar DESC, a.code;

-- Check alle netbeheerders en hun tarieven voor 2025
SELECT 
  n.naam as netbeheerder,
  n.code,
  'elektriciteit' as type,
  COUNT(*) FILTER (WHERE t.jaar = 2025 AND t.actief = true) as aantal_2025_actief,
  COUNT(*) FILTER (WHERE t.jaar = 2025) as aantal_2025,
  COUNT(*) FILTER (WHERE t.actief = true) as aantal_actief,
  COUNT(*) as totaal
FROM netbeheerders n
LEFT JOIN netbeheer_tarieven_elektriciteit t ON t.netbeheerder_id = n.id
WHERE n.actief = true
GROUP BY n.naam, n.code

UNION ALL

SELECT 
  n.naam as netbeheerder,
  n.code,
  'gas' as type,
  COUNT(*) FILTER (WHERE t.jaar = 2025 AND t.actief = true) as aantal_2025_actief,
  COUNT(*) FILTER (WHERE t.jaar = 2025) as aantal_2025,
  COUNT(*) FILTER (WHERE t.actief = true) as aantal_actief,
  COUNT(*) as totaal
FROM netbeheerders n
LEFT JOIN netbeheer_tarieven_gas t ON t.netbeheerder_id = n.id
WHERE n.actief = true
GROUP BY n.naam, n.code

ORDER BY netbeheerder, type;

