# Webhook Debug - Waarom Triggers Het Niet?

## 🔍 Stap 1: Check of Webhook Bestaat in GitHub

1. **Ga naar GitHub Repository Settings**
   - https://github.com/pakketadvies/pakketadvies-website/settings/hooks

2. **Check of er een webhook staat**
   - Als er GEEN webhook staat → Dit is het probleem!
   - Als er WEL een webhook staat → Check de status (groen vinkje of rood kruisje)

3. **Als er geen webhook is:**
   - Vercel heeft de webhook NIET automatisch aangemaakt
   - Je moet deze handmatig aanmaken (zie hieronder)

## 🔍 Stap 2: Check Vercel Git Configuratie

1. **Ga naar Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecteer project "pakketadvies-website"

2. **Ga naar Settings → Git**
   - Check of de repository correct is gekoppeld
   - Check welke branch is geselecteerd (moet `main` zijn)
   - Check of "Production Branch" op `main` staat

3. **Check of er een "View Webhook" of "Webhook URL" link is**
   - Als die er is, klik erop en kopieer de URL
   - Deze URL heb je nodig voor de handmatige webhook

## 🔧 Stap 3: Webhook Handmatig Aanmaken (Als Die Er Niet Is)

### Optie A: Via Vercel Dashboard (Probeer Dit Eerst)

1. **Disconnect en Reconnect de Repository**
   - Vercel Dashboard → Settings → Git
   - Klik op "Disconnect"
   - Wacht 5 seconden
   - Klik op "Connect Git Repository"
   - Selecteer `pakketadvies/pakketadvies-website`
   - Selecteer branch `main`
   - Klik "Connect"
   - **Vercel zou nu automatisch de webhook moeten aanmaken**

2. **Check GitHub opnieuw**
   - Ga naar: https://github.com/pakketadvies/pakketadvies-website/settings/hooks
   - Er zou nu een webhook moeten staan

### Optie B: Handmatig Webhook Toevoegen

Als Optie A niet werkt, voeg de webhook handmatig toe:

1. **Vind de Vercel Webhook URL**
   - Ga naar Vercel Dashboard → Settings → Git
   - Kijk of er een "Webhook URL" of "View Webhook" link is
   - Als die er niet is, probeer deze URL (vervang `{project-id}` met je project ID):
     ```
     https://api.vercel.com/v1/integrations/deploy/{project-id}
     ```
   - Of gebruik deze algemene Vercel webhook URL:
     ```
     https://api.vercel.com/v1/integrations/deploy
     ```

2. **Voeg Webhook Toe in GitHub**
   - Ga naar: https://github.com/pakketadvies/pakketadvies-website/settings/hooks
   - Klik "Add webhook"
   - **Payload URL:** Plak de Vercel webhook URL
   - **Content type:** `application/json`
   - **Secret:** Laat leeg (of voeg toe als Vercel dat vereist)
   - **Events:** Selecteer "Just the push event"
   - **Active:** ✅ Vink aan
   - Klik "Add webhook"

3. **Test Direct**
   - GitHub test de webhook automatisch
   - Je ziet een groen vinkje als het werkt
   - Check Vercel Dashboard → Deployments voor een nieuwe deployment

## 🧪 Stap 4: Test de Webhook

1. **Maak een Test Commit**
   ```bash
   git commit --allow-empty -m "Test webhook - $(date)"
   git push origin main
   ```

2. **Check Vercel Dashboard**
   - Ga naar Deployments tab
   - Binnen 10-30 seconden zou er een nieuwe deployment moeten verschijnen
   - Als er niets gebeurt → De webhook werkt niet

## 🚨 Veelvoorkomende Problemen

### Probleem 1: Webhook bestaat niet
**Oplossing:** Maak handmatig aan (zie Stap 3)

### Probleem 2: Webhook geeft error
**Check:**
- Ga naar GitHub → Settings → Webhooks → Klik op de webhook
- Klik op "Recent Deliveries"
- Kijk naar de error messages
- Meestal: "404 Not Found" of "401 Unauthorized"

**Oplossing:**
- Check of de webhook URL correct is
- Check of de repository correct is gekoppeld in Vercel
- Probeer de repository opnieuw te connecten

### Probleem 3: Webhook bestaat maar triggert niet
**Check:**
- Is de webhook "Active"? (moet groen vinkje hebben)
- Zijn de events correct? (moet "push" events hebben)
- Check "Recent Deliveries" in GitHub → Settings → Webhooks

**Oplossing:**
- Verwijder de oude webhook
- Maak een nieuwe webhook aan
- Of reconnect de repository in Vercel

### Probleem 4: Branch configuratie
**Check:**
- Vercel Dashboard → Settings → Git
- Is "Production Branch" op `main` gezet?
- Wordt de juiste branch gemonitord?

**Oplossing:**
- Zet "Production Branch" op `main`
- Save de instellingen

## ✅ Snelle Fix (Alles Opnieuw)

Als niets werkt, probeer dit:

1. **Vercel Dashboard → Settings → Git → Disconnect**
2. **Wacht 10 seconden**
3. **Vercel Dashboard → Settings → Git → Connect Git Repository**
4. **Selecteer:** `pakketadvies/pakketadvies-website`
5. **Selecteer branch:** `main`
6. **Klik "Connect"**
7. **Check GitHub:** https://github.com/pakketadvies/pakketadvies-website/settings/hooks
8. **Er zou nu een webhook moeten staan**
9. **Test met:** `git commit --allow-empty -m "Test" && git push origin main`

## 📞 Als Het Nog Steeds Niet Werkt

1. **Check Vercel Logs**
   - Vercel Dashboard → Deployments → Klik op een deployment → Logs
   - Kijk naar errors

2. **Check GitHub Webhook Deliveries**
   - GitHub → Settings → Webhooks → Klik op webhook → Recent Deliveries
   - Kijk naar de response codes (moet 200 zijn)

3. **Contact Vercel Support**
   - Als alles correct lijkt maar het werkt niet, kan het een Vercel-side issue zijn

