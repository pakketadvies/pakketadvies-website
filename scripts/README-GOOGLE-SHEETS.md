# Google Sheets Setup Scripts

## 🔐 encode-google-sheets-key.sh

Dit script helpt je om de Google Sheets service account credentials om te zetten naar environment variables voor Vercel.

### Gebruik:

```bash
./scripts/encode-google-sheets-key.sh
```

Het script zal vragen om het JSON bestand dat je hebt gedownload van Google Cloud.

### Output:

Het script maakt een bestand `google-sheets-env-vars.txt` aan met de volgende variabelen:
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY` (base64 encoded)

### ⚠️ BELANGRIJK:

1. **COMMIT DEZE BESTANDEN NOOIT NAAR GIT:**
   - `google-sheets-env-vars.txt`
   - `*-service-account-*.json`
   - `pakketadvies-sheets-*.json`

2. **Verwijder het bestand na gebruik:**
   ```bash
   rm google-sheets-env-vars.txt
   ```

3. **Bewaar het originele JSON bestand op een veilige plek** (bijvoorbeeld in je password manager)

### Volledige setup:

Zie `GOOGLE_SHEETS_SETUP.md` in de root van dit project voor de volledige instructies.
