-- Check both production and test configs
SELECT 
  environment,
  api_username,
  api_url
FROM leverancier_api_config
WHERE provider = 'GRIDHUB'
ORDER BY environment;

