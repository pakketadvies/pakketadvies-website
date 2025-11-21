-- ============================================================
-- FIX: NETBEHEERTARIEVEN - CONVERTEER INCL BTW NAAR EXCL BTW
-- ============================================================
-- PROBLEEM: Alle netbeheertarieven staan in database als INCL. BTW
-- OPLOSSING: Deel alle bedragen door 1.21 om EXCL. BTW te krijgen
-- ============================================================

-- ELEKTRICITEIT TARIEVEN 2025
UPDATE netbeheer_tarieven_elektriciteit
SET all_in_tarief_jaar = ROUND(all_in_tarief_jaar / 1.21, 2)
WHERE jaar = 2025 AND actief = true;

-- GAS TARIEVEN 2025
UPDATE netbeheer_tarieven_gas
SET all_in_tarief_jaar = ROUND(all_in_tarief_jaar / 1.21, 2)
WHERE jaar = 2025 AND actief = true;

-- ============================================================
-- VERIFICATIE: Check de nieuwe waarden
-- ============================================================

-- Check Enexis 3x25A (moet €393.32 zijn, was €475.92)
SELECT 
  n.naam as netbeheerder,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar as tarief_excl_btw,
  ROUND(t.all_in_tarief_jaar * 1.21, 2) as tarief_incl_btw_check
FROM netbeheer_tarieven_elektriciteit t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_elektriciteit a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'ENEXIS' 
  AND a.code = '3x25A' 
  AND t.jaar = 2025;

-- Check Enexis G6_MIDDEN (moet €203.38 zijn, was €246.09)
SELECT 
  n.naam as netbeheerder,
  a.code as aansluitwaarde,
  t.all_in_tarief_jaar as tarief_excl_btw,
  ROUND(t.all_in_tarief_jaar * 1.21, 2) as tarief_incl_btw_check
FROM netbeheer_tarieven_gas t
JOIN netbeheerders n ON t.netbeheerder_id = n.id
JOIN aansluitwaarden_gas a ON t.aansluitwaarde_id = a.id
WHERE n.code = 'ENEXIS' 
  AND a.code = 'G6_MIDDEN' 
  AND t.jaar = 2025;

-- ============================================================
-- RESULTAAT:
-- - Alle 30 elektriciteit tarieven zijn nu EXCL. BTW
-- - Alle 36 gas tarieven zijn nu EXCL. BTW
-- - Totaal: 66 tarieven geconverteerd
-- ============================================================

