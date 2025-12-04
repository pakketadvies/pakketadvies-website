# ✅ Facebook Pixel Setup - Complete Handleiding

## 🎯 Je Nieuwe Pixel

**Pixel Naam:** PakketAdvies Pixel Nieuwe...  
**Pixel ID:** `1504480990767273`

## 📋 Stap-voor-stap Setup (5 minuten)

### STAP 1: Pixel ID toevoegen aan Vercel ⭐ BELANGRIJKST

1. Ga naar: https://vercel.com/dashboard
2. Selecteer je **PakketAdvies** project
3. Klik op **Settings** (bovenaan de pagina)
4. Klik op **Environment Variables** (linker menu)
5. Klik op **Add New** (of edit bestaande als die er is)
6. Vul in:
   ```
   Key: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
   Value: 1504480990767273
   ```
7. **BELANGRIJK**: Vink ALLE drie aan:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
8. Klik **Save**
9. **HERDEPLOY** je website:
   - Ga naar **Deployments** tab
   - Klik op de **⋯** (3 dots) bij de laatste deployment
   - Klik **Redeploy**
   - Wacht tot deployment klaar is (~2-3 minuten)

### STAP 2: Website URL toevoegen aan Pixel

In Events Manager (waar je nu bent):

1. Klik op **"Meta-pixel instellen"** knop (onder "Websitegebeurtenissen verzamelen")
2. Kies: **"Handmatig de pixelcode toevoegen"** (we hebben code al geïmplementeerd)
3. Voeg je website URL toe: `https://pakketadvies.nl`
4. Bevestig

### STAP 3: Testen (Na deployment)

#### Test 1: Pixel Helper Extension

1. Installeer: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
2. Ga naar: `https://pakketadvies.nl`
3. Klik op Pixel Helper extensie icon
4. Moet groen zijn met: **Pixel ID: 1504480990767273** ✅

#### Test 2: Events Manager - Test Events

1. In Events Manager, klik op tab: **"Gebeurtenissen testen"**
2. Open je website (`https://pakketadvies.nl`) in een andere browser tab
3. Binnen enkele seconden zie je:
   - **PageView** event verschijnen ✅

#### Test 3: InitiateCheckout Event

1. Ga naar: `https://pakketadvies.nl/calculator`
2. Vul calculator in → bekijk resultaten
3. Klik op **"Aanvragen"** bij een contract
4. In Events Manager → **"Gebeurtenissen testen"** zie je:
   - **InitiateCheckout** event met data! ✅

## ✅ Checklist

- [ ] Pixel ID `1504480990767273` toegevoegd aan Vercel Environment Variables
- [ ] Alle 3 environments aangevinkt (Production, Preview, Development)
- [ ] Website gedeployed (Redeploy)
- [ ] Website URL toegevoegd aan Pixel instellingen
- [ ] Pixel Helper extensie toont Pixel actief
- [ ] PageView events zichtbaar in Test Events
- [ ] InitiateCheckout event werkt bij "Aanvragen" klik

## 🎯 Volgende Stappen

Zodra alles werkt:

1. **Campaign opzetten** in Meta Ads Manager
2. **Optimaliseren op InitiateCheckout** events
3. **Monitor** in Events Manager

## 🚨 Troubleshooting

### Pixel laadt niet
- Check Vercel Environment Variable is correct
- Check website is gedeployed na toevoegen variable
- Clear browser cache

### Events niet zichtbaar
- Check Test Events tab (real-time)
- Wacht max 30 minuten voor Overview tab
- Check Pixel Helper extensie status

