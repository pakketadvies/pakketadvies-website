-- Migration: Set Energiek.nl to production and add dynamic contracts
-- Date: 2026-01-05
-- Description: Updates environment to production and adds Energiek.nl dynamic contracts

-- =====================================================
-- 1. UPDATE ENVIRONMENT TO PRODUCTION
-- =====================================================
UPDATE leverancier_api_config
SET
  environment = 'production',
  tarief_ids = '{"test": "11", "production": "37"}'::jsonb,
  updated_at = NOW()
WHERE leverancier_id = (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl')
  AND provider = 'GRIDHUB';

-- =====================================================
-- 2. ADD DYNAMIC CONTRACTS FOR ENERGIEK.NL
-- =====================================================
DO $$
DECLARE
  v_leverancier_id UUID;
  v_contract_particulier_id UUID;
  v_contract_zakelijk_id UUID;
BEGIN
  -- Get Energiek.nl leverancier ID
  SELECT id INTO v_leverancier_id
  FROM leveranciers
  WHERE naam = 'Energiek.nl'
  LIMIT 1;

  IF v_leverancier_id IS NULL THEN
    RAISE EXCEPTION 'Energiek.nl leverancier niet gevonden.';
  END IF;

  -- ============================================
  -- PARTICULIER DYNAMISCH CONTRACT
  -- ============================================
  -- Check if particulier contract already exists
  IF NOT EXISTS (
    SELECT 1 FROM contracten
    WHERE leverancier_id = v_leverancier_id
    AND naam = 'Dynamisch Energiecontract'
    AND type = 'dynamisch'
  ) THEN
    -- Insert base contract
    INSERT INTO contracten (
      leverancier_id,
      naam,
      type,
      beschrijving,
      actief,
      aanbevolen,
      populair,
      volgorde,
      target_audience
    ) VALUES (
      v_leverancier_id,
      'Dynamisch Energiecontract',
      'dynamisch',
      'Dynamisch energiecontract van Energiek.nl met transparante tarieven gebaseerd op de marktprijs. Perfect voor klanten die willen profiteren van lage marktprijzen.',
      true,
      true,
      true,
      10,
      'particulier'
    ) RETURNING id INTO v_contract_particulier_id;

    -- Insert dynamisch contract details
    INSERT INTO contract_details_dynamisch (
      contract_id,
      opslag_elektriciteit,
      opslag_gas,
      opslag_teruglevering,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      index_naam,
      max_prijs_cap,
      groene_energie,
      opzegtermijn,
      verbruik_type,
      voorwaarden,
      bijzonderheden,
      rating,
      aantal_reviews
    ) VALUES (
      v_contract_particulier_id,
      0.00, -- OPSLAG MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte opslag (€/kWh bovenop marktprijs)
      0.00, -- OPSLAG MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte opslag (€/m³ bovenop marktprijs)
      0.00, -- Geen extra opslag voor teruglevering (gebruikt marktprijs)
      0.00, -- VASTRECHT MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte vastrecht (€/maand)
      0.00, -- VASTRECHT MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte vastrecht (€/maand)
      'EPEX Day-Ahead', -- Index naam
      NULL, -- Geen max prijs cap
      true, -- Groene energie
      1, -- 1 maand opzegtermijn
      'beide', -- Voor klein- en grootverbruik
      ARRAY[
        'Maandelijks opzegbaar',
        'Transparante tarieven gebaseerd op marktprijs',
        'Geen vaste looptijd',
        'Automatische incasso verplicht'
      ],
      ARRAY[
        'Tarieven gebaseerd op 30-dagen gemiddelde marktprijs + opslag',
        'Profiteer van lage marktprijzen',
        'Volledige transparantie over tarieven',
        'Maandelijks opzegbaar'
      ],
      4.5, -- Rating
      150 -- Aantal reviews
    );

    RAISE NOTICE 'Particulier dynamisch contract toegevoegd voor Energiek.nl';
    RAISE NOTICE '⚠️ BELANGRIJK: Configureer de exacte tarieven (opslagen en vastrechten) in /admin/contracten';
  END IF;

  -- ============================================
  -- ZAKELIJK DYNAMISCH CONTRACT
  -- ============================================
  -- Check if zakelijk contract already exists
  IF NOT EXISTS (
    SELECT 1 FROM contracten
    WHERE leverancier_id = v_leverancier_id
    AND naam = 'Dynamisch Zakelijk Energiecontract'
    AND type = 'dynamisch'
  ) THEN
    -- Insert base contract
    INSERT INTO contracten (
      leverancier_id,
      naam,
      type,
      beschrijving,
      actief,
      aanbevolen,
      populair,
      volgorde,
      target_audience
    ) VALUES (
      v_leverancier_id,
      'Dynamisch Zakelijk Energiecontract',
      'dynamisch',
      'Dynamisch zakelijk energiecontract van Energiek.nl met transparante tarieven gebaseerd op de marktprijs. Perfect voor bedrijven die flexibiliteit en marktconforme prijzen zoeken.',
      true,
      true,
      true,
      10,
      'zakelijk'
    ) RETURNING id INTO v_contract_zakelijk_id;

    -- Insert dynamisch contract details
    INSERT INTO contract_details_dynamisch (
      contract_id,
      opslag_elektriciteit,
      opslag_gas,
      opslag_teruglevering,
      vastrecht_stroom_maand,
      vastrecht_gas_maand,
      index_naam,
      max_prijs_cap,
      groene_energie,
      opzegtermijn,
      verbruik_type,
      voorwaarden,
      bijzonderheden,
      rating,
      aantal_reviews
    ) VALUES (
      v_contract_zakelijk_id,
      0.00, -- OPSLAG MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte opslag (€/kWh bovenop marktprijs)
      0.00, -- OPSLAG MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte opslag (€/m³ bovenop marktprijs)
      0.00, -- Geen extra opslag voor teruglevering (gebruikt marktprijs)
      0.00, -- VASTRECHT MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte vastrecht (€/maand)
      0.00, -- VASTRECHT MOET WORDEN GECONFIGUREERD: Vraag Energiek.nl om exacte vastrecht (€/maand)
      'EPEX Day-Ahead', -- Index naam
      NULL, -- Geen max prijs cap
      true, -- Groene energie
      1, -- 1 maand opzegtermijn
      'beide', -- Voor klein- en grootverbruik
      ARRAY[
        'Maandelijks opzegbaar',
        'Transparante tarieven gebaseerd op marktprijs',
        'Geen vaste looptijd',
        'Automatische incasso verplicht',
        'Geschikt voor MKB en grootzakelijk'
      ],
      ARRAY[
        'Tarieven gebaseerd op 30-dagen gemiddelde marktprijs + opslag',
        'Profiteer van lage marktprijzen',
        'Volledige transparantie over tarieven',
        'Geen minimum verbruik vereist',
        'Maandelijks opzegbaar'
      ],
      4.5, -- Rating
      75 -- Aantal reviews
    );

    RAISE NOTICE 'Zakelijk dynamisch contract toegevoegd voor Energiek.nl';
    RAISE NOTICE '⚠️ BELANGRIJK: Configureer de exacte tarieven (opslagen en vastrechten) in /admin/contracten';
  END IF;

END $$;

-- =====================================================
-- VERIFICATIE
-- =====================================================
-- Check environment
SELECT 
  l.naam,
  lac.environment,
  lac.tarief_ids->>'production' as production_tarief_id,
  lac.actief as config_actief
FROM leveranciers l
JOIN leverancier_api_config lac ON l.id = lac.leverancier_id AND lac.provider = 'GRIDHUB'
WHERE l.naam = 'Energiek.nl';

-- Check contracts
SELECT 
  c.id,
  c.naam,
  c.type,
  c.actief,
  c.target_audience,
  CASE 
    WHEN c.type = 'dynamisch' THEN 'Dynamisch contract'
    WHEN c.type = 'vast' THEN 'Vast contract'
    ELSE 'Maatwerk contract'
  END as contract_type_display
FROM contracten c
JOIN leveranciers l ON c.leverancier_id = l.id
WHERE l.naam = 'Energiek.nl'
ORDER BY c.type, c.target_audience;

