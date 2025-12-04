# ⚡ Facebook Pixel - WAT JE NU MOET DOEN

## 🎯 Quick Start (5 minuten)

Je Pixel ID: **`1160227928919853`**

### STAP 1: Vercel Environment Variable (PRODUCTION) ⭐ BELANGRIJKST

1. Ga naar: https://vercel.com/dashboard
2. Selecteer je **PakketAdvies** project
3. Klik op **Settings** (bovenaan)
4. Klik op **Environment Variables** (linker menu)
5. Klik op **Add New**
6. Vul in:
   ```
   Key: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
   Value: 1160227928919853
   ```
7. Vink ALLE drie aan: ✅ Production, ✅ Preview, ✅ Development
8. Klik **Save**
9. **HERDEPLOY**:
   - Ga naar **Deployments** tab
   - Klik op **⋯** (3 dots) bij de laatste deployment
   - Klik **Redeploy**
   - Wacht tot deployment klaar is

### STAP 2: Lokale Development (Optioneel)

Voeg toe aan `.env.local` (in je project root):

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1160227928919853
```

Herstart je dev server daarna.

### STAP 3: Testen (Na deployment)

1. **Installeer Pixel Helper**: 
   https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc

2. **Test je website**:
   - Ga naar: https://pakketadvies.nl
   - Klik op Pixel Helper extensie
   - Moet groen zijn met Pixel ID: 1160227928919853

3. **Test in Events Manager**:
   - Ga naar: https://business.facebook.com/events_manager2
   - Klik op je Pixel
   - Tab: **"Gebeurtenissen testen"**
   - Open je website in andere tab → zie PageView event!

4. **Test InitiateCheckout**:
   - Ga naar: https://pakketadvies.nl/calculator
   - Vul calculator in → bekijk resultaten
   - Klik **"Aanvragen"** op een contract
   - Zie InitiateCheckout event in Test Events!

## ❓ Over die Conversions API Popup

**Wat is het?**
- Extra server-side tracking (naast client-side Pixel)
- Geeft betere data accuracy en privacy compliance

**Moet ik het nu doen?**
- **NEE!** Je Pixel werkt prima zoals het is
- Klik gewoon **"Terug"** of sluit de popup
- Later kun je altijd nog Conversions API toevoegen

**Waarom doet Facebook dit voor?**
- Ze willen dat iedereen de beste tracking setup heeft
- Het is optioneel - niet verplicht!

## ✅ Checklist

- [ ] Pixel ID toegevoegd aan Vercel Environment Variables
- [ ] Website gedeployed (Redeploy)
- [ ] Pixel Helper extensie toont Pixel actief
- [ ] PageView events zichtbaar in Test Events
- [ ] InitiateCheckout event werkt bij "Aanvragen" klik

**Als alles werkt → Je Pixel is perfect ingesteld! 🎉**

## 🚀 Volgende Stap: Campaign Opzetten

Na testen kun je een campagne opzetten die optimaliseert op **InitiateCheckout** events.

Zie `FACEBOOK_PIXEL_SETUP.md` voor volledige campaign setup instructies.

