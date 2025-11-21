-- Check of tarieven correct zijn
SELECT 
  n.naam as netbeheerder,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar as tarief_nu,
  ROUND(475.92 / 1.21, 2) as zou_moeten_zijn_3x25A,
  ROUND(246.09 / 1.21, 2) as zou_moeten_zijn_G6
FROM netbeheer_tarieven_elektriciteit t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_elektriciteit a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'ENEXIS' 
  AND a.code = '3x25A' 
  AND t.jaar = 2025
UNION ALL
SELECT 
  n.naam as netbeheerder,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar as tarief_nu,
  ROUND(475.92 / 1.21, 2) as zou_moeten_zijn_3x25A,
  ROUND(246.09 / 1.21, 2) as zou_moeten_zijn_G6
FROM netbeheer_tarieven_gas t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_gas a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'ENEXIS' 
  AND a.code = 'G6_MIDDEN' 
  AND t.jaar = 2025;

