# 🚀 Energiek.nl GridHub Setup Instructies

## 📋 Overzicht

Deze instructies helpen je om Energiek.nl toe te voegen als leverancier en de GridHub API configuratie in te stellen.

## ✅ Stap 1: Database Migratie Uitvoeren

Run de migratie om Energiek.nl toe te voegen als leverancier:

```bash
# Via Supabase CLI
supabase migration up

# Of via Supabase Dashboard:
# 1. Ga naar Database → Migrations
# 2. Run migratie: 046_add_energiek_leverancier.sql
```

## ✅ Stap 2: GridHub API Configuratie Toevoegen

### Optie A: Via Script (Aanbevolen)

Het script encrypteert automatisch het wachtwoord en voegt de configuratie toe:

```bash
# Zorg dat GRIDHUB_ENCRYPTION_KEY is ingesteld in .env.local
GRIDHUB_ENCRYPTION_KEY=<jouw_64_hex_character_key>

# Run het setup script
npx ts-node scripts/setup-energiek-gridhub.ts
```

**Let op:** Het script gebruikt:
- **API Username:** `energiek` (standaard)
- **API Password:** `5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024` (van Chrisje)
- **Product IDs:** particulier "1", zakelijk "5"
- **Tariff IDs:** test "11", production "37"

Als de API username anders is, pas deze aan in `scripts/setup-energiek-gridhub.ts` voordat je het script runt.

### Optie B: Handmatig via SQL

Als je het script niet kunt gebruiken, kun je handmatig de configuratie toevoegen:

1. **Encrypteer het wachtwoord eerst:**
   ```bash
   GRIDHUB_ENCRYPTION_KEY=<key> npx ts-node scripts/encrypt-gridhub-password.ts '5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024'
   ```

2. **Kopieer de encrypted password output**

3. **Voer deze SQL uit in Supabase:**
   ```sql
   -- Vervang <encrypted_password> met de output van stap 1
   -- Vervang <leverancier_id> met het ID van Energiek.nl uit de leveranciers tabel
   
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
     (SELECT id FROM leveranciers WHERE naam = 'Energiek.nl'),
     'GRIDHUB',
     'test',
     'https://energiek.gridhub.cloud/api/external/v1',
     'energiek', -- Pas aan als dit anders is
     '<encrypted_password>', -- Van encrypt script
     '{"particulier": "1", "zakelijk": "5"}'::jsonb,
     '{"test": "11", "production": "37"}'::jsonb,
     ARRAY[1,2,3],
     20,
     3,
     true,
     true,
     'https://pakketadvies.nl/api/webhooks/gridhub',
     true
   );
   ```

## ✅ Stap 3: Verificatie

Check of alles correct is ingesteld:

```sql
SELECT 
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
  END as status,
  lac.actief as config_actief
FROM leveranciers l
LEFT JOIN leverancier_api_config lac ON l.id = lac.leverancier_id AND lac.provider = 'GRIDHUB'
WHERE l.naam = 'Energiek.nl';
```

## ✅ Stap 4: Contracten Toevoegen

Nu je Energiek.nl als leverancier hebt, kun je contracten toevoegen:

1. Ga naar `/admin/contracten/nieuw`
2. Selecteer "Energiek.nl" als leverancier
3. Voeg contracten toe (vast, dynamisch, of maatwerk)
4. Zorg dat contracten `actief = true` zijn

## 🔍 Troubleshooting

### Energiek.nl verschijnt niet in admin

- Check of de migratie is uitgevoerd: `SELECT * FROM leveranciers WHERE naam = 'Energiek.nl'`
- Refresh de admin pagina
- Check of je bent ingelogd als admin

### GridHub configuratie werkt niet

- Check of `GRIDHUB_ENCRYPTION_KEY` is ingesteld (64 hex characters)
- Check of het wachtwoord correct is geëncrypteerd
- Check of `actief = true` in `leverancier_api_config`
- Check server logs voor API errors

### API Username onbekend

Als je niet zeker weet wat de API username is:
- Check de email van Chrisje Meulendijks
- Of probeer "energiek" (standaard)
- Of vraag aan Energiek wat de exacte username is

## 📝 Belangrijke Notities

- **Environment:** Start met `test`, zet later om naar `production`
- **API Username:** Standaard "energiek", maar kan anders zijn
- **Product IDs:** particulier "1", zakelijk "5" (volgens email Chrisje)
- **Tariff IDs:** test "11", production "37" (volgens email Chrisje)
- **Webhook URL:** `https://pakketadvies.nl/api/webhooks/gridhub`

## 🎯 Volgende Stappen

1. ✅ Energiek.nl toegevoegd als leverancier
2. ✅ GridHub API configuratie toegevoegd
3. ⏳ Contracten toevoegen voor Energiek.nl
4. ⏳ Test aanvraag maken om GridHub integratie te testen
5. ⏳ Environment omzetten naar "production" zodra alles werkt

