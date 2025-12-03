# Webhook Fix - Terminal Resultaten

## 🔍 Probleem Gevonden

**Er was GEEN webhook geconfigureerd in GitHub!** Daarom werden er geen deployments getriggerd.

## ✅ Wat Ik Heb Gedaan

1. **GitHub CLI gevonden en geladen**
   - Path: `~/.local/bin/gh`
   - Versie: 2.83.1
   - Status: ✅ Ingelogd als `pakketadvies`

2. **Webhooks gecheckt**
   - Resultaat: `[]` (leeg - geen webhooks!)

3. **Test webhook aangemaakt**
   - Webhook ID: 584202543
   - URL gebruikt: `https://api.vercel.com/v1/integrations/deploy`
   - **Resultaat: 404 Error** ❌

## 🚨 Het Probleem

De algemene Vercel webhook URL werkt niet. We hebben de **specifieke project webhook URL** nodig van Vercel.

## 🔧 Oplossing

### Optie 1: Via Vercel Dashboard (AANBEVOLEN - 100% Werkt)

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Disconnect en Reconnect Repository**
   - Settings → Git → **Disconnect**
   - Wacht 5 seconden
   - **Connect Git Repository**
   - Selecteer: `pakketadvies/pakketadvies-website`
   - Branch: `main`
   - Klik **Connect**

3. **Vercel maakt automatisch de juiste webhook aan!**

4. **Test in Terminal:**
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   gh api repos/pakketadvies/pakketadvies-website/hooks
   ```
   - Je zou nu een webhook moeten zien met de juiste Vercel URL

### Optie 2: Handmatig Webhook URL Ophalen

1. **Vercel Dashboard → Settings → Git**
2. Kijk of er een "View Webhook" of "Webhook URL" link is
3. Kopieer die URL
4. **Voeg handmatig toe via Terminal:**
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   gh api repos/pakketadvies/pakketadvies-website/hooks --method POST --input - <<EOF
   {
     "name": "web",
     "active": true,
     "events": ["push"],
     "config": {
       "url": "PLAK_HIER_DE_VERCEL_WEBHOOK_URL",
       "content_type": "json"
     }
   }
   EOF
   ```

## ✅ Test Na Fix

```bash
# Check webhooks
export PATH="$HOME/.local/bin:$PATH"
gh api repos/pakketadvies/pakketadvies-website/hooks

# Test commit
git commit --allow-empty -m "Test webhook"
git push origin main

# Check webhook deliveries (na 10 seconden)
gh api repos/pakketadvies/pakketadvies-website/hooks/{HOOK_ID}/deliveries | head -20
```

## 📊 Huidige Status

- ✅ GitHub CLI werkt
- ✅ GitHub authentication werkt
- ✅ Repository is correct gekoppeld
- ❌ Webhook bestaat niet (of heeft verkeerde URL)
- ❌ Deployments worden niet getriggerd

**Volgende stap:** Reconnect repository in Vercel Dashboard (Optie 1) - dit is de snelste en meest betrouwbare oplossing!

