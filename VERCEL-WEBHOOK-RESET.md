# Vercel Webhook Reset - Definitieve Oplossing

## 🚨 Het Probleem

- ✅ Webhook geeft status 201 (OK)
- ❌ Maar Vercel triggert geen deployment
- ❌ Reconnect lost het niet op

**Dit wijst op een fundamenteel probleem met de webhook configuratie.**

## ✅ Oplossing: Complete Reset

Ik heb **alle webhooks verwijderd** uit GitHub. Nu moeten we het opnieuw opzetten, maar dan **correct**.

### Stap 1: Check Vercel Project Settings

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Ga naar:** Settings → General
4. **Check:**
   - Is "Auto-deploy" aan? (moet aan staan)
   - Is "Production Branch" op `main` gezet?
   - Zijn er geen deployment restrictions?

### Stap 2: Reconnect Repository (Opnieuw)

1. **Vercel Dashboard → Settings → Git**
2. **Klik:** "Disconnect" (als er al een koppeling is)
3. **Wacht:** 10 seconden (langer dan normaal)
4. **Klik:** "Connect Git Repository"
5. **Selecteer:** `pakketadvies/pakketadvies-website`
6. **Selecteer branch:** `main`
7. **Klik:** "Connect"
8. **WACHT:** 30 seconden na connect

### Stap 3: Check of Vercel Webhook Heeft Aangemaakt

Na reconnect, check in terminal:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks
```

**Als er GEEN webhook is:**
- Vercel maakt de webhook niet automatisch aan
- Dit is een Vercel-side probleem
- Zie alternatieve oplossingen hieronder

**Als er WEL een webhook is:**
- Check de URL (moet `api.vercel.com/v1/integrations/deploy/...` zijn)
- Test de webhook (zie Stap 4)

### Stap 4: Test de Webhook

```bash
git commit --allow-empty -m "Test na reconnect"
git push origin main
```

**Check Vercel Dashboard binnen 30 seconden.**

## 🔧 Alternatieve Oplossingen

### Als Vercel Geen Webhook Aanmaakt

**Optie A: Vercel Support Contacten**
- Dit is een Vercel-side probleem
- Ga naar: https://vercel.com/support
- Leg uit dat webhooks niet automatisch worden aangemaakt

**Optie B: GitHub Actions Gebruiken**
- Maak een GitHub Action die Vercel deployt bij elke push
- Dit is betrouwbaarder dan webhooks

**Optie C: Handmatig Deployen**
- Gebruik Vercel Dashboard → Redeploy voor nu
- Of gebruik Vercel CLI: `npx vercel --prod`

## 📊 Huidige Status

- ✅ Alle oude webhooks verwijderd
- ⏳ Wacht op reconnect in Vercel
- ⏳ Check of Vercel webhook aanmaakt
- ⏳ Test of deployment werkt

## 🧪 Na Reconnect

Laat me weten:
1. Is er een webhook aangemaakt? (check via terminal)
2. Werkt de deployment na een test commit?

Als het nog steeds niet werkt, is het een Vercel-side probleem en moeten we Vercel support contacten.

