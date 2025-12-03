# Cron Job Debug & Fix

## 🚨 Probleem

De cron job werkt niet - hij zou elke dag om 14:00 UTC de data van de volgende dag in de database moeten zetten.

## 🔍 Mogelijke Oorzaken

1. **Vercel Cron Authenticatie**
   - Vercel cron jobs gebruiken een speciale header: `x-vercel-cron` of `x-vercel-signature`
   - De huidige code checkt deze headers, maar mogelijk niet correct

2. **CRON_SECRET niet ingesteld**
   - Als CRON_SECRET niet is ingesteld in Vercel, kan de authenticatie falen

3. **Vercel Cron Jobs niet geactiveerd**
   - Cron jobs moeten worden geactiveerd in Vercel Dashboard
   - Check: Settings → Cron Jobs

4. **API Errors**
   - EnergyZero API kan falen
   - Database opslag kan falen

## ✅ Oplossing

### Stap 1: Check Vercel Cron Jobs

1. Ga naar Vercel Dashboard → Settings → Cron Jobs
2. Check of de cron job is geactiveerd
3. Check de logs van de laatste runs

### Stap 2: Fix Authenticatie

Vercel cron jobs sturen automatisch een `Authorization` header met de CRON_SECRET, maar we moeten ook checken op Vercel-specifieke headers.

### Stap 3: Test Handmatig

Test de cron job handmatig om te zien wat er mis gaat:

```bash
# Met CRON_SECRET
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Of zonder (als CRON_SECRET niet is ingesteld)
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices"
```

### Stap 4: Check Logs

Check Vercel deployment logs voor errors:
- Vercel Dashboard → Deployments → Klik op deployment → Logs
- Zoek naar "cron" of "update-dynamic-prices"

## 🔧 Code Fixes

1. Verbeter Vercel cron authenticatie
2. Betere error handling
3. Betere logging

