-- Check Sepa Green contract tarieven
SELECT 
  c.id,
  c.naam,
  c.type,
  l.naam as leverancier,
  dv.tarief_elektriciteit_enkel,
  dv.tarief_elektriciteit_normaal,
  dv.tarief_elektriciteit_dal,
  dv.tarief_gas,
  dv.vaste_kosten_maand
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
LEFT JOIN contract_details_vast dv ON c.id = dv.contract_id
WHERE c.naam LIKE '%Sepa Green%'
  AND c.actief = true;
