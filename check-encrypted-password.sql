-- Check the encrypted password in the database
SELECT 
  environment,
  api_username,
  length(api_password_encrypted) as password_length,
  api_password_encrypted,
  position(':' in api_password_encrypted) as colon_position,
  split_part(api_password_encrypted, ':', 1) as iv_part,
  split_part(api_password_encrypted, ':', 2) as encrypted_part
FROM leverancier_api_config
WHERE provider = 'GRIDHUB'
  AND environment = 'test'
LIMIT 1;

