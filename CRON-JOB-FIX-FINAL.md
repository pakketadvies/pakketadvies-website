# Cron Job Fix - Final Solution

## ✅ Wat ik heb gefixt

1. **Dynamic rendering toegevoegd** - `export const dynamic = 'force-dynamic'` om caching te voorkomen
2. **Authenticatie verbeterd** - Ondersteunt nu:
   - Vercel direct secret format (Authorization: <CRON_SECRET>)
   - Bearer token format (Authorization: Bearer <CRON_SECRET>)
   - Vercel cron headers (x-vercel-cron)
3. **Betere error handling** - Meer debug informatie

## 🔍 Belangrijke Fixes

### 1. Dynamic Rendering
Vercel cron jobs kunnen falen als de route wordt gecached. Door `export const dynamic = 'force-dynamic'` toe te voegen, wordt de route altijd dynamisch gerenderd.

### 2. Authenticatie
Vercel cron jobs kunnen de CRON_SECRET op verschillende manieren sturen:
- Direct als Authorization header (zonder "Bearer")
- Met x-vercel-cron header
- Met x-vercel-signature header

De code ondersteunt nu alle drie de methoden.

## 📋 Checklist om te Verifiëren

### 1. Vercel Cron Jobs Status
- [ ] Ga naar Vercel Dashboard → Settings → Cron Jobs
- [ ] Check of de cron job is **geactiveerd**
- [ ] Check de **execution history** - zijn er recente runs?
- [ ] Check de **logs** van de laatste runs - zijn er errors?

### 2. CRON_SECRET Environment Variable
- [ ] Ga naar Settings → Environment Variables
- [ ] Check of `CRON_SECRET` bestaat in **Production**
- [ ] Als niet, voeg toe:
  - Key: `CRON_SECRET`
  - Value: (genereer met `openssl rand -hex 32`)
  - Environment: **Production**

### 3. Test Handmatig
Test de endpoint handmatig:

```bash
# Met CRON_SECRET (Bearer format)
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Of gebruik het test script
./test-cron-manual.sh
```

### 4. Check Vercel Logs
- [ ] Vercel Dashboard → Deployments → Klik op laatste deployment
- [ ] **Logs** tab
- [ ] Zoek naar:
  - "cron"
  - "update-dynamic-prices"
  - "✅" of "❌" emoji's
  - Errors

### 5. Check Database
- [ ] Supabase Dashboard → Table Editor → `dynamic_prices`
- [ ] Check of er nieuwe records worden toegevoegd
- [ ] Check `datum` kolom - moet morgen's datum zijn
- [ ] Check `laatst_geupdate` timestamp

## 🚨 Veelvoorkomende Problemen

### Probleem 1: Cron Job niet geactiveerd
**Symptoom**: Geen execution history in Vercel Dashboard
**Oplossing**: 
1. Ga naar Settings → Cron Jobs
2. Check of de cron job enabled is
3. Als niet, activeer het

### Probleem 2: CRON_SECRET niet ingesteld
**Symptoom**: 401 Unauthorized errors in logs
**Oplossing**: 
1. Voeg `CRON_SECRET` toe aan Environment Variables
2. Redeploy de applicatie

### Probleem 3: Route wordt gecached
**Symptoom**: Cron job draait maar doet niets
**Oplossing**: 
- ✅ Gefixt met `export const dynamic = 'force-dynamic'`

### Probleem 4: EnergyZero API faalt
**Symptoom**: Errors in logs over API calls
**Oplossing**: 
- Check of EnergyZero API beschikbaar is
- Check rate limiting
- Check network connectivity

### Probleem 5: Database opslag faalt
**Symptoom**: Errors in logs over Supabase
**Oplossing**: 
- Check Supabase credentials
- Check database permissions
- Check tabel structuur

## 📊 Debugging Commands

### Check cron job configuratie
```bash
cat vercel.json | grep -A 5 "crons"
```

### Test endpoint handmatig
```bash
# Met CRON_SECRET
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -v
```

### Check logs lokaal
```bash
# Als je lokaal draait
curl -X GET "http://localhost:3000/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## ✅ Verwachte Werking

Na deze fixes zou de cron job moeten:
1. ✅ Draaien elke dag om **14:00 UTC** (15:00/16:00 Nederlandse tijd)
2. ✅ Correct authenticeren met Vercel cron headers
3. ✅ Fetchen van **morgen's** day-ahead prijzen
4. ✅ Opslaan in Supabase `dynamic_prices` tabel
5. ✅ Update bestaande records als ze al bestaan

## 🔧 Als het nog steeds niet werkt

Laat me weten:
1. **Wat zie je in Vercel Cron Jobs logs?** (execution history)
2. **Wat is de response van de handmatige test?** (gebruik test-cron-manual.sh)
3. **Zijn er errors in de deployment logs?** (zoek naar "❌" of errors)
4. **Wordt er data opgeslagen in Supabase?** (check laatste records)

Dan kan ik verder debuggen!

