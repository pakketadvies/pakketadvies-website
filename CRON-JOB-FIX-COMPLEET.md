# Cron Job Fix - Complete Guide

## ✅ Wat ik heb gefixt

1. **Authenticatie verbeterd** - Betere detectie van Vercel cron headers
2. **Betere logging** - Meer debug informatie

## 🔍 Wat je moet checken

### 1. Vercel Cron Jobs Status

Ga naar Vercel Dashboard:
1. **Settings → Cron Jobs**
2. Check of de cron job is **geactiveerd**
3. Check de **logs** van de laatste runs
4. Check of er **errors** zijn

### 2. CRON_SECRET Environment Variable

Check of `CRON_SECRET` is ingesteld in Vercel:
1. **Settings → Environment Variables**
2. Zoek naar `CRON_SECRET` in **Production**
3. Als het niet bestaat, voeg het toe:
   - Key: `CRON_SECRET`
   - Value: (genereer een random string, bijv. via `openssl rand -hex 32`)
   - Environment: **Production** (en Preview als je wilt testen)

### 3. Test de Cron Job Handmatig

Test of de endpoint werkt:

```bash
# Met CRON_SECRET (als ingesteld)
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Of zonder (als CRON_SECRET niet is ingesteld)
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices"
```

### 4. Check Vercel Logs

Check deployment logs voor errors:
1. **Deployments** → Klik op laatste deployment
2. **Logs** tab
3. Zoek naar:
   - "cron"
   - "update-dynamic-prices"
   - Errors

### 5. Check Database

Check of data wordt opgeslagen:
1. Ga naar Supabase Dashboard
2. **Table Editor** → `dynamic_prices`
3. Check of er nieuwe records worden toegevoegd
4. Check de `datum` kolom - moet morgen's datum zijn

## 🚨 Mogelijke Problemen

### Probleem 1: Cron Job niet geactiveerd
**Oplossing**: Activeer in Vercel Dashboard → Settings → Cron Jobs

### Probleem 2: CRON_SECRET niet ingesteld
**Oplossing**: Voeg `CRON_SECRET` toe aan Vercel Environment Variables

### Probleem 3: EnergyZero API faalt
**Oplossing**: Check logs voor API errors, mogelijk rate limiting

### Probleem 4: Database opslag faalt
**Oplossing**: Check Supabase credentials en permissions

## 📊 Debugging

Als de cron job nog steeds niet werkt:

1. **Check Vercel Cron Logs**:
   - Vercel Dashboard → Settings → Cron Jobs
   - Klik op de cron job
   - Bekijk execution history

2. **Check Deployment Logs**:
   - Vercel Dashboard → Deployments
   - Klik op deployment → Logs
   - Zoek naar errors

3. **Test Handmatig**:
   - Gebruik curl command hierboven
   - Check response voor errors

4. **Check Database**:
   - Supabase Dashboard → Table Editor
   - Check `dynamic_prices` tabel
   - Check laatste `laatst_geupdate` timestamp

## ✅ Verwachte Werking

De cron job zou moeten:
1. ✅ Draaien elke dag om **14:00 UTC** (15:00/16:00 Nederlandse tijd)
2. ✅ Fetchen van **morgen's** day-ahead prijzen
3. ✅ Opslaan in Supabase `dynamic_prices` tabel
4. ✅ Update bestaande records als ze al bestaan

## 🔧 Als het nog steeds niet werkt

Laat me weten:
1. Wat zie je in Vercel Cron Jobs logs?
2. Wat is de response van de handmatige test?
3. Zijn er errors in de deployment logs?
4. Wordt er data opgeslagen in Supabase?

Dan kan ik verder debuggen!

