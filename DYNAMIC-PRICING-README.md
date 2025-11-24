# Dynamic Energy Pricing System

## 📊 Overzicht

Dit systeem haalt automatisch dagelijkse elektriciteit- en gasprijzen op van de Nederlandse energiemarkt en gebruikt deze voor dynamische energiecontracten.

## 🏗️ Architectuur

```
┌─────────────────────────────────────────┐
│  EnergyZero API (primair)               │
│  + ENTSOE API (fallback)                │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────┐
│  Vercel Cron Job                        │
│  Daily at 14:00 CET                    │
│  /api/cron/update-dynamic-prices       │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────┐
│  Supabase: dynamic_prices table        │
│  - datum                                │
│  - elektriciteit_gemiddeld_dag         │
│  - elektriciteit_gemiddeld_nacht       │
│  - gas_gemiddeld                        │
│  - bron (ENERGYZERO/ENTSOE/MANUAL)     │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────┐
│  /api/energie/bereken-contract          │
│  Leest prijzen + voegt opslag toe      │
│  Cache met intelligent fallback        │
└────────────────────────────────────────┘
```

## 🚀 Setup

### 1. Database Migratie

```bash
# Run de migratie om de dynamic_prices tabel aan te maken
cd supabase
supabase migration up
```

### 2. Environment Variables

Voeg toe aan je `.env.local`:

```bash
# Vercel Cron Authentication
CRON_SECRET=<generate_random_string>

# ENTSOE API (optioneel, voor fallback)
ENTSOE_API_KEY=<your_key_from_entsoe.eu>
```

### 3. Vercel Configuration

De `vercel.json` is al geconfigureerd met:

```json
{
  "crons": [{
    "path": "/api/cron/update-dynamic-prices",
    "schedule": "0 14 * * *"
  }]
}
```

Dit draait automatisch na deployment.

### 4. Eerste Prijzen Laden

Na deployment, trigger de cron job handmatig:

```bash
curl -X POST https://your-domain.com/api/cron/update-dynamic-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📡 API Bronnen

### EnergyZero API (Primair)

- **URL**: `https://api.energyzero.nl/v1/energyprices`
- **Auth**: Geen (gratis, public)
- **Data**: Nederlandse day-ahead prijzen
- **Update**: Dagelijks rond 13:00

**Voorbeeld:**
```typescript
const response = await fetch(
  'https://api.energyzero.nl/v1/energyprices?' +
  'fromDate=2025-01-01&' +
  'tillDate=2025-01-02&' +
  'interval=4&' +
  'usageType=1&' +  // 1=elektriciteit, 3=gas
  'inclBtw=false'
)
```

### ENTSOE API (Fallback)

- **URL**: `https://web-api.tp.entsoe.eu/api`
- **Auth**: Security token (gratis aanvragen)
- **Data**: Europese TSO platform
- **Update**: Realtime

**API Key aanvragen:**
1. Ga naar https://transparency.entsoe.eu/
2. Maak account
3. Vraag security token aan via email
4. Voeg toe aan environment variables

## 🔧 Gebruik in Code

### Dynamische Prijzen Ophalen

```typescript
import { getCurrentDynamicPrices } from '@/lib/dynamic-pricing/database'

const prices = await getCurrentDynamicPrices()

console.log(prices)
// {
//   electricity: 0.18,        // €/kWh
//   electricityDay: 0.20,
//   electricityNight: 0.14,
//   gas: 0.75,                // €/m³
//   source: 'ENERGYZERO',
//   lastUpdated: Date,
//   isFresh: true
// }
```

### In Contract Berekening

De `/api/energie/bereken-contract` endpoint detecteert automatisch dynamische contracten:

```typescript
// Dynamische contracten hebben lage opslag tarieven (< €0.01/kWh)
const isDynamisch = contractType === 'dynamisch' || 
                    (tarief < 0.01)

if (isDynamisch) {
  const dynamicPrices = await getCurrentDynamicPrices()
  
  // Totale tarief = marktprijs + opslag leverancier
  const totalTariff = dynamicPrices.electricity + leverancierOpslag
}
```

## 📊 Database Schema

```sql
CREATE TABLE dynamic_prices (
  id UUID PRIMARY KEY,
  datum DATE NOT NULL UNIQUE,
  
  -- Prijzen (€/kWh of €/m³, excl BTW, excl EB)
  elektriciteit_gemiddeld_dag DECIMAL(10, 5),
  elektriciteit_gemiddeld_nacht DECIMAL(10, 5),
  gas_gemiddeld DECIMAL(10, 5),
  
  -- Metadata
  bron VARCHAR(50) NOT NULL,  -- 'ENERGYZERO', 'ENTSOE', 'MANUAL'
  laatst_geupdate TIMESTAMP,
  is_voorspelling BOOLEAN DEFAULT FALSE
);
```

## 🎯 Intelligente Caching Strategie

1. **Database First**: Altijd eerst database checken
2. **Fresh Check**: Data < 24 uur oud = gebruik cache
3. **API Fallback**: Als stale, haal fresh data op
4. **Ultimate Fallback**: Bij API failure, gebruik laatste bekende data

```typescript
// Prioriteit:
// 1. Fresh database cache (< 24h)
// 2. EnergyZero API
// 3. ENTSOE API
// 4. Stale database data
// 5. Hardcoded fallback (€0.20/kWh, €0.80/m³)
```

## 🧹 Data Cleanup

Cron job ruimt automatisch oude data op:
- Behoudt laatste 90 dagen
- Draait bij elke update
- Voorkomt database bloat

## 🐛 Debugging

### Check of cron draait:

```bash
# Vercel Dashboard > Cron Jobs
# Of check logs:
vercel logs --project=pakketadvies-website
```

### Check database data:

```sql
SELECT 
  datum,
  elektriciteit_gemiddeld_dag,
  gas_gemiddeld,
  bron,
  laatst_geupdate
FROM dynamic_prices
ORDER BY datum DESC
LIMIT 7;
```

### Manually update prices:

```bash
curl -X POST https://your-domain.com/api/cron/update-dynamic-prices \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📈 Monitoring

Log output in cron job:
- ✅ Succesvolle API calls
- ⚠️ Fallback triggers
- ❌ Errors met details
- 🧹 Cleanup acties

Check Vercel logs voor:
```
✅ EnergyZero prices fetched successfully
📊 Today prices fetched: { electricity: 0.18, gas: 0.75 }
💾 Dynamic prices saved to database
```

## 🔄 Update Frequency

- **Cron Schedule**: Dagelijks om 14:00 CET
- **Timing**: Na day-ahead auction (12:00) en publicatie (13:00)
- **Cache**: 24 uur TTL
- **Fallback**: Real-time bij stale data

## 🎓 Uitbreidingen

Mogelijke future improvements:
1. **Uur-tarieven**: In plaats van dag-gemiddelde
2. **Real-time prijzen**: Voor intraday trading
3. **Voorspellingen**: ML voor volgende dag
4. **Historical charts**: Trendanalyse voor gebruikers
5. **Price alerts**: Notificaties bij lage prijzen

## 📝 Notes

- Alle prijzen zijn EXCLUSIEF BTW en EB
- EnergyZero API is unofficial maar stabiel
- ENTSOE is officieel maar XML-based (complex)
- Day-ahead prijzen zijn beschikbaar vanaf 13:00
- Cron draait op 14:00 voor zekerheid

