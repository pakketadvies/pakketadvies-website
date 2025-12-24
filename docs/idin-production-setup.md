# iDIN Productie Setup - Volledige Implementatie

## Overzicht

De iDIN flow bestaat uit twee delen:
1. **iDIN identificatie** (via Signicat) - verifieert de identiteit van de gebruiker
2. **Energiedata ophalen** (via EDSN of andere provider) - haalt het daadwerkelijke verbruik op

## Stap 1: Signicat Sandbox → Productie

### Huidige situatie
Je gebruikt waarschijnlijk de Signicat sandbox/test omgeving. Om naar productie te gaan:

1. **Log in op Signicat Dashboard**
   - Ga naar https://dashboard.signicat.com
   - Zorg dat je een productie account hebt (niet alleen test/sandbox)

2. **Maak een nieuwe Application aan (of gebruik bestaande)**
   - Ga naar "Applications" → "New Application"
   - Kies "OIDC" als protocol
   - Configureer:
     - **Name**: PakketAdvies iDIN
     - **Redirect URIs**: `https://pakketadvies.nl/api/idin/callback`
     - **Scopes**: `openid profile email`
     - **Environment**: **Production** (niet Sandbox!)

3. **Noteer de credentials**
   - **Client ID**: (van je productie application)
   - **Client Secret**: (van je productie application)
   - **Issuer URL**: Meestal `https://api.signicat.com/auth/open` (voor productie)
   - **Discovery URL**: `https://api.signicat.com/auth/open/.well-known/openid-configuration`

4. **Configureer eID Hub**
   - In Signicat Dashboard: ga naar "eID Hub"
   - Zorg dat **iDIN** is ingeschakeld voor je productie environment
   - Optioneel: schakel andere eID's uit om direct naar iDIN te gaan

### Environment Variables aanpassen

Update je `.env.local` of Vercel environment variables:

```bash
# iDIN Configuration (PRODUCTIE)
IDIN_ENABLED=true
IDIN_PROVIDER=signicat
IDIN_CLIENT_ID=<jouw-productie-client-id>
IDIN_CLIENT_SECRET=<jouw-productie-client-secret>
IDIN_REDIRECT_URI=https://pakketadvies.nl/api/idin/callback

# Signicat Productie URLs
IDIN_DISCOVERY_URL=https://api.signicat.com/auth/open/.well-known/openid-configuration
# OF gebruik:
IDIN_ISSUER_URL=https://api.signicat.com/auth/open

# Scopes (standaard is meestal voldoende)
IDIN_SCOPES="openid profile email"

# Client-side toggle (zet op true als server-side klaar is)
NEXT_PUBLIC_IDIN_ENABLED=true
```

## Stap 2: Energiedata Provider - EDSN

iDIN verifieert alleen de identiteit. Voor het ophalen van verbruik heb je een aparte energiedata provider nodig.

### Opties in Nederland:

1. **EDSN (Energie Data Services Nederland)** - Aanbevolen
   - Officiële dienst voor het ophalen van energiedata
   - Vereist contract en API credentials
   - Website: https://www.edsn.nl
   - Contact: sales@edsn.nl

2. **Meterbeheer API**
   - Testomgeving beschikbaar
   - Website: https://www.meterbeheer.nl/api_koppeling/
   - Vereist registratie

3. **Direct via netbeheerder APIs**
   - Elke netbeheerder heeft eigen API
   - Complexer omdat je meerdere APIs moet ondersteunen

### EDSN Implementatie (Aanbevolen)

1. **Contact opnemen met EDSN**
   - Vraag om API toegang
   - Vraag om test credentials
   - Vraag om documentatie

2. **EDSN API Flow**
   - Na iDIN verificatie heb je:
     - Gebruikers BSN (uit ID token)
     - Adresgegevens (uit ID token of apart opgevraagd)
   - Met deze gegevens kun je via EDSN API:
     - EAN codes opvragen (elektriciteit + gas)
     - Verbruiksdata ophalen (jaarverbruik, maandverbruik)
     - Huidige leverancier opvragen
     - Contract einddatum opvragen

3. **EDSN API Endpoints** (voorbeeld - check EDSN documentatie)
   ```
   POST /api/v1/consumption/request
   GET /api/v1/consumption/{requestId}/status
   GET /api/v1/consumption/{requestId}/data
   ```

## Stap 3: Code Implementatie

De callback route moet worden uitgebreid om:
1. ID token te verifiëren (al geïmplementeerd)
2. Gebruikersgegevens uit ID token te halen (BSN, naam, adres)
3. EDSN API aan te roepen om verbruik op te halen
4. Verbruiksdata te parseren en op te slaan
5. Gebruiker door te sturen naar resultaten pagina met ingevulde data

## Stap 4: Testen

1. **Test met productie Signicat**
   - Gebruik een echte bank account
   - Test de volledige flow

2. **Test met EDSN test omgeving**
   - Gebruik test credentials
   - Verifieer dat verbruiksdata correct wordt opgehaald

3. **Productie test**
   - Test met echte gebruikers (kleine groep)
   - Monitor errors en logs

## Belangrijke Notities

- **Sandbox vs Productie**: Zorg dat je altijd de juiste environment variables gebruikt
- **Privacy**: BSN en andere gevoelige data moet veilig worden opgeslagen en verwerkt
- **Error Handling**: Zorg voor goede error messages voor gebruikers
- **Logging**: Log alle API calls (zonder gevoelige data) voor debugging

## Support

- **Signicat Support**: support@signicat.com
- **EDSN Support**: sales@edsn.nl
- **iDIN Documentatie**: https://www.idin.nl/

