# Energieprijzen Update Systeem

## Overzicht

Het systeem voor het bijwerken van energieprijzen bestaat uit:

1. **Cron Job** - Dagelijkse automatische update om 14:00 UTC
2. **Historisch Script** - Handmatig script om 5 jaar historische prijzen in te laden
3. **API Routes** - Endpoints voor het ophalen en bijwerken van prijzen

## Cron Job (Automatisch)

De cron job draait **dagelijks om 14:00 UTC** (15:00 Nederlandse tijd in winter, 16:00 in zomer) en:
- Haalt de prijzen van vandaag op via EnergyZero API
- Slaat ze op in Supabase
- Update bestaande records als ze al bestaan

**Configuratie:**
- Route: `/api/cron/update-dynamic-prices`
- Schedule: `0 14 * * *` (dagelijks 14:00 UTC)
- Configuratie: `vercel.json`

**Beveiliging:**
- Optioneel: Stel `CRON_SECRET` environment variable in in Vercel
- De cron job controleert dit automatisch

## Historische Prijzen Laden

### Script 1: Alle historische prijzen (5 jaar)

```bash
npx ts-node scripts/load-all-historical-prices.ts
```

Dit script:
- Laadt prijzen van 5 jaar geleden tot vandaag
- Slaat bestaande records over (behalve laatste 7 dagen, die worden altijd geupdate)
- Gebruikt batch processing met rate limiting
- Toont een gedetailleerde voortgangsrapportage

**Output:**
- ✅ Successfully imported: X
- ⏭️ Skipped (already exists): Y
- ❌ Failed: Z

### Script 2: Specifieke periode

```bash
npx ts-node scripts/load-historical-dynamic-prices.ts --start 2020-11-30 --end 2025-11-30
```

## Environment Variables

Zorg dat deze variabelen zijn ingesteld:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=your-optional-cron-secret (optioneel)
```

## Database Structuur

De prijzen worden opgeslagen in de `dynamic_prices` tabel met:
- `datum` (primary key, date)
- `elektriciteit_gemiddeld_dag` (decimal)
- `elektriciteit_gemiddeld_nacht` (decimal)
- `elektriciteit_min_dag` (decimal)
- `elektriciteit_max_dag` (decimal)
- `gas_gemiddeld` (decimal)
- `gas_min` (decimal)
- `gas_max` (decimal)
- `bron` (text, e.g. 'ENERGYZERO')
- `laatst_geupdate` (timestamp)
- `is_voorspelling` (boolean)

## API Endpoints

### GET `/api/energieprijzen/historie`
Haalt historische prijzen op voor een date range.

**Query params:**
- `startDate` (YYYY-MM-DD, optioneel, default: 30 dagen geleden)
- `endDate` (YYYY-MM-DD, optioneel, default: vandaag)
- `type` ('elektriciteit' | 'gas' | 'beide', default: 'beide')

### GET `/api/energieprijzen/huidig`
Haalt huidige prijzen en trends op.

### GET `/api/cron/update-dynamic-prices`
Cron endpoint voor dagelijkse updates (alleen via Vercel Cron).

## Troubleshooting

### Prijzen worden niet bijgewerkt
1. Check Vercel logs voor cron job execution
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check EnergyZero API beschikbaarheid

### Historische prijzen laden mislukt
1. Check internet connectie
2. Verify Supabase credentials
3. Check rate limiting (script wacht automatisch tussen batches)

### Prijzen zijn incorrect
1. Recente prijzen (laatste 7 dagen) worden altijd geupdate
2. Run het historische script opnieuw met `--start` en `--end` voor specifieke periode
3. Check EnergyZero API response in logs

## Handmatige Update

Om handmatig prijzen bij te werken:

```bash
curl https://pakketadvies.vercel.app/api/cron/update-dynamic-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Of via Vercel dashboard:
1. Ga naar Project → Settings → Cron Jobs
2. Klik op "Trigger" naast de cron job

