# Cron Job Activeren - Stap voor Stap

## 🚨 Probleem

De cron job wordt niet uitgevoerd - er zijn geen logs in Vercel Dashboard.

## ✅ Oplossing: Activeer Cron Job in Vercel

### Stap 1: Ga naar Vercel Cron Jobs

1. **Vercel Dashboard** → Selecteer project "pakketadvies-website"
2. **Settings** → **Cron Jobs** (in de linker sidebar)
3. Check of de cron job zichtbaar is

### Stap 2: Activeer de Cron Job

Als de cron job niet actief is:

1. **Klik op de cron job** `/api/cron/update-dynamic-prices`
2. **Toggle "Enabled"** aan (als het uit staat)
3. **Save**

### Stap 3: Check Execution History

1. In de **Cron Jobs** pagina, klik op de cron job
2. Bekijk **"Execution History"** tab
3. Check of er recente runs zijn
4. Klik op een run om de logs te zien

### Stap 4: Test Handmatig

Test of de endpoint werkt:

```bash
# Met CRON_SECRET
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer test-secret-123"
```

### Stap 5: Trigger Manueel (via Vercel Dashboard)

1. **Cron Jobs** → Klik op de cron job
2. Klik op **"Trigger Now"** of **"Run Now"** button (als beschikbaar)
3. Bekijk de logs om te zien wat er gebeurt

## 🔧 Als Cron Job Niet Zichtbaar Is

Als de cron job niet verschijnt in Settings → Cron Jobs:

1. **Check `vercel.json`**:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/update-dynamic-prices",
         "schedule": "0 14 * * *"
       }
     ]
   }
   ```

2. **Redeploy** de applicatie:
   - Vercel Dashboard → Deployments
   - Klik op "..." → "Redeploy"
   - Of push een nieuwe commit naar GitHub

3. **Wacht 1-2 minuten** na deployment
4. **Refresh** de Cron Jobs pagina

## 📊 Verwachte Resultaten

Na activatie zou je moeten zien:
- ✅ Cron job verschijnt in Settings → Cron Jobs
- ✅ Execution history toont runs (elke dag om 14:00 UTC)
- ✅ Logs tonen succesvolle uitvoering
- ✅ Database krijgt nieuwe records

## 🚨 Als Het Nog Steeds Niet Werkt

Check:
1. **Is de cron job enabled?** (Settings → Cron Jobs)
2. **Zijn er errors in execution history?** (klik op een run)
3. **Werkt de endpoint handmatig?** (test met curl)
4. **Is CRON_SECRET correct?** (Settings → Environment Variables)

Laat me weten wat je ziet!

