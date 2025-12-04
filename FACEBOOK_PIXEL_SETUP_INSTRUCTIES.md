# ✅ Facebook Pixel Setup - Je bent bijna klaar!

## 🎯 Wat je nu ziet

Je ziet een scherm met instructies om de Pixel code handmatig toe te voegen aan je website.

**GOED NIEUWS:** ✅ De Pixel code is **AL** geïmplementeerd op je website!

## ✅ Wat je moet doen

### STAP 1: Klik gewoon op "Doorgaan" (Continue)

Je hoeft de code **NIET** handmatig toe te voegen, want:
- ✅ De Pixel component is al in je codebase (`src/components/tracking/FacebookPixel.tsx`)
- ✅ Het wordt automatisch geladen op alle pagina's
- ✅ Je hoeft alleen de Pixel ID toe te voegen aan environment variables

### STAP 2: Pixel ID toevoegen aan Vercel ⭐ BELANGRIJKST

1. Ga naar: https://vercel.com/dashboard
2. Selecteer je **PakketAdvies** project
3. **Settings** → **Environment Variables**
4. **Add New**:
   ```
   Key: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
   Value: 1504480990767273
   ```
5. Vink ALLE drie aan: ✅ Production, ✅ Preview, ✅ Development
6. **Save**
7. **Redeploy** je website:
   - Ga naar **Deployments** tab
   - Klik **⋯** bij laatste deployment
   - Kies **Redeploy**

### STAP 3: Website URL toevoegen (in Events Manager)

Terug in Events Manager:
- Voeg je website URL toe: `https://pakketadvies.nl`
- Bevestig

### STAP 4: Testen (na deployment)

1. Installeer [Pixel Helper extensie](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Ga naar: `https://pakketadvies.nl`
3. Check Pixel Helper - moet groen zijn met Pixel ID: `1504480990767273`
4. Test in Events Manager → "Gebeurtenissen testen" tab

## 🎯 Samenvatting

**Wat je NIET hoeft te doen:**
- ❌ Code handmatig kopiëren en plakken (al gedaan!)
- ❌ Code toevoegen aan `<head>` tag (al geïmplementeerd!)

**Wat je WEL moet doen:**
- ✅ Klik "Doorgaan" in Events Manager
- ✅ Voeg Pixel ID toe aan Vercel Environment Variables
- ✅ Redeploy website
- ✅ Test de Pixel

## 💡 Waarom werkt dit?

Onze implementatie gebruikt Next.js Script component die exact hetzelfde doet als de code die Facebook geeft, maar dan:
- ✅ Automatisch op alle pagina's
- ✅ Optimized loading
- ✅ Type-safe
- ✅ Makkelijk te onderhouden

De Pixel code die Facebook geeft is identiek aan wat we al hebben - alleen de Pixel ID (`1504480990767273`) wordt via environment variable geconfigureerd, wat beter is voor security en flexibiliteit!

