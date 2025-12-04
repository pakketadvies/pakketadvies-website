# 📊 Facebook Pixel Integratie - Setup Instructies

## ✅ Wat is geïmplementeerd

1. **Facebook Pixel Component** - Automatisch geladen op alle pagina's
2. **Event Tracking** - InitiateCheckout event wordt getracked wanneer iemand op "Aanvragen" klikt
3. **PageView Tracking** - Automatisch getracked bij elke pagina wijziging
4. **Custom Event Support** - Klaar voor uitbreiding met extra events

## 🔧 Setup Stappen

### 1. Facebook Pixel ID ophalen

1. Ga naar [Meta Business Suite](https://business.facebook.com/)
2. Selecteer je Business Account
3. Ga naar **Events Manager** (linkermenu)
4. Klik op **Data Sources** → **Pixels**
5. Als je nog geen Pixel hebt:
   - Klik op **"Connect Data Sources"**
   - Selecteer **"Web"**
   - Kies **"Facebook Pixel"**
   - Volg de setup wizard
6. Kopieer je **Pixel ID** (een nummer zoals: `123456789012345`)

### 2. Environment Variable toevoegen

Voeg de Pixel ID toe aan je `.env.local` bestand:

```bash
# Facebook Pixel ID
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345
```

**Voor Vercel (Production):**
1. Ga naar je Vercel project dashboard
2. Ga naar **Settings** → **Environment Variables**
3. Voeg toe:
   - **Key**: `NEXT_PUBLIC_FACEBOOK_PIXEL_ID`
   - **Value**: Je Pixel ID (bijv. `123456789012345`)
   - **Environment**: Production, Preview, Development (alle drie aanvinken)
4. Klik **Save**
5. **Herdeploy** je website (ga naar Deployments → kies de laatste → kies "Redeploy")

### 3. Testen

#### Test in Browser Console

Open je website en open de browser console (F12). Type:

```javascript
fbq('track', 'PageView')
```

Als dit werkt zonder errors, is de Pixel correct geïnstalleerd!

#### Test Event Tracking

1. Ga naar `/calculator/resultaten` pagina
2. Klik op een "Aanvragen" knop
3. In de browser console zou je moeten zien dat het InitiateCheckout event wordt getracked

#### Test in Events Manager

1. Ga naar Meta Events Manager
2. Klik op je Pixel
3. Ga naar **Test Events** tab
4. Open je website in een andere tab
5. Klik op "Aanvragen" op een contract
6. Je zou het **InitiateCheckout** event moeten zien verschijnen binnen enkele seconden

## 📈 Events die worden getracked

### Automatisch

- **PageView** - Bij elke pagina wijziging (automatisch)

### Bij "Aanvragen" klik

- **InitiateCheckout** - Wanneer iemand op "Aanvragen" klikt op de resultaten pagina

**Event Data:**
```javascript
{
  content_name: "Leverancier naam",
  content_category: "Energiecontract",
  value: 1234.56, // Totaal jaarprijs in EUR
  currency: "EUR",
  contract_id: "contract-123",
  contract_type: "vast" | "dynamisch" | "maatwerk"
}
```

## 🎯 Meta Campaign Optimalisatie

### Setup Campaign voor "Aanvragen" Clicks

1. Ga naar **Meta Ads Manager**
2. Klik op **"Create"** → **"Campaign"**
3. Kies je doelstelling:
   - **Conversions** (aanbevolen)
   - Of **Traffic** als je eerst meer data wilt verzamelen
4. Bij **"Optimization & Delivery"**:
   - Selecteer **"Optimize for"**: **Conversions**
   - Bij **"Conversion Event"**: Selecteer **"InitiateCheckout"**
5. Bij **"Attribution Setting"**:
   - Kies **"7-day click, 1-day view"** (aanbevolen)
6. Setup je ad sets en ads zoals normaal

### Belangrijk voor Optimalisatie

- **Minimum 50 events per week** nodig voor goede optimalisatie
- Start met **Traffic** campagnes als je nog weinig data hebt
- Gebruik **Automatic Placements** voor beste resultaten
- Test verschillende **Audiences** en **Ad Creatives**

## 🔍 Verificatie

### Check of Pixel werkt

1. Installeer [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extensie
2. Ga naar je website
3. De extensie zou moeten aangeven dat de Pixel actief is
4. Klik op "Aanvragen" - je zou het InitiateCheckout event moeten zien

### Check Events in Events Manager

1. Ga naar **Events Manager**
2. Selecteer je Pixel
3. Ga naar **Test Events** voor real-time testing
4. Ga naar **Events** voor historische data (na 24-48 uur)

## 📝 Code Locaties

- **Pixel Component**: `src/components/tracking/FacebookPixel.tsx`
- **Event Tracking Hook**: `src/lib/tracking/useFacebookPixel.ts`
- **InitiateCheckout Event**: `src/components/calculator/ContractCard.tsx` (regel 846-853)
- **Root Layout**: `src/app/layout.tsx` (regel 78-79)

## 🚀 Volgende Stappen

1. ✅ Voeg Pixel ID toe aan environment variables
2. ✅ Test de Pixel installatie
3. ✅ Test het InitiateCheckout event
4. ✅ Setup je eerste campagne in Meta Ads Manager
5. ✅ Monitor de events in Events Manager

## ❓ Troubleshooting

### Pixel laadt niet

- Check of `NEXT_PUBLIC_FACEBOOK_PIXEL_ID` correct is ingesteld
- Check browser console voor errors
- Check of de Pixel ID correct is (alleen cijfers)
- Clear browser cache en reload

### Events worden niet getracked

- Check browser console voor errors
- Check Facebook Pixel Helper extensie
- Wacht 24-48 uur voor events in Events Manager (Test Events is real-time)
- Check of ad blockers de Pixel blokkeren

### Events verschijnen niet in Ads Manager

- Events kunnen 24-48 uur duren voordat ze verschijnen in rapporten
- Gebruik **Test Events** in Events Manager voor real-time verificatie
- Check of je de juiste Pixel hebt geselecteerd in je campaign

## 📞 Support

Voor vragen over Facebook Pixel:
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [Pixel Setup Guide](https://www.facebook.com/business/help/952192354843755)

