-- Check Energiek.nl tarieven config
SELECT 
  naam,
  type,
  opslag_elektriciteit_normaal,
  opslag_elektriciteit_dal,
  opslag_gas,
  opslag_teruglevering,
  vastrecht_stroom_maand,
  vastrecht_gas_maand
FROM 
  contracten
WHERE 
  leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')
  AND type = 'dynamisch'
  AND actief = true
ORDER BY naam;
