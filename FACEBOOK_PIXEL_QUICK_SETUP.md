# 🚀 Facebook Pixel - Snelle Setup Handleiding

## 📋 Wat je nu hebt

- ✅ Pixel aangemaakt: **Pixel voor PakketAdvies**
- ✅ Pixel ID: `1160227928919853` (zie je in de Events Manager)
- ✅ Code is al geïmplementeerd op je website

## 🔧 STAP 1: Pixel ID toevoegen (NU DOEN!)

### Voor Lokale Development:

1. Open het bestand `.env.local` in je project root (maak het aan als het niet bestaat)
2. Voeg deze regel toe:

```bash
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=1160227928919853
```

3. Herstart je development server (stop en start `npm run dev` opnieuw)

### Voor Production (Vercel):

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je **PakketAdvies** project
3. Ga naar **Settings** → **Environment Variables**
4. Klik op **Add New**
5. Vul in:
   - **Key**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
   - **Value**: `1160227928919853`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development (alle drie!)
6. Klik **Save**
7. **Herdeploy** je website:
   - Ga naar **Deployments** tab
   - Klik op de 3 dots (⋯) van de laatste deployment
   - Kies **Redeploy**
   - Bevestig

## ✅ STAP 2: Testen (Direct na deployment)

### Test 1: Pixel Helper Extension

1. Installeer [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extensie
2. Ga naar je website: `https://pakketadvies.nl`
3. Klik op de Pixel Helper extensie icon
4. Je zou moeten zien:
   - ✅ "Facebook Pixel ID: 1160227928919853"
   - ✅ "PageView" event fired

### Test 2: Events Manager - Test Events

1. Ga terug naar je [Events Manager](https://business.facebook.com/events_manager2)
2. Klik op je Pixel: **"Pixel voor PakketAdvies"**
3. Ga naar de tab **"Gebeurtenissen testen"** (Test Events)
4. Open je website (`https://pakketadvies.nl`) in een **andere browser tab**
5. Je zou binnen enkele seconden moeten zien:
   - **PageView** event verschijnt

### Test 3: InitiateCheckout Event

1. Ga naar: `https://pakketadvies.nl/calculator`
2. Vul de calculator in en bekijk resultaten
3. Klik op **"Aanvragen"** bij een contract
4. In Events Manager → **"Gebeurtenissen testen"** zou je nu moeten zien:
   - **InitiateCheckout** event met alle data!

## 🎯 STAP 3: Over de Conversions API Popup

Je ziet een popup over **"Conversions API Gateway instellen via Stape"**.

**Wat betekent dit?**
- Dit is een **extra** server-side tracking methode
- Werkt **naast** je Pixel (niet in plaats van)
- Geeft betere tracking data en privacy compliance
- **Optioneel** voor nu - je Pixel werkt al!

**Moet je dit nu doen?**
- **Nee, niet per se!** Je client-side Pixel werkt prima
- Je kunt later altijd nog Conversions API toevoegen
- Klik op **"Terug"** of sluit de popup voor nu

**Wanneer wel doen?**
- Als je meer accurate tracking wilt
- Als je privacy compliance belangrijk vindt (GDPR)
- Als je betere data matching wilt

## 📊 STAP 4: Campaign Setup (Na testing)

### Eerste Test Campaign:

1. Ga naar [Meta Ads Manager](https://business.facebook.com/adsmanager)
2. Klik **"Create"** → **"Campaign"**
3. Kies doelstelling: **"Traffic"** (voor eerste test) of **"Conversions"** (als je al data hebt)
4. Bij **"Optimization & Delivery"**:
   - **Optimize for**: Kies **"Conversions"**
   - **Conversion Event**: Selecteer **"InitiateCheckout"**
5. Setup je ad sets en ads
6. **Belangrijk**: Zorg dat je Pixel is geselecteerd in de ad set settings

### Minimum Requirements:

- **50 InitiateCheckout events per week** voor goede optimalisatie
- Start met klein budget om data te verzamelen
- Test verschillende audiences en creatives

## 🔍 Verificatie Checklist

- [ ] Pixel ID toegevoegd aan `.env.local` (lokaal)
- [ ] Pixel ID toegevoegd aan Vercel Environment Variables
- [ ] Website gedeployed op Vercel
- [ ] Pixel Helper extensie toont Pixel actief
- [ ] PageView events zichtbaar in Test Events
- [ ] InitiateCheckout event werkt bij "Aanvragen" klik

## 🚨 Problemen Oplossen

### Pixel laadt niet

**Check:**
1. Is `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` correct in Vercel?
2. Heb je de website opnieuw gedeployed na toevoegen van de variable?
3. Check browser console (F12) voor errors
4. Clear browser cache (Ctrl+Shift+Delete)

### Events worden niet getracked

**Check:**
1. Is de Pixel Helper extensie groen? (niet rood/oranje)
2. Check Test Events tab in Events Manager (real-time)
3. Zorg dat je website URL correct is ingesteld in Events Manager
4. Check of ad blockers de Pixel blokkeren

### Events verschijnen niet in Ads Manager

**Normaal!** Events kunnen 24-48 uur duren voordat ze in Ads Manager verschijnen. Gebruik **Test Events** voor real-time verificatie.

## 📱 Volgende Stappen

1. ✅ **Nu**: Pixel ID toevoegen en testen
2. ✅ **Vandaag**: Test Events verifiëren
3. ✅ **Deze week**: Eerste test campaign opzetten
4. ⏭️ **Later**: Optioneel Conversions API toevoegen voor betere tracking

## 💡 Tip

Start met een kleine test campaign (€10-20) om data te verzamelen voordat je grote budgets gaat uitgeven. Meta heeft tijd nodig om te leren welke mensen het meest waarschijnlijk op "Aanvragen" klikken.

