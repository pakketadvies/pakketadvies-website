# 🔄 Migratie van Vercel Cron naar EasyCron.com

## 🎯 Probleem

De Vercel Cron Job voor het bijwerken van dynamische energieprijzen werkt niet betrouwbaar:
- Onduidelijk of de job daadwerkelijk wordt uitgevoerd
- Geen goede logging/monitoring in Vercel
- Moeilijk te debuggen

## ✅ Oplossing: EasyCron.com

EasyCron.com is een externe cron job service met:
- ✅ Betrouwbare uitvoering
- ✅ Uitgebreide logging
- ✅ Email alerts bij failures
- ✅ Gratis voor 1-5 jobs

---

## 📋 STAP 1: Account Aanmaken op EasyCron.com

1. Ga naar https://www.easycron.com/
2. Klik op **"Sign Up Free"**
3. Maak een account aan met je email
4. Bevestig je email

**Gratis Plan:**
- Tot 5 cron jobs
- Elke 5 minuten (maar wij gebruiken dagelijks)
- Perfecte voor onze use case

---

## 📋 STAP 2: Maak een Random Secret aan

We gaan een secret token aanmaken om de cron endpoint te beveiligen:

```bash
# Genereer een random secret (32 characters)
openssl rand -hex 32
```

**Voorbeeld output:**
```
a7f9e2c8d4b6f3e1a7f9e2c8d4b6f3e1a7f9e2c8d4b6f3e1a7f9e2c8d4b6f3e1
```

**BEWAAR DEZE SECRET GOED!** 

---

## 📋 STAP 3: Voeg Secret toe aan Vercel

1. Ga naar https://vercel.com/dashboard
2. Selecteer je **PakketAdvies** project
3. Klik op **Settings** → **Environment Variables**
4. Klik op **Add New**
5. Voeg toe:
   ```
   Key: EASYCRON_SECRET
   Value: [jouw-gegenereerde-secret]
   ```
6. Vink ALLE drie aan: ✅ Production, ✅ Preview, ✅ Development
7. Klik **Save**
8. **HERDEPLOY** je website:
   - Ga naar **Deployments** tab
   - Klik op **⋯** (3 dots) bij de laatste deployment
   - Klik **Redeploy**

---

## 📋 STAP 4: Verwijder oude Vercel Cron Job

We gaan de oude cron job uit `vercel.json` halen:

**Oude vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/update-dynamic-prices",
      "schedule": "0 14 * * *"
    },
    {
      "path": "/api/cron/send-review-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

**Nieuwe vercel.json:** (alleen review emails)
```json
{
  "crons": [
    {
      "path": "/api/cron/send-review-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```

---

## 📋 STAP 5: Test de Cron Endpoint Handmatig

Na het herdeploy, test of de endpoint werkt:

```bash
curl -X GET "https://pakketadvies.nl/api/cron/update-dynamic-prices" \
  -H "Authorization: Bearer [jouw-easycron-secret]" \
  -v
```

**Verwacht resultaat:**
```json
{
  "success": true,
  "message": "Daily price update completed successfully",
  "today": {
    "success": true,
    "date": "2025-01-05",
    ...
  },
  "tomorrow": {
    "success": true,
    "date": "2025-01-06",
    ...
  }
}
```

**Als het werkt: ✅ Ga door naar Stap 6**

---

## 📋 STAP 6: Configureer Cron Job in EasyCron

1. Log in op https://www.easycron.com/
2. Klik op **"Cron Jobs"** in het menu
3. Klik op **"+ Add Cron Job"**

### **Configuratie voor Dynamic Prices Update:**

**URL:**
```
https://pakketadvies.nl/api/cron/update-dynamic-prices
```

**Cron Expression:**
```
0 14 * * *
```
*(Betekent: Dagelijks om 14:00 UTC = 15:00/16:00 Nederlandse tijd)*

**HTTP Method:** `GET`

**HTTP Headers:**
```
Authorization: Bearer [jouw-easycron-secret]
```
*(Vervang [jouw-easycron-secret] met je gegenereerde secret)*

**Enable HTTPS:** ✅ Yes

**Notification Email:** `info@pakketadvies.nl`
- ✅ Email me when the cron job fails
- ⬜ Email me every time (niet nodig)

**Timeout:** `60 seconds` (standaard is prima)

**Save the cron job**

---

## 📋 STAP 7: Test de EasyCron Job

1. In EasyCron, klik op **"Test"** naast je cron job
2. Bekijk de **Response** tab
3. Controleer of je een `{"success": true}` response krijgt

**Als de test slaagt: ✅ KLAAR!**

---

## 📊 Monitoring & Logs

### **EasyCron Dashboard:**
- Zie alle uitgevoerde jobs
- Bekijk response times
- Check failures

### **Vercel Logs:**
```bash
vercel logs --follow
```

### **Supabase Check:**
```bash
# Check of de prijzen worden bijgewerkt
curl https://pakketadvies.nl/api/energieprijzen/check
```

**Verwacht:**
- Nieuwe records verschijnen dagelijks om ~14:05 UTC
- `laatst_geupdate` timestamp wordt bijgewerkt

---

## 🎉 Resultaat

✅ Dagelijkse update van energieprijzen via EasyCron  
✅ Betrouwbare uitvoering met logging  
✅ Email alerts bij failures  
✅ Onafhankelijk van Vercel cron systeem  

---

## 🆘 Troubleshooting

### **Probleem: "Unauthorized" response**
- Check of `EASYCRON_SECRET` correct is ingesteld in Vercel
- Check of je de correcte secret gebruikt in EasyCron HTTP header
- Check of je `Bearer ` hebt toegevoegd voor de secret

### **Probleem: "Failed to fetch prices"**
- Check EnergyZero API status
- Check Supabase connectie
- Bekijk Vercel logs voor details

### **Probleem: Cron job draait niet**
- Check of de cron expression correct is
- Check of de job "Enabled" is in EasyCron
- Check timezone settings (UTC vs CET)

---

## 📞 Support

- **EasyCron Support:** support@easycron.com
- **Vercel Logs:** `vercel logs`
- **Supabase Dashboard:** https://supabase.com/dashboard


