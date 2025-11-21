-- Check Sepa Green contract details
SELECT 
  c.naam as contract_naam,
  c.type as contract_type,
  l.naam as leverancier,
  dv.vaste_kosten_maand,
  dv.tarief_elektriciteit_normaal,
  dv.tarief_elektriciteit_dal,
  dv.tarief_gas
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
LEFT JOIN contract_details_vast dv ON c.id = dv.contract_id
WHERE l.naam ILIKE '%sepa%'
  AND c.actief = true
ORDER BY c.naam;

