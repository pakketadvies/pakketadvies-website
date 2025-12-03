# Webhook Status - Project ID: prj_6Az3CNttFoykSbJO283LukPcOSOF

## ✅ Webhook Aangemaakt

**Webhook ID:** 584203177  
**URL:** `https://api.vercel.com/v1/integrations/deploy/prj_6Az3CNttFoykSbJO283LukPcOSOF`  
**Status:** Actief  
**Events:** Push events

## ⚠️ Probleem

De webhook geeft een **404 error** bij test. Dit betekent dat de URL mogelijk niet correct is.

## 🔧 Oplossing

Vercel gebruikt meestal een **integration ID** in plaats van een **project ID** voor webhooks. De juiste webhook URL krijg je wanneer je de repository **reconnect** in Vercel Dashboard.

### Stap 1: Reconnect Repository in Vercel

1. **Vercel Dashboard → Settings → Git**
2. **Klik:** "Disconnect"
3. **Wacht:** 5 seconden
4. **Klik:** "Connect Git Repository"
5. **Selecteer:** `pakketadvies/pakketadvies-website`
6. **Branch:** `main`
7. **Klik:** "Connect"

**Vercel maakt automatisch de JUISTE webhook aan met de correcte integration ID!**

### Stap 2: Verwijder Oude Webhook

Na reconnect, verwijder de oude webhook (584203177) en gebruik de nieuwe die Vercel heeft aangemaakt:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks/584203177 --method DELETE
```

### Stap 3: Check Nieuwe Webhook

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks
```

Je zou nu een webhook moeten zien met de juiste Vercel integration URL.

## 🚀 Alternatief: Handmatig Redeploy

Als je nu direct een deployment wilt:

1. **Vercel Dashboard → Deployments**
2. **Klik:** "..." naast laatste deployment
3. **Klik:** "Redeploy"
4. **Selecteer:** "Use latest commit"
5. **Klik:** "Redeploy"

Dit werkt altijd, ook zonder webhook!

