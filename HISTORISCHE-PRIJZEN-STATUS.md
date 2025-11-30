# Historische Energieprijzen - Status & Configuratie

## ✅ Wat is geconfigureerd

### 1. Cron Job (Dagelijkse Updates)
**Status: ✅ ACTIEF**

- **Route**: `/api/cron/update-dynamic-prices`
- **Schedule**: `0 14 * * *` (dagelijks om 14:00 UTC = 15:00/16:00 Nederlandse tijd)
- **Functie**: 
  - Haalt prijzen van **vandaag** op via EnergyZero API
  - Slaat ze op in Supabase met `upsert` (update als bestaat, insert als nieuw)
  - Elke dag wordt automatisch een nieuwe dag toegevoegd

**Configuratie**: `vercel.json`

### 2. Historische Data Laden
**Status: 🔄 IN UITVOERING**

Script: `scripts/load-all-available-historical-prices.ts`

**Strategie**:
- Start vanaf vandaag en gaat **achterwaarts** in de tijd
- Probeert voor elke datum data op te halen via EnergyZero API
- Stopt automatisch na 30 opeenvolgende dagen zonder data
- Laadt alle beschikbare historische data in

**Hoe te gebruiken**:
```bash
npx ts-node scripts/load-all-available-historical-prices.ts
```

### 3. 30-Dagen Gemiddelde Berekening
**Status: ✅ CORRECT**

- `getCurrentDynamicPrices()` gebruikt:
  - `get30DayAverageElectricityPrices()` - laatste 30 dagen gemiddelde
  - `get30DayAverageGasPrice()` - laatste 30 dagen gemiddelde
- Wordt gebruikt in:
  - QuickCalculator
  - Energieprijzen pagina (`/kennisbank/energieprijzen`)
  - Contract berekeningen

## 📊 Data Flow

```
EnergyZero API
    ↓
Cron Job (dagelijks 14:00 UTC)
    ↓
Supabase (dynamic_prices tabel)
    ↓
getCurrentDynamicPrices() (berekent 30-dagen gemiddelde)
    ↓
Energieprijzen pagina & Calculator
```

## 🔄 Automatisch Onderhoud

### Dagelijks (via Cron Job)
1. ✅ Haalt prijzen van vandaag op
2. ✅ Slaat ze op in database
3. ✅ Update bestaande records als nodig
4. ✅ 30-dagen gemiddelde wordt automatisch bijgewerkt

### Handmatig (indien nodig)
```bash
# Update laatste 7 dagen
POST https://pakketadvies.vercel.app/api/energieprijzen/update-recent

# Laad alle beschikbare historische data
npx ts-node scripts/load-all-available-historical-prices.ts
```

## 📅 Data Beschikbaarheid

**EnergyZero API**:
- ✅ Heeft data voor recente datums (laatste ~2 jaar)
- ❌ Heeft GEEN data voor zeer oude datums (>2 jaar geleden)

**Oplossing**:
- Script laadt alle beschikbare data in (zoveel mogelijk)
- Cron job zorgt dat nieuwe data dagelijks wordt toegevoegd
- 30-dagen gemiddelde werkt altijd met beschikbare data

## ✅ Verificatie

Om te checken wat er in de database staat:

```bash
# Via API
GET https://pakketadvies.vercel.app/api/energieprijzen/check

# Of direct in Supabase
SELECT COUNT(*), MIN(datum), MAX(datum) 
FROM dynamic_prices;
```

## 🎯 Resultaat

- ✅ Alle beschikbare historische prijzen worden ingeladen
- ✅ Nieuwe prijzen worden dagelijks automatisch toegevoegd
- ✅ 30-dagen gemiddelde wordt automatisch berekend
- ✅ Energieprijzen pagina toont accurate data
- ✅ Calculator gebruikt altijd actuele 30-dagen gemiddelde

