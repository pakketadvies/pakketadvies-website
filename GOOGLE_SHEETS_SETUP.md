# Google Sheets API Setup Instructies

Deze guide legt uit hoe je Google Sheets API configureert om automatisch formulier leads naar je spreadsheet te schrijven.

## 🎯 Wat wordt bereikt

Alle formulieren op de website schrijven automatisch naar het tabblad "Advertentieleads" in je Google Spreadsheet:
- Contactformulier
- Aanbieding interesse formulieren (Particulier, MKB, Grootzakelijk, Dynamisch, Clean Energy ETS-2)
- Essent overstap formulier
- Contractaanvragen (volledige aanvragen met postcode, huisnummer, etc.)

## 📋 Stap 1: Google Cloud Project aanmaken

1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Klik op "Select a project" → "New Project"
3. Geef je project een naam: **"PakketAdvies Spreadsheet Integration"**
4. Klik op "Create"

## 🔑 Stap 2: Google Sheets API activeren

1. Zorg dat je nieuwe project geselecteerd is
2. Ga naar **"APIs & Services"** → **"Library"**
3. Zoek naar **"Google Sheets API"**
4. Klik op "Google Sheets API"
5. Klik op **"Enable"**

## 🤖 Stap 3: Service Account aanmaken

1. Ga naar **"APIs & Services"** → **"Credentials"**
2. Klik op **"Create Credentials"** → **"Service Account"**
3. Vul in:
   - **Service account name**: `pakketadvies-sheets`
   - **Service account ID**: `pakketadvies-sheets` (wordt automatisch ingevuld)
   - **Description**: "Service account voor PakketAdvies website om leads naar Google Sheets te schrijven"
4. Klik op **"Create and Continue"**
5. Sla **"Grant this service account access to project"** over (Optional)
6. Sla **"Grant users access to this service account"** over (Optional)
7. Klik op **"Done"**

## 🔐 Stap 4: Private Key genereren

1. Ga naar **"APIs & Services"** → **"Credentials"**
2. Onder **"Service Accounts"**, klik op de service account die je net hebt gemaakt (`pakketadvies-sheets@...`)
3. Ga naar het tabblad **"Keys"**
4. Klik op **"Add Key"** → **"Create new key"**
5. Selecteer **"JSON"**
6. Klik op **"Create"**
7. Een JSON bestand wordt gedownload naar je computer

## 📊 Stap 5: Spreadsheet toegang geven

1. Open het JSON bestand dat je zojuist hebt gedownload
2. Zoek het veld `"client_email"` (bijvoorbeeld: `pakketadvies-sheets@...iam.gserviceaccount.com`)
3. **Kopieer dit email adres**
4. Ga naar je [Google Spreadsheet](https://docs.google.com/spreadsheets/d/1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U/edit)
5. Klik op de **"Share"** knop (rechtsboven)
6. Plak het service account email adres
7. Zorg dat de permissie op **"Editor"** staat
8. **Belangrijk**: Schakel "Notify people" UIT (het is een bot, geen persoon)
9. Klik op **"Share"**

## 🔧 Stap 6: Environment Variables instellen in Vercel

Nu moet je 3 environment variables toevoegen aan Vercel:

### 6.1: GOOGLE_SHEETS_SPREADSHEET_ID

Dit is het ID van je spreadsheet uit de URL:
```
https://docs.google.com/spreadsheets/d/1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U/edit
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        Dit is je SPREADSHEET_ID
```

**Waarde**: `1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U`

### 6.2: GOOGLE_SERVICE_ACCOUNT_EMAIL

Open het JSON bestand dat je hebt gedownload en kopieer de waarde van `"client_email"`.

**Voorbeeld waarde**: `pakketadvies-sheets@pakketadvies-sheets.iam.gserviceaccount.com`

### 6.3: GOOGLE_PRIVATE_KEY (Base64 encoded)

Dit is de lastigste. De private key moet base64 encoded worden.

#### Optie A: Met command line (Mac/Linux)

Open Terminal en voer dit commando uit (vervang pad naar jouw JSON bestand):

```bash
cat ~/Downloads/pakketadvies-sheets-*.json | grep -o '"private_key": "[^"]*"' | sed 's/"private_key": "//;s/"$//' | tr -d '\n' | base64
```

Dit geeft je een lange string. Kopieer deze.

#### Optie B: Handmatig

1. Open het JSON bestand in een text editor
2. Zoek het veld `"private_key"`
3. Kopieer de volledige waarde (inclusief `-----BEGIN PRIVATE KEY-----` en `-----END PRIVATE KEY-----`)
4. Verwijder alle `\n` (backslash-n) karakters
5. Ga naar https://www.base64encode.org/
6. Plak de private key (zonder quotes)
7. Klik "Encode"
8. Kopieer het resultaat

### 6.4: Voeg toe aan Vercel

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecteer je PakketAdvies project
3. Ga naar **Settings** → **Environment Variables**
4. Voeg de 3 variabelen toe:

```
GOOGLE_SHEETS_SPREADSHEET_ID = 1cll6o1QL_o_7QBUPEE5lBseqJY82U0reNSgo4WkES3U
GOOGLE_SERVICE_ACCOUNT_EMAIL = pakketadvies-sheets@...iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY = (base64 encoded string)
```

5. Zorg dat ze voor **Production**, **Preview** én **Development** zijn ingesteld
6. Klik op **"Save"**

## 🚀 Stap 7: Deploy naar Vercel

1. Commit en push de code naar GitHub:
```bash
git add .
git commit -m "feat: add Google Sheets integration for form leads"
git push origin main
```

2. Vercel zal automatisch deployen
3. Wacht tot deployment klaar is

## ✅ Stap 8: Test de integratie

### Test via de website:
1. Ga naar je website (bijvoorbeeld https://pakketadvies.nl/contact)
2. Vul het contactformulier in met test data
3. Verstuur het formulier
4. Check je Google Spreadsheet → tabblad "Advertentieleads"
5. De nieuwe lead moet op de eerste lege rij verschijnen!

### Test via API (optioneel):
Je kunt ook een test API route maken om de connectie te testen zonder formulier in te vullen.

## 🔍 Troubleshooting

### Fout: "Google Sheets configuratie ontbreekt"
→ Controleer of alle 3 environment variables correct zijn ingesteld in Vercel

### Fout: "GOOGLE_PRIVATE_KEY is niet correct base64 encoded"
→ De private key moet base64 encoded zijn. Herhaal stap 6.3

### Fout: "The caller does not have permission"
→ Je hebt de service account email nog niet toegevoegd aan de spreadsheet (stap 5)

### Lead verschijnt niet in spreadsheet
1. Check Vercel logs: ga naar Deployment → Function Logs
2. Zoek naar `[Google Sheets]` berichten
3. Als je `✅ [Google Sheets] Successfully wrote to Google Sheets` ziet, werkt het!
4. Als je een error ziet, check de error message

### Spreadsheet heeft verkeerde kolommen
Zorg dat tabblad "Advertentieleads" deze kolommen heeft (exact deze volgorde):
```
A: Datum lead binnen
B: Huidige leveranciers  
C: Postcode
D: Huisnummer
E: Stroom
F: Gas
G: Naam
H: Telefoonnummer
I: Emailadres
J: Opmerkingen
```

## 🎉 Klaar!

Je formulieren schrijven nu automatisch naar Google Sheets! 

### Wat gebeurt er:
- ✅ Elke formulier submission wordt naar Supabase geschreven (zoals voorheen)
- ✅ Email notificaties worden verstuurd (zoals voorheen)  
- ✅ **NIEUW**: Lead wordt automatisch naar Google Sheets geschreven
- ✅ Als Google Sheets faalt, werkt het formulier nog steeds (non-blocking)

### Kolom mapping:

| Formulier | Datum | Huidig | Postcode | Huis# | Stroom | Gas | Naam | Tel | Email | Opmerkingen |
|-----------|-------|--------|----------|-------|--------|-----|------|-----|-------|-------------|
| Contact | ✅ | - | - | - | - | - | ✅ | ✅ | ✅ | Onderwerp + Bericht |
| Aanbieding | ✅ | - | - | - | - | - | ✅ | ✅ | ✅ | Type aanbieding |
| Essent | ✅ | Essent | - | - | - | - | ✅ | ✅ | ✅ | "Essent Overstap" |
| Aanvraag | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Contract + Aanvraag# |

## 📝 Notities

- De integratie is **non-blocking**: als Google Sheets down is, blijft het formulier gewoon werken
- Alle errors worden gelogd in Vercel Function Logs
- De service account heeft alleen toegang tot spreadsheets die je expliciet met hem deelt
- Private key is veilig opgeslagen als base64 encoded environment variable in Vercel
