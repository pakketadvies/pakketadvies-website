-- Update GridHub API password voor Energiek.nl test omgeving
-- Wachtwoord: 751|4mEDu9Wy7Y68ygO724av7G8cYOnyYyDW4wjUzP6u17749a77
-- Environment: test

UPDATE leverancier_api_config
SET api_password_encrypted = '8a6af92bbceac7b6c4ceb76640180af2:271dc1a5a0e56fa3fa1273188bbe501a:b8ce1e28de4251612fa9bc45f67c1d4f79ff34c2b24b3d7382433ba0faf28e0346455c48dfa9bf28fa501d49fa3ecaed4a6973a5',
    environment = 'test',
    updated_at = NOW()
WHERE leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')
  AND provider = 'GRIDHUB';

