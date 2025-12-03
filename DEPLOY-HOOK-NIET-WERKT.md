# Deploy Hook Werkt Niet - Oplossing

## 🚨 Probleem

De webhook geeft status 201 (OK) in GitHub, maar Vercel triggert geen deployment. Dit betekent dat:
- ✅ GitHub heeft de webhook succesvol afgeleverd
- ❌ Vercel triggert de deployment niet (mogelijk Deploy Hook configuratie probleem)

## ✅ OPLOSSING: Reconnect Repository (AANBEVOLEN)

De Deploy Hook methode werkt niet betrouwbaar. De beste oplossing is om de repository opnieuw te koppelen - dan maakt Vercel automatisch de JUISTE webhook aan.

### Stap voor Stap:

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Ga naar:** Settings → Git
4. **Klik op:** "Disconnect" (als er al een koppeling is)
5. **Wacht:** 5 seconden
6. **Klik op:** "Connect Git Repository"
7. **Selecteer:** `pakketadvies/pakketadvies-website`
8. **Selecteer branch:** `main`
9. **Klik:** "Connect"

**Na reconnect:**
- ✅ Vercel maakt automatisch de JUISTE webhook aan
- ✅ Vercel synchroniseert met GitHub (ziet alle nieuwe commits)
- ✅ Vercel triggert direct een deployment met de nieuwste commit
- ✅ Automatische deployments werken vanaf nu perfect

## 🧪 Test Na Reconnect

```bash
git commit --allow-empty -m "Test na reconnect"
git push origin main
```

**Binnen 10-30 seconden** zou er automatisch een nieuwe deployment moeten verschijnen!

## 📊 Waarom Reconnect Beter Is

- ✅ Vercel maakt automatisch de juiste webhook aan (geen handmatig werk)
- ✅ Vercel synchroniseert met GitHub (ziet alle commits)
- ✅ Betrouwbaarder dan Deploy Hook
- ✅ Werkt altijd

## 🗑️ Optioneel: Verwijder Oude Webhook

Na reconnect, verwijder de oude Deploy Hook webhook:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks/584204872 --method DELETE
```

Vercel maakt automatisch een nieuwe webhook aan die wel werkt.

