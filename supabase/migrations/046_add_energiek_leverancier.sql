-- Migration: Add Energiek.nl as leverancier
-- Date: 2026-01-05
-- Description: Adds Energiek.nl leverancier
-- Note: GridHub API config wordt toegevoegd via script (setup-energiek-gridhub.ts)
-- omdat we de encryption key nodig hebben om het wachtwoord te encrypten

-- =====================================================
-- ADD ENERGIEK.NL AS LEVERANCIER
-- =====================================================
INSERT INTO leveranciers (
  naam,
  website,
  actief,
  volgorde
) VALUES (
  'Energiek.nl',
  'https://www.energiek.nl',
  true,
  100 -- High order number to appear at end
)
ON CONFLICT (naam) DO UPDATE SET
  website = EXCLUDED.website,
  actief = EXCLUDED.actief,
  updated_at = NOW();

-- =====================================================
-- NOTE: GridHub API Configuratie
-- =====================================================
-- De GridHub API configuratie wordt toegevoegd via het script:
--   scripts/setup-energiek-gridhub.ts
-- 
-- Dit script:
-- 1. Encrypteert het API wachtwoord met GRIDHUB_ENCRYPTION_KEY
-- 2. Voegt de GridHub configuratie toe aan leverancier_api_config
-- 
-- Run het script met:
--   GRIDHUB_ENCRYPTION_KEY=<key> npx ts-node scripts/setup-energiek-gridhub.ts

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
    WHEN lac.api_password_encrypted IS NULL THEN '⚠️ Configuratie ontbreekt - run setup script'
    WHEN lac.api_password_encrypted = 'PLACEHOLDER_PASSWORD_MUST_BE_ENCRYPTED' THEN '⚠️ MOET WORDEN GEÜPDATET'
    ELSE '✅ Encrypted'
  END as password_status,
  lac.actief as config_actief
FROM leveranciers l
LEFT JOIN leverancier_api_config lac ON l.id = lac.leverancier_id AND lac.provider = 'GRIDHUB'
WHERE l.naam = 'Energiek.nl';

