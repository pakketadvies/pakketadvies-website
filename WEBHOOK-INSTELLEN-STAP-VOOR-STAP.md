# Webhook Instellen - Stap voor Stap

## 📋 Stap 1: Vercel Webhook URL Ophalen

**Optie A: Via Vercel Dashboard (aanbevolen)**

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Ga naar Settings → Git**
   - Klik op "Settings" in het linker menu
   - Klik op "Git"

3. **Check Connected Git Repository**
   - Als er al een repository is gekoppeld, zie je de repository naam
   - **BELANGRIJK**: Als je de repository reconnect, maakt Vercel automatisch de webhook aan

4. **Als je de webhook URL nodig hebt:**
   - Klik op "Disconnect"
   - Klik op "Connect Git Repository"
   - Selecteer `pakketadvies/pakketadvies-website`
   - Selecteer branch `main`
   - Klik "Connect"
   - **Vercel maakt nu automatisch de webhook aan in GitHub!**

**Optie B: Webhook URL Handmatig Vinden**

Als je de webhook URL handmatig wilt vinden:

1. Ga naar Vercel Dashboard → Settings → Git
2. Als er een "View Webhook" of "Webhook URL" link is, klik daarop
3. Kopieer de URL

De webhook URL ziet er meestal zo uit:
```
https://api.vercel.com/v1/integrations/deploy/{integration-id}
```

## 📋 Stap 2: Webhook Toevoegen in GitHub

1. **Ga naar GitHub Repository**
   - https://github.com/pakketadvies/pakketadvies-website/settings/hooks

2. **Klik op "Add webhook"**

3. **Vul de webhook gegevens in:**

   **Payload URL:**
   - Plak hier de webhook URL van Vercel
   - Of gebruik de URL die Vercel automatisch heeft aangemaakt (zie Optie A hierboven)

   **Content type:**
   - Selecteer: `application/json`

   **Secret:**
   - Laat dit leeg (Vercel gebruikt meestal geen secret)
   - Of voeg een secret toe als Vercel dat vereist

   **Which events would you like to trigger this webhook?**
   - Selecteer: **"Just the push event"**
   - Dit triggert alleen bij pushes naar de repository

   **Active:**
   - ✅ Vink aan (webhook moet actief zijn)

4. **Klik op "Add webhook"**

5. **GitHub test de webhook direct**
   - Je ziet een groen vinkje als het werkt
   - Of een rood kruisje als er een probleem is

## ✅ Stap 3: Test de Webhook

1. **Maak een test commit:**
   ```bash
   git commit --allow-empty -m "Test webhook"
   git push origin main
   ```

2. **Check Vercel Dashboard**
   - Ga naar Deployments tab
   - Je zou binnen 10-30 seconden een nieuwe deployment moeten zien

## 🚨 Troubleshooting

### Webhook geeft error
- Check of de URL correct is
- Check of de repository correct is gekoppeld in Vercel
- Probeer de repository opnieuw te connecten in Vercel

### Webhook werkt niet
- Check GitHub → Settings → Webhooks → Recent Deliveries
- Kijk naar de error messages
- Probeer de webhook opnieuw aan te maken

### Automatische webhook (aanbevolen)
**De makkelijkste manier**: Reconnect de repository in Vercel. Vercel maakt dan automatisch de webhook aan en je hoeft niets handmatig te doen!

