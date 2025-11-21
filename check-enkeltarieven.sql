-- Check welke contracten GEEN enkeltarief hebben
SELECT 
  c.id,
  c.naam as contract_naam,
  l.naam as leverancier,
  cdv.tarief_elektriciteit_enkel,
  cdv.tarief_elektriciteit_normaal,
  cdv.tarief_elektriciteit_dal,
  CASE 
    WHEN cdv.tarief_elektriciteit_enkel IS NULL THEN '❌ GEEN enkeltarief'
    ELSE '✅ Heeft enkeltarief'
  END as status
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
JOIN contract_details_vast cdv ON c.id = cdv.contract_id
WHERE c.actief = true AND c.type = 'vast'
ORDER BY c.naam;

