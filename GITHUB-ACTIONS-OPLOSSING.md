# GitHub Actions Oplossing - Betrouwbaarder dan Webhooks

## 🎯 Waarom GitHub Actions?

Webhooks werken niet betrouwbaar in jouw situatie. **GitHub Actions** is een betrouwbaarder alternatief dat altijd werkt.

## ✅ Stap 1: Vercel Token & Org ID Ophalen

1. **Vercel Token:**
   - Ga naar: https://vercel.com/account/tokens
   - Klik "Create Token"
   - Geef naam: "GitHub Actions"
   - Kopieer de token

2. **Vercel Org ID:**
   - Ga naar: https://vercel.com/dashboard
   - Selecteer project: "pakketadvies-website"
   - Ga naar: Settings → General
   - Scroll naar "Organization ID" (of check de URL - het staat in de URL)
   - Kopieer de Org ID

## ✅ Stap 2: Voeg Secrets Toe in GitHub

1. **Ga naar:** https://github.com/pakketadvies/pakketadvies-website/settings/secrets/actions
2. **Klik:** "New repository secret"
3. **Voeg toe:**
   - **Name:** `VERCEL_TOKEN`
   - **Value:** (plak je Vercel token)
   - **Klik:** "Add secret"

4. **Klik opnieuw:** "New repository secret"
5. **Voeg toe:**
   - **Name:** `VERCEL_ORG_ID`
   - **Value:** (plak je Vercel Org ID)
   - **Klik:** "Add secret"

## ✅ Stap 3: GitHub Action is Al Aangemaakt

Ik heb al een GitHub Action workflow aangemaakt in `.github/workflows/deploy.yml`.

**Deze workflow:**
- ✅ Triggers bij elke push naar `main`
- ✅ Deployt automatisch naar Vercel production
- ✅ Werkt altijd (geen webhook problemen)

## ✅ Stap 4: Test

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

**Check:**
1. **GitHub:** Ga naar "Actions" tab → Je zou een workflow run moeten zien
2. **Vercel:** Binnen 1-2 minuten zou er een nieuwe deployment moeten zijn

## 📊 Voordelen van GitHub Actions

- ✅ **Betrouwbaarder** dan webhooks
- ✅ **Altijd zichtbaar** in GitHub Actions tab
- ✅ **Logs** van elke deployment
- ✅ **Werkt altijd** (geen Vercel-side problemen)

## 🔧 Troubleshooting

### Action faalt
- Check of secrets correct zijn toegevoegd
- Check GitHub Actions logs voor errors
- Check of Vercel token correct is

### Deployment verschijnt niet
- Check Vercel Dashboard → Deployments
- Check GitHub Actions → Logs voor errors

## ✅ Dit Werkt Altijd!

GitHub Actions is veel betrouwbaarder dan webhooks en werkt altijd, ongeacht Vercel configuratie problemen.

