-- Check ALLE Energiek.nl tarieven
SELECT 
  c.id,
  c.naam,
  c.type,
  cd.opslag_elektriciteit,
  cd.opslag_elektriciteit_normaal,
  cd.opslag_elektriciteit_dal,
  cd.opslag_gas,
  cd.opslag_teruglevering,
  cd.vastrecht_stroom_maand,
  cd.vastrecht_gas_maand
FROM contracten c
LEFT JOIN contract_details_dynamisch cd ON c.id = cd.contract_id
WHERE c.leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')
  AND c.actief = true
  AND c.type = 'dynamisch'
ORDER BY c.naam;
