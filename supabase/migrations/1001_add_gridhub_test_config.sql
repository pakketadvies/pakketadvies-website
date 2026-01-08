-- Add GridHub TEST (staging) config for Energiek.nl
-- This allows easy switching between staging and production via GRIDHUB_ENVIRONMENT env var

DO $$
DECLARE
  v_leverancier_id UUID;
  v_existing_id UUID;
BEGIN
  -- Get Energiek leverancier ID
  SELECT id INTO v_leverancier_id
  FROM leveranciers
  WHERE LOWER(naam) LIKE '%energiek%'
  LIMIT 1;
  
  IF v_leverancier_id IS NULL THEN
    RAISE EXCEPTION 'Energiek leverancier not found';
  END IF;
  
  -- Check if test config already exists
  SELECT id INTO v_existing_id
  FROM leverancier_api_config
  WHERE leverancier_id = v_leverancier_id
    AND provider = 'GRIDHUB'
    AND environment = 'test';
  
  IF v_existing_id IS NOT NULL THEN
    -- Update existing test config
    UPDATE leverancier_api_config
    SET
      api_url = 'https://energiek.gridhub.cloud/api/external/v1',
      api_username = 'energiek',
      api_password_encrypted = 'e54a335704ef204c37f6af5471c0eb42:a89a76e32b71229b801442d6981297e0173af4e2e227faf20253ddd968e579537d2a5aaa3322879fa0d17cd9038dd5095ca4b8de0900572d556d450aeb5afab8',
      actief = true,
      product_ids = jsonb_build_object(
        'particulier', '1',
        'zakelijk', '1'
      ),
      tarief_ids = jsonb_build_object(
        'test', '37',
        'production', '37'
      ),
      customer_approval_ids = jsonb_build_array(1, 2, 3)
    WHERE id = v_existing_id;
    
    RAISE NOTICE 'Updated existing TEST config for Energiek';
  ELSE
    -- Insert new test config
    INSERT INTO leverancier_api_config (
      leverancier_id,
      provider,
      environment,
      api_url,
      api_username,
      api_password_encrypted,
      actief,
      product_ids,
      tarief_ids,
      customer_approval_ids
    ) VALUES (
      v_leverancier_id,
      'GRIDHUB',
      'test',
      'https://energiek.gridhub.cloud/api/external/v1',
      'energiek',
      'e54a335704ef204c37f6af5471c0eb42:a89a76e32b71229b801442d6981297e0173af4e2e227faf20253ddd968e579537d2a5aaa3322879fa0d17cd9038dd5095ca4b8de0900572d556d450aeb5afab8',
      true,
      jsonb_build_object(
        'particulier', '1',
        'zakelijk', '1'
      ),
      jsonb_build_object(
        'test', '37',
        'production', '37'
      ),
      jsonb_build_array(1, 2, 3)
    );
    
    RAISE NOTICE 'Created new TEST config for Energiek';
  END IF;
END $$;

-- Show all GridHub configs
SELECT 
  l.naam as leverancier,
  lac.environment,
  lac.actief,
  lac.api_username,
  lac.api_url
FROM leverancier_api_config lac
JOIN leveranciers l ON l.id = lac.leverancier_id
WHERE lac.provider = 'GRIDHUB'
ORDER BY l.naam, lac.environment;

