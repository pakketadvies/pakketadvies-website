# ⚡ Facebook Pixel - WAT JE NU MOET DOEN

## 🎯 Je Nieuwe Pixel

**Pixel Naam:** PakketAdvies Pixel Nieuwe...  
**Pixel ID:** `1504480990767273`

## 📋 STAP 1: In Events Manager (NU DOEN!)

### Je ziet nu een popup met 2 opties:

**Kies: "Code handmatig installeren"** (eerste optie, blauwe knop)

**Waarom?**
- ✅ De Pixel code is al geïmplementeerd op je website
- ✅ Je hoeft alleen de website URL toe te voegen
- ✅ Je Pixel ID te linken

**Wat gebeurt er dan:**
1. Je voegt je website URL toe: `https://pakketadvies.nl`
2. Facebook detecteert je Pixel code
3. Klaar! Je Pixel is gekoppeld

## 📋 STAP 2: Pixel ID toevoegen aan Vercel ⭐ BELANGRIJKST

### Vercel Environment Variable (PRODUCTION)

1. Ga naar: https://vercel.com/dashboard
2. Selecteer je **PakketAdvies** project
3. Klik op **Settings** (bovenaan)
4. Klik op **Environment Variables** (linker menu)
5. Klik op **Add New**
6. Vul in:
   ```
   Key: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
   Value: 1504480990767273
   ```
7. Vink ALLE drie aan: ✅ Production, ✅ Preview, ✅ Development
8. Klik **Save**
9. **HERDEPLOY**:
   - Ga naar **Deployments** tab
   - Klik op **⋯** (3 dots) bij de laatste deployment
   - Klik **Redeploy**
   - Wacht tot deployment klaar is (~2-3 minuten)

### Lokale Development (Optioneel)

Voeg toe aan `.env.local` (in je project root):

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1504480990767273
```

Herstart je dev server daarna.

## ✅ STAP 3: Testen (Na deployment)

### Test 1: Pixel Helper Extension

1. Installeer: https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc
2. Ga naar: https://pakketadvies.nl
3. Klik op Pixel Helper extensie icon
4. Moet groen zijn met: **Pixel ID: 1504480990767273** ✅

### Test 2: Events Manager - Test Events

1. In Events Manager, ga naar tab: **"Gebeurtenissen testen"**
2. Open je website (`https://pakketadvies.nl`) in een andere browser tab
3. Binnen enkele seconden zie je:
   - **PageView** event verschijnen ✅

### Test 3: InitiateCheckout Event

1. Ga naar: https://pakketadvies.nl/calculator
2. Vul calculator in → bekijk resultaten
3. Klik op **"Aanvragen"** bij een contract
4. In Events Manager → **"Gebeurtenissen testen"** zie je:
   - **InitiateCheckout** event met data! ✅

## ✅ Checklist

- [ ] In Events Manager: Gekozen voor "Code handmatig installeren"
- [ ] Website URL toegevoegd: `https://pakketadvies.nl`
- [ ] Pixel ID `1504480990767273` toegevoegd aan Vercel Environment Variables
- [ ] Alle 3 environments aangevinkt (Production, Preview, Development)
- [ ] Website gedeployed (Redeploy)
- [ ] Pixel Helper extensie toont Pixel actief
- [ ] PageView events zichtbaar in Test Events
- [ ] InitiateCheckout event werkt bij "Aanvragen" klik

**Als alles werkt → Je Pixel is perfect ingesteld! 🎉**

## 🚀 Volgende Stap: Campaign Opzetten

Na testen kun je een campagne opzetten die optimaliseert op **InitiateCheckout** events.

Zie `FACEBOOK_PIXEL_SETUP.md` voor volledige campaign setup instructies.
