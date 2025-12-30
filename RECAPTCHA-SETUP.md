# Google reCAPTCHA v3 Setup Instructies

De website is nu voorbereid voor Google reCAPTCHA v3 implementatie. Volg deze stappen om reCAPTCHA volledig te activeren:

## 1. Registreer je website bij Google reCAPTCHA

1. Ga naar [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Klik op **"+ Create"** om een nieuwe site toe te voegen
3. Vul de volgende gegevens in:
   - **Label**: PakketAdvies.nl (of een andere herkenbare naam)
   - **reCAPTCHA type**: Selecteer **"reCAPTCHA v3"**
   - **Domains**: Voeg de volgende domeinen toe:
     - `pakketadvies.nl`
     - `www.pakketadvies.nl`
     - `*.vercel.app` (voor staging/preview deployments)
   - **Owners**: Voeg je Google account toe
4. Accepteer de reCAPTCHA Terms of Service
5. Klik op **"Submit"**

## 2. Verkrijg je Site Key en Secret Key

Na het aanmaken van de site krijg je twee keys:
- **Site Key** (publiek, kan in frontend code): `6Lc...` (begint met `6L`)
- **Secret Key** (privé, alleen server-side): `6Lc...` (begint met `6L`)

## 3. Voeg environment variables toe aan Vercel

1. Ga naar je Vercel project dashboard
2. Navigeer naar **Settings** → **Environment Variables**
3. Voeg de volgende variabelen toe:

### Voor Production:
- **Name**: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- **Value**: Je Site Key (bijv. `6Lc...`)
- **Environment**: Production, Preview, Development

- **Name**: `RECAPTCHA_SECRET_KEY`
- **Value**: Je Secret Key (bijv. `6Lc...`)
- **Environment**: Production, Preview, Development

### Voor Local Development:
Voeg dezelfde variabelen toe aan je `.env.local` bestand:

```env
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

## 4. Test de implementatie

1. **Lokaal testen**:
   ```bash
   npm run dev
   ```
   - Ga naar een aanmeldformulier (zakelijk of particulier)
   - Vul het formulier in en klik op "Aanmelden"
   - Open de browser console en controleer of er geen reCAPTCHA errors zijn
   - Controleer of de aanvraag succesvol wordt doorgestuurd

2. **Production testen**:
   - Na deployment naar Vercel, test het formulier op de live site
   - Controleer of reCAPTCHA werkt zonder zichtbare UI (invisible reCAPTCHA)
   - Test met een verdachte request (bijv. snel achter elkaar indienen) om te zien of reCAPTCHA bots blokkeert

## 5. Monitoring en optimalisatie

### Score threshold
De huidige implementatie gebruikt een score threshold van **0.5** (aanbevolen door Google):
- **Score 0.0 - 0.5**: Waarschijnlijk een bot → Request wordt geblokkeerd
- **Score 0.5 - 1.0**: Waarschijnlijk een mens → Request wordt toegestaan

Je kunt deze threshold aanpassen in `/src/app/api/aanvragen/create/route.ts` (regel ~60):
```typescript
if (score < 0.5) { // Pas deze waarde aan indien nodig
```

### Graceful degradation
Als reCAPTCHA niet geconfigureerd is of faalt, wordt de request **toegestaan** (graceful degradation). Dit voorkomt dat legitieme gebruikers worden geblokkeerd als reCAPTCHA tijdelijk niet beschikbaar is.

## 6. Privacy overwegingen

reCAPTCHA v3 verzamelt gebruikersdata (IP-adres, browserinfo, muisbewegingen, etc.). Zorg ervoor dat:

1. **Privacybeleid**: Update je privacybeleid om te vermelden dat je Google reCAPTCHA gebruikt
2. **Cookie consent**: Overweeg om reCAPTCHA alleen te laden na marketing cookie consent (optioneel)
3. **GDPR compliance**: Zorg dat je voldoet aan GDPR-vereisten voor dataverzameling

## 7. Troubleshooting

### reCAPTCHA werkt niet
- Controleer of beide environment variables correct zijn ingesteld
- Controleer of de domain whitelist in Google reCAPTCHA console correct is
- Controleer de browser console voor errors
- Controleer de server logs voor reCAPTCHA verificatie errors

### "reCAPTCHA verification failed"
- Controleer of de Secret Key correct is
- Controleer of de Site Key en Secret Key bij elkaar horen (van dezelfde site)
- Controleer of de domain whitelist de juiste domains bevat

### Requests worden geblokkeerd voor legitieme gebruikers
- Verlaag de score threshold (bijv. van 0.5 naar 0.3)
- Controleer of er geen andere factoren zijn die de score beïnvloeden (VPN, ad blockers, etc.)

## 8. Security badges

De security badges ("Secure GlobalSign", "Beveiligd met reCAPTCHA") worden nu alleen getoond wanneer reCAPTCHA actief is. Als reCAPTCHA niet geconfigureerd is, worden deze badges niet getoond.

---

**Let op**: Zonder de environment variables werkt de website nog steeds, maar reCAPTCHA validatie wordt overgeslagen (graceful degradation). Voor productie is het sterk aanbevolen om reCAPTCHA volledig te configureren.

