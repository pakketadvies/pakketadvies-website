# Verificatie: Dynamische Prijzen Systeem

## ✅ Status Check

### 1. 30-Dagen Gemiddelde Berekening
**Status: ✅ CORRECT**

- `getCurrentDynamicPrices()` gebruikt:
  - `get30DayAverageElectricityPrices()` - berekent gemiddelde van laatste 30 dagen voor elektriciteit
  - `get30DayAverageGasPrice()` - berekent gemiddelde van laatste 30 dagen voor gas

- De functies halen data op met:
  ```typescript
  .gte('datum', thirtyDaysAgo.toISOString().split('T')[0])
  .lte('datum', now.toISOString().split('T')[0])
  ```
  Dit haalt **exact de laatste 30 dagen** op.

- Het gemiddelde wordt berekend over alle beschikbare dagen in die periode.

### 2. Cron Job Configuratie
**Status: ✅ CORRECT**

- **Route**: `/api/cron/update-dynamic-prices`
- **Schedule**: `0 14 * * *` (dagelijks om 14:00 UTC = 15:00/16:00 Nederlandse tijd)
- **Functie**: 
  - Haalt prijzen van **vandaag** op via EnergyZero API
  - Slaat ze op in Supabase met `upsert` (geen duplicaten)
  - Elke dag wordt een nieuwe dag toegevoegd aan de database

### 3. Database Structuur
**Status: ✅ CORRECT**

- Tabel: `dynamic_prices`
- Primary key: `datum` (date)
- Kolommen:
  - `elektriciteit_gemiddeld_dag` - gemiddelde dagprijs
  - `elektriciteit_gemiddeld_nacht` - gemiddelde nachtprijs
  - `elektriciteit_min_dag` - minimum prijs
  - `elektriciteit_max_dag` - maximum prijs
  - `gas_gemiddeld` - gemiddelde gasprijs
  - `gas_min` - minimum gasprijs
  - `gas_max` - maximum gasprijs
  - `bron` - data bron (ENERGYZERO, ENTSOE, etc.)
  - `laatst_geupdate` - timestamp van laatste update

### 4. Gebruik in QuickCalculator
**Status: ✅ CORRECT**

- QuickCalculator gebruikt `getCurrentDynamicPrices()` via:
  - `/api/energie/bereken-contract` route
  - `bereken-contract-internal.ts` functie

- Deze functie retourneert:
  - `electricity` - gemiddelde van laatste 30 dagen (single tariff)
  - `electricityDay` - gemiddelde dagprijs van laatste 30 dagen
  - `electricityNight` - gemiddelde nachtprijs van laatste 30 dagen
  - `gas` - gemiddelde gasprijs van laatste 30 dagen

### 5. Automatische Updates
**Status: ✅ CORRECT**

- Elke dag om 14:00 UTC:
  1. Cron job draait automatisch
  2. Haalt prijzen van vandaag op
  3. Slaat ze op in database
  4. Oudste dag valt automatisch uit de 30-dagen window
  5. Nieuwe dag wordt toegevoegd
  6. Gemiddelde wordt automatisch bijgewerkt

## 📊 Data Flow

```
EnergyZero API (dagelijks)
    ↓
Cron Job (14:00 UTC)
    ↓
Supabase (dynamic_prices tabel)
    ↓
getCurrentDynamicPrices() (berekent 30-dagen gemiddelde)
    ↓
QuickCalculator / API routes
    ↓
Gebruiker ziet gemiddelde prijs van laatste 30 dagen
```

## ✅ Conclusie

**Alles staat correct ingesteld!**

- ✅ 30-dagen gemiddelde wordt correct berekend
- ✅ Cron job update dagelijks automatisch
- ✅ Nieuwe data wordt elke dag toegevoegd
- ✅ Oude data valt automatisch uit de berekening
- ✅ QuickCalculator gebruikt altijd het 30-dagen gemiddelde

## 🔧 Handmatige Update (indien nodig)

Als je handmatig prijzen wilt updaten:

```bash
# Update laatste 7 dagen
POST https://pakketadvies.vercel.app/api/energieprijzen/update-recent

# Laad alle historische prijzen (5 jaar)
POST https://pakketadvies.vercel.app/api/energieprijzen/load-all-historical

# Check wat er in database staat
GET https://pakketadvies.vercel.app/api/energieprijzen/check
```

