# Handmatige Deployment Instructies

## 🚨 Probleem: Vercel triggert geen automatische deployments meer

Als je geen nieuwe deployments ziet na GitHub pushes, volg deze stappen:

## ✅ Oplossing 1: Handmatig Redeploy via Vercel Dashboard

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Ga naar Deployments tab**
   - Klik op "Deployments" in het menu

3. **Redeploy de laatste deployment**
   - Klik op de "..." (drie puntjes) naast de laatste deployment
   - Klik op **"Redeploy"**
   - Selecteer **"Use existing Build Cache"** of **"Use latest commit"**
   - Klik op **"Redeploy"**

## ✅ Oplossing 2: Reconnect Git Repository

Als handmatig redeployen niet werkt:

1. **Ga naar Settings → Git**
   - In Vercel Dashboard, klik op "Settings"
   - Klik op "Git" in het submenu

2. **Disconnect en reconnect**
   - Klik op **"Disconnect"** (als er al een koppeling is)
   - Klik op **"Connect Git Repository"**
   - Selecteer je GitHub repository: `pakketadvies/pakketadvies-website`
   - Selecteer branch: `main`
   - Klik op **"Connect"**

3. **Dit triggert automatisch een nieuwe deployment**

## ✅ Oplossing 3: Check GitHub Webhook

1. **Ga naar GitHub Repository**
   - https://github.com/pakketadvies/pakketadvies-website
   - Klik op **"Settings"** (rechtsboven in de repo)

2. **Ga naar Webhooks**
   - Klik op **"Webhooks"** in het linker menu
   - Check of er een webhook is voor Vercel
   - Check of de webhook **actief** is (groen vinkje)

3. **Als er geen webhook is of deze niet werkt:**
   - Vercel reconnect (zie Oplossing 2) zou dit moeten fixen
   - Of maak handmatig een webhook aan (maar reconnect is makkelijker)

## ✅ Oplossing 4: Via Vercel CLI (als geïnstalleerd)

```bash
# Navigeer naar project directory
cd "/Users/irmastol/Desktop/PakketAdvies Website"

# Deploy naar production
npx vercel --prod

# Of als vercel CLI globaal is geïnstalleerd:
vercel --prod
```

## 🔍 Check Deployment Status

Na het triggeren van een deployment:

1. **Ga naar Deployments tab**
2. **Check of er een nieuwe deployment verschijnt**
3. **Klik op de deployment om logs te zien**
4. **Check of de build succesvol is**

## 📝 Laatste Commits die gedeployed moeten worden:

- `0d06954` - Trigger Vercel deployment
- `19e9ae7` - Fix kennisbank: ensure featured article is ALWAYS first
- `28aef42` - Fix kennisbank: ensure pagination displays correctly
- `4d38a28` - Fix kennisbank: improve featured article sorting
- `6af09c8` - Fix artikel pages: update params to Promise
- `55efe67` - Fix kennisbank: featured artikel altijd bovenaan + paginering

## 🚨 Als niets werkt:

1. **Check Vercel Status**
   - https://www.vercel-status.com/
   - Check of er bekende problemen zijn

2. **Contact Vercel Support**
   - https://vercel.com/support
   - Leg uit dat automatische deployments niet meer werken

3. **Check Project Settings**
   - Settings → General
   - Check of project niet is gepauzeerd of gedeactiveerd

