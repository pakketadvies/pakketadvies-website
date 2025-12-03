# Webhook Fix - Vercel Deployment

## 🚨 Probleem: Geen webhook in GitHub

Je hebt GEEN webhook geconfigureerd in GitHub, daarom triggert Vercel geen automatische deployments.

## ✅ Oplossing 1: Handmatig Redeploy (SNELSTE - 30 seconden)

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Ga naar Deployments tab**

3. **Klik op "..." naast de laatste deployment**

4. **Klik op "Redeploy"**

5. **Selecteer "Use latest commit"**

6. **Klik "Redeploy"**

**KLAAR!** Dit triggert direct een nieuwe deployment met alle laatste commits.

## ✅ Oplossing 2: Webhook Handmatig Toevoegen (als je automatische deployments wilt)

Als je automatische deployments wilt bij elke GitHub push:

1. **Ga naar GitHub Repository**
   - https://github.com/pakketadvies/pakketadvies-website/settings/hooks

2. **Klik op "Add webhook"**

3. **Vul in:**
   - **Payload URL**: `https://api.vercel.com/v1/integrations/deploy/...`
     - **BELANGRIJK**: Deze URL krijg je van Vercel wanneer je de repository reconnect
     - Of ga naar Vercel Dashboard → Settings → Git → Connected Git Repository
     - Daar staat de webhook URL
   
   - **Content type**: `application/json`
   - **Secret**: (laat leeg of gebruik de secret van Vercel)
   - **Which events**: Selecteer "Just the push event"
   - **Active**: ✅ (aanvinken)

4. **Klik "Add webhook"**

**MAAR**: Dit is eigenlijk niet nodig als je de repository reconnect in Vercel - dan maakt Vercel automatisch de webhook aan.

## ✅ Oplossing 3: Reconnect Repository in Vercel (aanbevolen)

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Ga naar Settings → Git**

3. **Klik op "Disconnect"**

4. **Wacht 5 seconden**

5. **Klik op "Connect Git Repository"**

6. **Selecteer**: `pakketadvies/pakketadvies-website`

7. **Selecteer branch**: `main`

8. **Klik "Connect"**

9. **Vercel maakt nu automatisch de webhook aan in GitHub**

10. **Dit triggert ook direct een nieuwe deployment!**

## 🎯 AANBEVOLEN: Gebruik Oplossing 1 (Handmatig Redeploy)

Dit is de snelste manier om NU een deployment te krijgen. De webhook kan later worden gefixed voor automatische deployments.

