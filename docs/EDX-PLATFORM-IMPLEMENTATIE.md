# EDX Platform Implementatie Plan

## Overzicht

EDX (Energy Data Exchange) Platform is een alternatief voor iDIN/EDSN om **historisch verbruik** op te halen. Het platform gebruikt **OAuth2.0 met PKCE en Private Key JWT** voor authenticatie.

## Belangrijke Verschillen met iDIN

| Aspect | iDIN/EDSN (huidig) | EDX Platform |
|--------|-------------------|--------------|
| **Authenticatie** | iDIN via Signicat | DigiD of eHerkenning |
| **Doel** | Identificatie + verbruik | Alleen verbruik (met toestemming) |
| **Data Type** | Jaarverbruik (geschat) | Historische intervaldata (per kwartier) |
| **Identificatie** | BSN via iDIN | EAN18 nummers (aansluitings-ID's) |
| **Toegang** | Via EDSN API | Via OAuth2 consent flow |

## Wat EDX Platform Biedt

### Data Products Beschikbaar

1. **DP004**: Historische intervaldata elektriciteit grootverbruik - jaar tot dag (YtD)
2. **DP005**: Historische intervaldata elektriciteit grootverbruik - voorgaand jaar (Y-1)
3. **DP006**: Historische intervaldata elektriciteit grootverbruik - voorvoorgaand jaar (Y-2)

### Data Structuur

- **Resolutie**: 15 minuten (PT15M)
- **Richtingen**: 
  - E17: Consumptie (afname)
  - E18: Productie (invoeding/teruglevering)
- **Formaat**: kWh per kwartier
- **Periode**: Volledige jaren (YtD, Y-1, Y-2)

## Implementatie Vereisten

### 1. EDX Account & Registratie

- ✅ Registreer bij EDX Platform
- ✅ Verkrijg `client_id`
- ✅ Genereer RSA/ECDSA keypair (minimaal 2048-bit RSA of P-256 ECDSA)
- ✅ Registreer public key in EDX portal (met `kid` identifier)
- ✅ Configureer `redirect_uri` in EDX portal

### 2. EAN18 Nummers Ophalen

**Probleem**: EDX vereist EAN18 nummers, maar we hebben alleen postcode/huisnummer.

**Oplossingen**:
1. **Via BAG API + Netbeheerder API**: 
   - Postcode/huisnummer → BAG → adresgegevens
   - Adresgegevens → Netbeheerder API → EAN18 nummers
   
2. **Via EDSN API** (als we die al hebben):
   - EDSN kan mogelijk EAN18 nummers teruggeven bij postcode lookup
   
3. **Via EDX zelf** (indien beschikbaar):
   - Sommige netbeheerders bieden EAN18 lookup endpoints

### 3. OAuth2 Flow Implementatie

#### Stap 1: Authorization Request (zonder PAR)

```typescript
// Genereer PKCE verifier en challenge
const verifier = crypto.randomBytes(50).toString('hex').slice(0, 128)
const challenge = crypto.createHash('sha256')
  .update(Buffer.from(verifier))
  .digest('base64url')

// Genereer state voor CSRF protection
const state = crypto.randomBytes(32).toString('hex')

// Genereer Private Key JWT assertion
const clientAssertion = await signJWT({
  iss: CLIENT_ID,
  sub: CLIENT_ID,
  aud: 'https://autorisatie.enkiy.nl/',
  exp: Math.floor(Date.now() / 1000) + 300, // 5 minuten
  iat: Math.floor(Date.now() / 1000),
  jti: uuid.v4()
}, privateKey, { kid: KEY_ID, alg: 'RS256' })

// Redirect naar authorization endpoint
const authUrl = new URL('https://autorisatie.enkiy.nl/authorizationserver/oauth2/authorize')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('client_id', CLIENT_ID)
authUrl.searchParams.set('scope', 'dp004 dp005 dp006') // Data products
authUrl.searchParams.set('redirect_uri', REDIRECT_URI)
authUrl.searchParams.set('state', state)
authUrl.searchParams.set('eans', ean18Numbers.join(',')) // Comma-separated EAN18's
authUrl.searchParams.set('code_challenge', challenge)
authUrl.searchParams.set('code_challenge_method', 'S256')
```

#### Stap 2: Token Exchange

```typescript
// Na callback met authorization code
const tokenResponse = await fetch('https://autorisatie.enkiy.nl/authorizationserver/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier, // Originele PKCE verifier
    client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: clientAssertion
  })
})

const { access_token, refresh_token, expires_in, consent } = await tokenResponse.json()
```

#### Stap 3: Data Ophalen

```typescript
// Consent bevat endpoints per data product
for (const ean18Data of consent.ean18s) {
  for (const dataProduct of ean18Data.dataProducts) {
    for (const period of dataProduct.periods) {
      const dataResponse = await fetch(
        `https://gw.edx.hetnormo.nl/${dataProduct.dataProduct}/${period.requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const measurementData: MeasurementVolumeSeries = await dataResponse.json()
      
      // Process data
      // measurementData.detailSeries bevat arrays van Point objects
      // Elke Point heeft pos (tijd positie) en qnt (kWh waarde)
    }
  }
}
```

## Implementatie Stappen

### Fase 1: Setup & Configuratie

1. **EDX Account Aanmaken**
   - Registreer bij EDX Platform
   - Verkrijg credentials en configureer in `.env`

2. **Keypair Genereren**
   ```bash
   openssl genrsa -out edx-private-key.pem 2048
   openssl rsa -in edx-private-key.pem -pubout -out edx-public-key.pem
   ```

3. **Public Key Registreren**
   - Upload public key in EDX portal
   - Noteer de `kid` (Key ID)

4. **Environment Variables**
   ```env
   EDX_ENABLED=true
   EDX_CLIENT_ID=your-client-id
   EDX_PRIVATE_KEY_PATH=/path/to/private-key.pem
   EDX_KEY_ID=your-key-id
   EDX_REDIRECT_URI=https://pakketadvies.nl/api/edx/callback
   EDX_AUTHORIZATION_URL=https://autorisatie.enkiy.nl/authorizationserver/oauth2/authorize
   EDX_TOKEN_URL=https://autorisatie.enkiy.nl/authorizationserver/oauth2/token
   EDX_GATEWAY_URL=https://gw.edx.hetnormo.nl
   ```

### Fase 2: EAN18 Lookup Implementatie

**Optie A: Via Netbeheerder API** (aanbevolen)
- Integreer met netbeheerder APIs (Enexis, Liander, etc.)
- Postcode/huisnummer → EAN18 nummers

**Optie B: Via EDSN** (als beschikbaar)
- Check of EDSN API EAN18 nummers teruggeeft

**Optie C: Via EDX Portal** (indien beschikbaar)
- Sommige netbeheerders bieden lookup endpoints

### Fase 3: OAuth2 Flow Implementatie

1. **API Routes Aanmaken**
   - `/api/edx/start` - Start authorization flow
   - `/api/edx/callback` - Handle callback
   - `/api/edx/data` - Fetch consumption data

2. **Helper Functions**
   - PKCE verifier/challenge generatie
   - Private Key JWT signing
   - Token refresh logic

3. **Database Schema**
   - Opslaan access/refresh tokens
   - Opslaan consent data
   - Opslaan opgehaalde verbruiksdata

### Fase 4: Data Processing

1. **Parse MeasurementVolumeSeries**
   - Extract consumptie (E17) en productie (E18)
   - Bereken totaal verbruik per dag/maand/jaar
   - Splits normaal/dal (indien van toepassing)

2. **Integratie met Calculator**
   - Gebruik historisch verbruik voor nauwkeurige berekeningen
   - Vervang geschatte verbruik met echte data

## Voordelen van EDX Platform

✅ **Gedetailleerde Data**: Per kwartier metingen (15 minuten resolutie)
✅ **Historische Data**: Tot 3 jaar terug (YtD, Y-1, Y-2)
✅ **Consumptie + Productie**: Zowel afname als teruglevering
✅ **Betrouwbaar**: Direct van netbeheerder, geen schattingen
✅ **Toestemming**: Expliciete consent van gebruiker

## Nadelen / Uitdagingen

❌ **Complexer**: OAuth2 + PKCE + Private Key JWT
❌ **EAN18 Vereist**: Moet eerst EAN18 nummers ophalen
❌ **DigiD/eHerkenning**: Niet iDIN (andere authenticatie)
❌ **Meer Stappen**: Authorization flow + data retrieval
❌ **Key Management**: Private keys moeten veilig opgeslagen worden

## Aanbeveling

**EDX Platform is ideaal voor**:
- Grootverbruik aansluitingen
- Nauwkeurige verbruiksberekeningen
- Historische data analyse
- Klanten die DigiD/eHerkenning hebben

**Huidige iDIN/EDSN blijft nuttig voor**:
- Particuliere klanten zonder DigiD/eHerkenning
- Snelle identificatie
- Basis verbruiksschatting

## Volgende Stappen

1. ✅ **EDX Account Aanmaken** - Registreer bij EDX Platform
2. ✅ **EAN18 Lookup Onderzoeken** - Hoe krijgen we EAN18 nummers?
3. ✅ **Proof of Concept** - Implementeer basis OAuth2 flow
4. ✅ **Data Processing** - Parse en gebruik historische data
5. ✅ **Integratie** - Koppel aan calculator

## Code Structuur

```
src/
  lib/
    edx/
      oauth.ts          # OAuth2 flow helpers
      jwt.ts            # Private Key JWT signing
      pkce.ts           # PKCE verifier/challenge
      gateway.ts        # Gateway API client
      types.ts          # TypeScript types voor EDX responses
  app/
    api/
      edx/
        start/route.ts      # Start authorization
        callback/route.ts   # Handle callback
        data/route.ts       # Fetch consumption data
        refresh/route.ts    # Refresh tokens
```

## Referenties

- EDX Platform Documentation (toegevoegd door gebruiker)
- OAuth2.0 RFC: https://tools.ietf.org/html/rfc6749
- PKCE RFC: https://tools.ietf.org/html/rfc7636
- JWT RFC: https://tools.ietf.org/html/rfc7519

