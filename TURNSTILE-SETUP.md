# 🔒 Cloudflare Turnstile Setup Guide

## Stap 1: Cloudflare Account Aanmaken

1. Ga naar [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Maak een gratis account aan (of log in)
3. Cloudflare Turnstile is **100% gratis** en onbeperkt

## Stap 2: Turnstile Site Aanmaken

1. In het Cloudflare Dashboard, ga naar **"Turnstile"** in het menu
2. Klik op **"Add Site"**
3. Vul in:
   - **Site Name**: `PakketAdvies Website`
   - **Domain**: `pakketadvies.nl` (en eventueel `www.pakketadvies.nl`)
   - **Widget Mode**: Kies **"Managed"** (aanbevolen) of **"Non-interactive"**
     - **Managed**: Automatisch detecteert of challenge nodig is (aanbevolen)
     - **Non-interactive**: Altijd invisible, geen challenge
4. Klik op **"Create"**

## Stap 3: Site Key en Secret Key Ophalen

Na het aanmaken krijg je:
- **Site Key** (publiek, kan in frontend)
- **Secret Key** (privé, alleen in backend/API)

## Stap 4: Environment Variables Toevoegen aan Vercel

1. Ga naar je Vercel project dashboard
2. Ga naar **Settings** → **Environment Variables**
3. Voeg de volgende variabelen toe:

### Voor Production:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x00000000000000000000AA  (jouw site key)
CLOUDFLARE_TURNSTILE_SECRET_KEY=0x0000000000000000000000000000000000AA  (jouw secret key)
```

### Voor Development (optioneel):
Je kunt dezelfde keys gebruiken, of aparte keys aanmaken voor development.

## Stap 5: Testen

1. Deploy de website naar Vercel
2. Test het aanmeldformulier:
   - Turnstile widget zou automatisch moeten laden
   - Bij form submit wordt de token meegestuurd
   - Server-side validatie controleert de token

## Troubleshooting

### Widget laadt niet
- Check of `NEXT_PUBLIC_TURNSTILE_SITE_KEY` correct is ingesteld
- Check browser console voor errors
- Zorg dat de domain in Cloudflare Turnstile overeenkomt met je website domain

### Validatie mislukt
- Check of `CLOUDFLARE_TURNSTILE_SECRET_KEY` correct is ingesteld
- Check Vercel logs voor error messages
- Zorg dat de secret key overeenkomt met de site key

### Widget is zichtbaar (moet invisible zijn)
- Check of `size="normal"` is ingesteld (dit is correct)
- Managed mode toont soms een challenge als verdacht gedrag wordt gedetecteerd
- Dit is normaal en betekent dat Turnstile werkt

## Privacy & Compliance

✅ **Geen tracking**: Turnstile verzamelt geen persoonlijke data  
✅ **Geen cookies**: Geen cookies nodig  
✅ **GDPR-compliant**: Voldoet automatisch aan GDPR  
✅ **ACM-compliant**: Redelijke beveiligingsmaatregel voor formulierbescherming  

## Support

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Cloudflare Community](https://community.cloudflare.com/)

