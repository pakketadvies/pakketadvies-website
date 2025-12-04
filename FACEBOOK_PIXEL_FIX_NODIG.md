# ⚠️ Pixel niet gevonden - Fix Instructies

## 🔍 Probleem

De Pixel Helper zegt: **"No pixel found on pakketadvies.nl"**

Dit betekent dat de environment variable `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` niet beschikbaar is in production.

## ✅ OPLOSSING: Environment Variable toevoegen via Vercel Dashboard

### STAP 1: Ga naar Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Log in met je account
3. Zoek je project: **"pakketadvies-website"** (of de naam van je project)

### STAP 2: Voeg Environment Variable toe

1. Klik op je project
2. Klik op **"Settings"** (bovenaan)
3. Klik op **"Environment Variables"** (linker menu)
4. Scroll naar beneden en klik op **"Add New"**

5. Vul in:
   ```
   Key: NEXT_PUBLIC_FACEBOOK_PIXEL_ID
   Value: 1504480990767273
   ```

6. **BELANGRIJK**: Vink ALLE drie aan:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. Klik **"Save"**

### STAP 3: HERDEPLOY je website

1. Ga naar de **"Deployments"** tab (bovenaan)
2. Klik op de **⋯** (3 dots) bij de **laatste deployment**
3. Klik op **"Redeploy"**
4. Bevestig
5. **Wacht 2-3 minuten** tot deployment klaar is

### STAP 4: Test opnieuw

1. Ga naar `https://pakketadvies.nl`
2. Refresh de pagina (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
3. Open Pixel Helper extensie
4. Je zou nu moeten zien: **Pixel ID: 1504480990767273** ✅

## 🔍 Als het nog steeds niet werkt

### Check 1: Cache legen
- Hard refresh: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)
- Of gebruik incognito/private mode

### Check 2: Ad blockers uitschakelen
- Sommige ad blockers blokkeren de Pixel
- Probeer in incognito mode

### Check 3: Browser Console Check
1. Open browser console (F12)
2. Type: `window.fbq`
3. Als je een functie ziet = Pixel is geladen
4. Als je `undefined` ziet = Pixel is niet geladen

## 📝 Wat is het probleem?

De environment variable is waarschijnlijk **niet** toegevoegd aan Vercel Production, of er is geen nieuwe deployment gedaan na het toevoegen.

**Oplossing:** Toevoegen via dashboard + redeploy = werkt!

