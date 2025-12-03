# Handmatig Deployment Triggeren - Oplossing

## 🎯 Het Probleem

Er is **geen webhook** geconfigureerd in GitHub, daarom worden er geen automatische deployments getriggerd. Dit heeft **NIETS** te maken met de domeinwissel - de `vercel.json` is correct ingesteld.

## ✅ SNELSTE OPLOSSING: Via Vercel Dashboard (30 seconden)

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Klik op:** "Deployments" tab
4. **Klik op:** "..." (drie puntjes) naast de laatste deployment
5. **Klik op:** "Redeploy"
6. **Selecteer:** "Use latest commit" (of laat op "Use existing Build Cache")
7. **Klik op:** "Redeploy"

**KLAAR!** Dit triggert direct een nieuwe deployment met alle laatste commits.

## 🔧 PERMANENTE OPLOSSING: Webhook Aanmaken

Om **automatische deployments** te krijgen bij elke GitHub push:

### Optie A: Reconnect Repository (AANBEVOLEN)

1. **Vercel Dashboard → Settings → Git**
2. **Klik:** "Disconnect"
3. **Wacht:** 5 seconden
4. **Klik:** "Connect Git Repository"
5. **Selecteer:** `pakketadvies/pakketadvies-website`
6. **Branch:** `main`
7. **Klik:** "Connect"

**Vercel maakt automatisch de juiste webhook aan!**

### Optie B: Check Webhook Status (Na Reconnect)

Na reconnect, test in terminal:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks
```

Je zou nu een webhook moeten zien met de Vercel URL.

## 📊 Huidige Status

- ✅ `vercel.json` is correct (domeinwissel is goed geconfigureerd)
- ✅ GitHub repository is correct
- ❌ **GEEN webhook** in GitHub (daarom geen deployments)
- ✅ Alle commits staan op GitHub

## 🚀 Test Na Fix

```bash
# Test commit
git commit --allow-empty -m "Test webhook"
git push origin main

# Check Vercel Dashboard binnen 10-30 seconden
# Er zou een nieuwe deployment moeten verschijnen
```

## 💡 Waarom Geen Webhook?

Wanneer je een repository **reconnect** in Vercel, maakt Vercel automatisch een webhook aan. Als dit niet is gebeurd, kan het zijn dat:
- De reconnect niet volledig is doorgevoerd
- Er een probleem was tijdens het koppelen
- De webhook is verwijderd of gedeactiveerd

**Oplossing:** Reconnect de repository opnieuw (zie Optie A hierboven).
