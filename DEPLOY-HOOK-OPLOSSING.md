# Deploy Hook Oplossing - Stap voor Stap

## 🎯 Wat is een Deploy Hook?

Een **Deploy Hook** is een unieke URL van Vercel die je kunt gebruiken om handmatig een deployment te triggeren. Deze URL kun je ook gebruiken als webhook URL in GitHub!

## ✅ Stap 1: Maak Deploy Hook in Vercel

1. **Ga naar:** https://vercel.com/dashboard
2. **Selecteer project:** "pakketadvies-website"
3. **Ga naar:** Settings → Git
4. **Scroll naar:** "Deploy Hooks" sectie
5. **Vul in:**
   - **Name:** "GitHub Webhook" (of een andere naam)
   - **Branch:** "main"
6. **Klik op:** "Create Hook"

**Vercel geeft je nu een unieke URL zoals:**
```
https://api.vercel.com/v1/integrations/deploy/{hook-id}
```

**KOPIEER DEZE URL!** Je hebt deze nodig voor de volgende stap.

## ✅ Stap 2: Voeg Webhook Toe in GitHub

1. **Ga naar:** https://github.com/pakketadvies/pakketadvies-website/settings/hooks
2. **Klik op:** "Add webhook"
3. **Vul in:**
   - **Payload URL:** Plak de Deploy Hook URL van Vercel
   - **Content type:** `application/json`
   - **Secret:** (laat leeg - Vercel Deploy Hooks hebben geen secret nodig)
   - **Which events:** Selecteer "Just the push event"
   - **Active:** ✅ (vink aan)
4. **Klik op:** "Add webhook"

## ✅ Stap 3: Test de Webhook

```bash
# Maak een test commit
git commit --allow-empty -m "Test deploy hook webhook"
git push origin main

# Check Vercel Dashboard binnen 10-30 seconden
# Er zou een nieuwe deployment moeten verschijnen!
```

## 🧪 Test in Terminal (Na Setup)

Na het aanmaken, test in terminal:

```bash
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks
```

Je zou nu een webhook moeten zien met de Deploy Hook URL.

## 📊 Voordelen van Deze Aanpak

- ✅ Werkt direct zonder repository reconnect
- ✅ Je hebt volledige controle over de webhook URL
- ✅ Makkelijk te testen (je kunt de Deploy Hook URL direct aanroepen)
- ✅ Werkt ook voor handmatige deployments (je kunt de URL in een script gebruiken)

## 🔧 Troubleshooting

### Webhook geeft error
- Check of de Deploy Hook URL correct is gekopieerd
- Check of de branch naam correct is (`main`)
- Check GitHub → Settings → Webhooks → Recent Deliveries voor error details

### Deployment triggert niet
- Check of de Deploy Hook actief is in Vercel
- Check of de webhook actief is in GitHub (groen vinkje)
- Test de Deploy Hook URL direct in je browser (moet een deployment triggeren)

