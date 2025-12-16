# Homepage Performance Analyse & Oplossingen

## Probleem
De homepage duurt te lang bij eerste load (meerdere seconden), wat klanten kost.

## Root Cause Analyse

### Huidige situatie
Voor **5 homepage contracten** worden **40-50 database queries** uitgevoerd:

1. **Database query voor contracten** (1 query)
2. **Contract details queries** (5 queries - één per contract type)
3. **Eneco model berekening** (~3 queries voor tarieven/netbeheer)
4. **Per contract: `calculateContractCosts()`** (~6-8 queries per contract = 30-40 queries):
   - postcode_netbeheerders lookup
   - netbeheerders lookup
   - tarieven_overheid (elke keer opnieuw!)
   - aansluitwaarden_elektriciteit
   - netbeheer_tarieven_elektriciteit
   - aansluitwaarden_gas
   - netbeheer_tarieven_gas
   - En mogelijk nog meer...

**Totaal: ~40-50 queries die allemaal synchroon worden uitgevoerd!**

---

## Oplossing 1: Next.js Caching (Snelste Win)

**Implementatie:**
- Gebruik Next.js `unstable_cache` om de hele `getBestDeals` output te cachen
- Cache voor 5-10 minuten
- Automatische cache invalidatie bij nieuwe requests na expiratie

**Voordelen:**
- ✅ **Enorme performance winst** (95%+ sneller)
- ✅ Minimale code wijzigingen
- ✅ Werkt direct
- ✅ Geen database wijzigingen nodig

**Nadelen:**
- ⚠️ Data kan tot 5-10 minuten verouderd zijn
- ⚠️ Cache moet handmatig worden geïnvalideerd bij contract updates (of accepteer de delay)

**Geschatte winst:**
- 40-50 queries → **1 cached resultaat**
- Load time: **2-3 seconden → ~200ms**

**Code wijzigingen:**
```typescript
// src/lib/get-best-deals.ts
import { unstable_cache } from 'next/cache'

export const getBestDeals = unstable_cache(
  async (limit: number = 5, type: 'alle' | 'vast' | 'dynamisch' = 'alle') => {
    // ... huidige code ...
  },
  ['best-deals'], // cache key
  {
    revalidate: 300, // 5 minuten
    tags: ['best-deals'] // voor manual invalidation
  }
)
```

---

## Oplossing 2: Database Query Optimalisatie + In-Memory Caching (Meest Duurzaam)

**Implementatie:**
1. **Cache veelvoorkomende data** in geheugen voor de request:
   - Overheidstarieven (altijd hetzelfde voor 2025)
   - Netbeheertarieven voor vaste postcode '1000AA' (altijd Amsterdam)
   - Modeltarieven
   - Aansluitwaarden

2. **Optimaliseer contract details queries:**
   - Gebruik één query met JOINs in plaats van N aparte queries

3. **Deel data tussen contract berekeningen:**
   - Haal tarieven één keer op, hergebruik voor alle contracten

**Voordelen:**
- ✅ **Duurzame oplossing** (70%+ sneller)
- ✅ Geen cache stale data issues
- ✅ Werkt altijd up-to-date
- ✅ Verbeterd alle pagina's die deze functies gebruiken

**Nadelen:**
- ⚠️ Meer code wijzigingen nodig
- ⚠️ Complexer om te onderhouden

**Geschatte winst:**
- 40-50 queries → **~15 queries** (veel minder redundant)
- Load time: **2-3 seconden → ~600-800ms**

**Code wijzigingen:**
```typescript
// src/lib/get-best-deals.ts
// Haal tarieven één keer op, deel tussen alle contracten
const overheidsTarieven = await fetchOverheidsTarieven(supabase) // 1x
const netbeheerTarieven = await fetchNetbeheerTarieven(supabase, '1000AA', '3x25A', 'G6') // 1x
const modelTarieven = await getModelTarieven(supabase) // 1x

// Gebruik gedeelde tarieven in calculateContractCosts
// ... optimalisatie code ...
```

---

## Oplossing 3: Geprecalculeerde Prijzen in Database (Best voor Performance)

**Implementatie:**
1. Voeg database velden toe:
   - `homepage_maandbedrag` (INTEGER)
   - `homepage_besparing` (INTEGER)
   - `homepage_last_calculated` (TIMESTAMP)

2. Bereken deze waarden achtergrond:
   - Via cron job die dagelijks/nachtelijks draait
   - Of bij contract updates (trigger/webhook)

3. Homepage gebruikt alleen deze waarden:
   - Geen berekeningen tijdens request
   - Alleen database select queries

**Voordelen:**
- ✅ **Extreem snel** (98%+ sneller)
- ✅ Minimale database belasting
- ✅ Consistente performance

**Nadelen:**
- ⚠️ Database migratie nodig
- ⚠️ Achtergrond berekeningen moeten werken
- ⚠️ Data kan verouderd zijn tot volgende cron run

**Geschatte winst:**
- 40-50 queries → **1-2 queries** (alleen contracten selecteren)
- Load time: **2-3 seconden → ~100-200ms**

**Database migratie:**
```sql
ALTER TABLE contracten 
ADD COLUMN homepage_maandbedrag INTEGER,
ADD COLUMN homepage_besparing INTEGER,
ADD COLUMN homepage_last_calculated TIMESTAMP;

CREATE INDEX idx_contracten_homepage ON contracten(tonen_op_homepage, aanbevolen, populair);
```

---

## Aanbeveling

**Combinatie van Optie 1 + Optie 2:**

1. **Direct:** Implementeer Optie 1 (Next.js caching) voor **onmiddellijke winst**
2. **Daarna:** Implementeer Optie 2 (query optimalisatie) voor **duurzame verbetering**

Dit geeft:
- **Onmiddellijk:** 95%+ sneller (via caching)
- **Op lange termijn:** 70%+ sneller zelfs zonder cache (via optimalisatie)
- **Best of both worlds:** Snelle eerste load + up-to-date data

Optie 3 is alleen aan te raden als:
- Performance echt kritiek is
- Je bereid bent om database structuur aan te passen
- Je een cron job systeem hebt/kunt opzetten

