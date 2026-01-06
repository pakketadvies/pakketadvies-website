# 🔐 GridHub Encryption Key Uitleg

## ❌ Wat is NIET de Encryption Key

**`'5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024'`**

Dit is **NIET** de encryption key. Dit is het **API wachtwoord** van Energiek.nl voor de GridHub API.

## ✅ Wat IS de Encryption Key

De `GRIDHUB_ENCRYPTION_KEY` is een **willekeurige 64-character hex string** (32 bytes) die wordt gebruikt om het API wachtwoord te **encrypten** voordat het in de database wordt opgeslagen.

## 🔑 Hoe Werkt Het

```
API Wachtwoord (plain text)
    ↓
GRIDHUB_ENCRYPTION_KEY (encrypteert)
    ↓
Encrypted Password (opgeslagen in database)
```

**Voorbeeld:**
- **API Wachtwoord:** `5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024` (van Energiek.nl)
- **Encryption Key:** `a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761` (zelf genereren)
- **Encrypted Password:** `10d1d32c87c888cc457c5e5d494ed678:3d0508adabe25adca5f59a3cb115ac8c:6827de13c864b6b15fc7392e357dc080b1152d2b93c8507e04484b52353677f4a98e1f480db2118d7c8739d6a3d78e65288ccebcb2` (opgeslagen in database)

## 🚀 Setup Stappen

### 1. Genereer een Encryption Key

```bash
# Via Node.js
node -e "const crypto = require('crypto'); console.log(crypto.randomBytes(32).toString('hex'))"

# Of via OpenSSL
openssl rand -hex 32
```

**Output:** Een 64-character hex string (bijv. `a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761`)

### 2. Zet de Key in Environment Variables

**Lokaal (.env.local):**
```bash
GRIDHUB_ENCRYPTION_KEY=a405a12fd924311caf42f80b8d8e89ebc678dc49781ec87f33d4aeac23ccf761
```

**Vercel (Production):**
1. Ga naar Vercel Dashboard
2. Project → Settings → Environment Variables
3. Voeg toe: `GRIDHUB_ENCRYPTION_KEY` = `[jouw_64_character_hex_string]`

### 3. Het API Wachtwoord is Al Geëncrypteerd

Het API wachtwoord van Energiek.nl is al geëncrypteerd en opgeslagen in de database via migratie `047_add_energiek_gridhub_config.sql`.

**Belangrijk:** Als je de `GRIDHUB_ENCRYPTION_KEY` wijzigt, moet je het wachtwoord opnieuw encrypten met de nieuwe key!

## ⚠️ Belangrijk

- **Encryption Key:** Moet 64 hex characters zijn (32 bytes)
- **API Wachtwoord:** Het wachtwoord van Energiek.nl (al geëncrypteerd opgeslagen)
- **Beide zijn nodig:** Encryption key om het wachtwoord te decrypten wanneer GridHub API wordt aangeroepen

## 🔍 Verificatie

Check of de key correct is ingesteld:

```bash
# In .env.local
grep GRIDHUB_ENCRYPTION_KEY .env.local

# In Vercel
# Settings → Environment Variables → Check of GRIDHUB_ENCRYPTION_KEY bestaat
```

## 📝 Samenvatting

- ❌ `5428|55flKjcAESpD75thOVhvXLkcVeocQOA3kzJ76vm228d58024` = API Wachtwoord (van Energiek.nl)
- ✅ `GRIDHUB_ENCRYPTION_KEY` = Willekeurige 64-character hex string (zelf genereren)
- ✅ Encrypted password = Al opgeslagen in database (via migratie)

**Je moet alleen de `GRIDHUB_ENCRYPTION_KEY` genereren en in environment variables zetten!**

