-- Migration: Add GridHub API config for Energiek.nl
-- Date: 2026-01-05
-- Description: Adds GridHub API configuration for Energiek.nl with encrypted password

-- =====================================================
-- ADD GRIDHUB API CONFIGURATION FOR ENERGIEK.NL
-- =====================================================
DO $$
DECLARE
  v_leverancier_id UUID;
  v_encrypted_password TEXT := '10d1d32c87c888cc457c5e5d494ed678:3d0508adabe25adca5f59a3cb115ac8c:6827de13c864b6b15fc7392e357dc080b1152d2b93c8507e04484b52353677f4a98e1f480db2118d7c8739d6a3d78e65288ccebcb2';
BEGIN
  -- Get Energiek.nl leverancier ID
  SELECT id INTO v_leverancier_id
  FROM leveranciers
  WHERE naam = 'Energiek.nl'
  LIMIT 1;

  IF v_leverancier_id IS NULL THEN
    RAISE EXCEPTION 'Energiek.nl leverancier niet gevonden. Run eerst migratie 046_add_energiek_leverancier.sql';
  END IF;

  -- Check if config already exists
  IF EXISTS (
    SELECT 1 FROM leverancier_api_config
    WHERE leverancier_id = v_leverancier_id
    AND provider = 'GRIDHUB'
  ) THEN
    -- Update existing config
    UPDATE leverancier_api_config
    SET
      api_url = 'https://energiek.gridhub.cloud/api/external/v1',
      api_username = 'energiek',
      api_password_encrypted = v_encrypted_password,
      product_ids = '{"particulier": "1", "zakelijk": "5"}'::jsonb,
      tarief_ids = '{"test": "11", "production": "37"}'::jsonb,
      customer_approval_ids = ARRAY[1,2,3],
      min_startdatum_dagen = 20,
      min_startdatum_inhuizing_dagen = 3,
      automatische_incasso_verplicht = true,
      webhook_enabled = true,
      webhook_url = 'https://pakketadvies.nl/api/webhooks/gridhub',
      actief = true,
      updated_at = NOW()
    WHERE leverancier_id = v_leverancier_id
    AND provider = 'GRIDHUB';
    
    RAISE NOTICE 'GridHub config voor Energiek.nl is bijgewerkt.';
  ELSE
    -- Insert new config
    INSERT INTO leverancier_api_config (
      leverancier_id,
      provider,
      environment,
      api_url,
      api_username,
      api_password_encrypted,
      product_ids,
      tarief_ids,
      customer_approval_ids,
      min_startdatum_dagen,
      min_startdatum_inhuizing_dagen,
      automatische_incasso_verplicht,
      webhook_enabled,
      webhook_url,
      actief
    ) VALUES (
      v_leverancier_id,
      'GRIDHUB',
      'test', -- Start with test environment
      'https://energiek.gridhub.cloud/api/external/v1',
      'energiek', -- API username
      v_encrypted_password, -- Encrypted password
      '{"particulier": "1", "zakelijk": "5"}'::jsonb, -- Product IDs
      '{"test": "11", "production": "37"}'::jsonb, -- Tariff IDs
      ARRAY[1,2,3], -- Customer approval IDs
      20, -- Min startdatum dagen
      3,  -- Min startdatum inhuizing dagen
      true, -- Automatische incasso verplicht
      true, -- Webhook enabled
      'https://pakketadvies.nl/api/webhooks/gridhub', -- Webhook URL
      true -- Actief
    );
    
    RAISE NOTICE 'GridHub config voor Energiek.nl is toegevoegd.';
  END IF;
END $$;

-- =====================================================
-- VERIFICATIE
-- =====================================================
SELECT 
  l.id,
  l.naam,
  l.actief as leverancier_actief,
  lac.provider,
  lac.environment,
  lac.api_url,
  lac.api_username,
  CASE 
    WHEN lac.api_password_encrypted IS NULL THEN '⚠️ Configuratie ontbreekt'
    WHEN lac.api_password_encrypted = 'PLACEHOLDER_PASSWORD_MUST_BE_ENCRYPTED' THEN '⚠️ Wachtwoord niet geëncrypteerd'
    ELSE '✅ Geconfigureerd'
  END as password_status,
  lac.actief as config_actief
FROM leveranciers l
LEFT JOIN leverancier_api_config lac ON l.id = lac.leverancier_id AND lac.provider = 'GRIDHUB'
WHERE l.naam = 'Energiek.nl';

