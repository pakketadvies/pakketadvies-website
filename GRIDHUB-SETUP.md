# 🔧 GridHub API Integratie - Setup Instructies

## 📋 Overzicht

Deze integratie maakt het mogelijk om contractaanvragen automatisch naar GridHub API te sturen en real-time status updates te ontvangen via webhooks.

## 🚀 Setup Stappen

### 1. Database Migratie Uitvoeren

```bash
# Run de migratie
cd supabase
supabase migration up
```

Of via Supabase Dashboard:
- Ga naar Database → Migrations
- Run migratie `044_add_gridhub_integration.sql`

### 2. Environment Variable Instellen

Voeg toe aan `.env.local` en Vercel:

```bash
# GridHub Encryption Key (32 bytes = 64 hex characters)
# Genereer met: openssl rand -hex 32
GRIDHUB_ENCRYPTION_KEY=<64_hex_characters>
```

**⚠️ Belangrijk:** Deze key wordt gebruikt om API wachtwoorden te encrypten. Bewaar deze veilig!

### 3. GridHub API Configuratie Toevoegen

Voeg een record toe aan de `leverancier_api_config` tabel:

```sql
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
  '<leverancier_id>', -- UUID van Energiek.nl leverancier
  'GRIDHUB',
  'test', -- of 'production'
  'https://energiek.gridhub.cloud/api/external/v1', -- Check met Energiek voor exacte URL
  '<api_username>', -- Van Energiek
  '<encrypted_password>', -- Gebruik encryptPassword() functie
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

### 4. Password Encryptie

Gebruik de `encryptPassword()` functie om het API wachtwoord te encrypten:

```typescript
import { encryptPassword } from '@/lib/integrations/gridhub/encryption'

const encrypted = encryptPassword('jouw_api_wachtwoord')
// Gebruik deze encrypted waarde in de database
```

Of via een script:

```typescript
// scripts/encrypt-gridhub-password.ts
import { encryptPassword } from '../src/lib/integrations/gridhub/encryption'

const password = process.argv[2]
if (!password) {
  console.error('Usage: npx ts-node scripts/encrypt-gridhub-password.ts <password>')
  process.exit(1)
}

console.log('Encrypted password:', encryptPassword(password))
```

### 5. Webhook URL Configureren bij GridHub

Stuur de webhook URL naar Energiek (Chrisje):
- **Webhook URL:** `https://pakketadvies.nl/api/webhooks/gridhub`
- **Method:** POST
- **Content-Type:** application/json

GridHub zal status updates naar deze URL sturen.

## ✅ Verificatie

### Test Aanvraag

1. Maak een test aanvraag voor een Energiek contract
2. Check de database:
   ```sql
   SELECT 
     aanvraagnummer,
     external_api_provider,
     external_order_id,
     external_status,
     external_response
   FROM contractaanvragen
   WHERE external_api_provider = 'GRIDHUB'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. Check admin dashboard:
   - Ga naar `/admin/aanvragen/[id]`
   - Je zou een "GridHub Status" sectie moeten zien
   - Klik op "🔄 Sync Nu" om handmatig te synchroniseren

### Webhook Test

Test de webhook endpoint:

```bash
curl -X POST https://pakketadvies.nl/api/webhooks/gridhub \
  -H "Content-Type: application/json" \
  -d '{
    "id": 123,
    "externalReference": "PA-2026-000001",
    "timestamp": "2026-01-05T10:00:00Z",
    "status": "CREATED",
    "statusReason": "Order successfully created"
  }'
```

## 🔍 Troubleshooting

### API Call Faalt

1. Check API credentials in database
2. Check `external_errors` veld in `contractaanvragen` tabel
3. Check server logs voor details
4. Gebruik "🔄 Sync Nu" knop in admin dashboard om te retry

### Webhook Werkt Niet

1. Check of webhook URL correct is geconfigureerd bij GridHub
2. Check server logs voor webhook requests
3. Test webhook endpoint handmatig (zie hierboven)

### Status Updates Komen Niet Aan

1. Check `external_last_sync` veld - is deze recent?
2. Gebruik "🔄 Sync Nu" knop om handmatig te synchroniseren
3. Check GridHub dashboard voor order status

## 📝 Belangrijke Notities

- **Startdatum:** Minimaal 20 dagen (behalve inhuizing: 3 dagen)
- **Automatische Incasso:** Altijd verplicht voor Energiek contracten
- **Customer Approvals:** [1,2,3] altijd vereist
- **CapTar Codes:** Mapping wordt automatisch gedaan, maar kan worden uitgebreid in `mapper.ts`
- **Sign Data:** Wordt automatisch gegenereerd als hash van formulier data

## 🔐 Security

- API wachtwoorden worden encrypted opgeslagen in database
- Webhook signature verificatie kan worden toegevoegd (TODO)
- Rate limiting is al geïmplementeerd in aanvraag flow

## 📞 Support

Voor vragen over GridHub API:
- Contact: Chrisje Meulendijks (Energiek.nl)
- API Docs: https://gridhub.stoplight.io/docs/gridhub-external

