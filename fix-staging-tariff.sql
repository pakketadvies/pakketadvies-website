-- Fix tariff ID for GridHub TEST (staging) config
UPDATE leverancier_api_config
SET tarief_ids = jsonb_build_object('test', '11', 'production', '37')
WHERE provider = 'GRIDHUB' AND environment = 'test';

-- Show result
SELECT 
  environment,
  tarief_ids
FROM leverancier_api_config
WHERE provider = 'GRIDHUB'
ORDER BY environment;

