-- Get the PRODUCTION encrypted password that DOES work
SELECT 
  environment,
  api_username,
  length(api_password_encrypted) as pwd_length,
  api_password_encrypted as encrypted_pwd
FROM leverancier_api_config
WHERE provider = 'GRIDHUB'
  AND environment = 'production'
LIMIT 1;

