# 🔍 reCAPTCHA v3 Troubleshooting - 401 Unauthorized Error

## Probleem
```
POST https://www.google.com/recaptcha/api2/pat?k=6LerHjssAAAAABtUgf9fQKvMHsnlRnomZ-rY27RM 401 (Unauthorized)
Unrecognized feature: 'private-token'
```

## Mogelijke Oorzaken

### 1. ⚠️ **Domein niet toegevoegd aan reCAPTCHA Console** (MEEST WAARSCHIJNLIJK)

Google reCAPTCHA blokkeert requests van domeinen die niet expliciet zijn toegevoegd aan de site key configuratie.

**Oplossing:**
1. Ga naar [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/)
2. Selecteer je site key: `6LerHjssAAAAABtUgf9fQKvMHsnlRnomZ-rY27RM`
3. Klik op **Settings** (Instellingen)
4. Controleer **Domains** (Domeinen)
5. Voeg toe:
   - `pakketadvies.nl`
   - `www.pakketadvies.nl`
   - `*.vercel.app` (voor Vercel preview deployments)
   - `localhost` (als je lokaal test)
   - `127.0.0.1` (als je lokaal test)
6. **Save** (Opslaan)
7. Wacht 5-10 minuten voor propagatie
8. Test opnieuw

### 2. ⚠️ **Verkeerde reCAPTCHA Versie**

De site key moet voor **reCAPTCHA v3** zijn, niet v2.

**Check:**
1. Ga naar [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/)
2. Selecteer je site key
3. Check **reCAPTCHA type**: Moet **"reCAPTCHA v3"** zijn
4. Als het v2 is, maak een nieuwe v3 site key aan

### 3. ⚠️ **Site Key is Ongeldig of Verwijderd**

**Check:**
1. Ga naar [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/)
2. Check of de site key `6LerHjssAAAAABtUgf9fQKvMHsnlRnomZ-rY27RM` nog bestaat
3. Als niet, maak een nieuwe aan

### 4. ⚠️ **Vercel Preview URL niet toegevoegd**

Als je test op een Vercel preview URL (bijv. `pakketadvies-abc123.vercel.app`), moet je:
- `*.vercel.app` toevoegen als wildcard domain
- OF de specifieke preview URL toevoegen

### 5. ⚠️ **HTTPS vs HTTP**

reCAPTCHA werkt alleen op HTTPS (behalve localhost).

**Check:**
- Zorg dat je site op HTTPS draait
- Als je lokaal test, gebruik `https://localhost:3000` (met SSL) of voeg `localhost` toe aan domains

## Stap-voor-stap Fix

### Stap 1: Check reCAPTCHA Console
1. Ga naar: https://www.google.com/recaptcha/admin/
2. Login met je Google account
3. Zoek site key: `6LerHjssAAAAABtUgf9fQKvMHsnlRnomZ-rY27RM`

### Stap 2: Check Domeinen
In de site key settings, check **Domains**:
- ✅ `pakketadvies.nl` moet erin staan
- ✅ `www.pakketadvies.nl` moet erin staan
- ✅ `*.vercel.app` moet erin staan (voor previews)

### Stap 3: Check reCAPTCHA Type
- Moet **"reCAPTCHA v3"** zijn
- NIET "reCAPTCHA v2" of "Invisible reCAPTCHA"

### Stap 4: Update Vercel Environment Variables
Als je een nieuwe site key hebt gemaakt:
1. Ga naar Vercel Dashboard
2. Project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
4. Update `RECAPTCHA_SECRET_KEY`
5. Redeploy

### Stap 5: Test
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
3. Test formulier submit
4. Check browser console voor errors

## Debugging in Code

Als je wilt debuggen, voeg deze logging toe:

```typescript
// In executeReCaptcha function
console.log('[reCAPTCHA] Site key:', siteKey)
console.log('[reCAPTCHA] Current domain:', window.location.hostname)
console.log('[reCAPTCHA] grecaptcha available:', !!window.grecaptcha)
```

## Quick Test

Test of reCAPTCHA werkt door deze URL te bezoeken:
```
https://www.google.com/recaptcha/api.js?render=6LerHjssAAAAABtUgf9fQKvMHsnlRnomZ-rY27RM
```

Als je een 401 krijgt, is het domein niet toegevoegd.

## Meest Waarschijnlijke Oplossing

**99% van de gevallen**: Het domein is niet toegevoegd aan de reCAPTCHA console.

**Fix:**
1. Ga naar reCAPTCHA Admin Console
2. Voeg `pakketadvies.nl`, `www.pakketadvies.nl`, en `*.vercel.app` toe
3. Wacht 5-10 minuten
4. Test opnieuw

## Contact

Als het probleem aanhoudt na deze stappen:
1. Check reCAPTCHA console voor error messages
2. Check Vercel logs voor server-side errors
3. Check browser console voor client-side errors

