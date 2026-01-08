# 📊 TERMIJNBEDRAG BEREKENING ANALYSE

## OVERZICHT

Beide contracttypen (vast & dynamisch) gebruiken dezelfde basis formule, maar verschillen in **hoe leverancierskosten worden berekend**.

---

## 🔵 VAST CONTRACT - Berekening

### FORMULE
```
Maandbedrag = (Totaal Jaar incl. BTW) / 12
```

### STAP-VOOR-STAP

#### 1. LEVERANCIERSKOSTEN (excl. BTW)
```javascript
// Elektriciteit (na saldering met teruglevering)
if (heeftEnkeleMeter) {
  kostenElektriciteit = nettoKwh * tariefElektriciteitEnkel
} else {
  kostenElektriciteit = 
    (nettoNormaalKwh * tariefElektriciteitNormaal) +
    (nettoDalKwh * tariefElektriciteitDal)
}

// Gas
kostenGas = gasM3 * tariefGas

// Vastrecht (per jaar)
vastrechtStroom = vastrechtStroomMaand * 12
vastrechtGas = vastrechtGasMaand * 12  // 0 als geen gas
kostenVastrecht = vastrechtStroom + vastrechtGas

// Teruglevering (negatieve kosten)
kostenTeruglevering = terugleveringKwh * tariefTerugleveringKwh

// SUBTOTAAL LEVERANCIER
subtotaalLeverancier = kostenElektriciteit + kostenGas + 
                       kostenVastrecht + kostenTeruglevering
```

**Belangrijke opmerking**: Saldering gebeurt VOOR de berekening:
- Teruglevering wordt afgetrokken van verbruik
- Alleen netto verbruik wordt vermenigvuldigd met tarieven

#### 2. ENERGIEBELASTING (excl. BTW)
```javascript
// Elektriciteit (schijventarief op netto kWh)
if (nettoKwh <= 2900) {
  ebElektriciteit = nettoKwh * schijf1Tarief  // €0.14294/kWh
} else if (nettoKwh <= 10000) {
  ebElektriciteit = 2900 * schijf1Tarief +
                    (nettoKwh - 2900) * schijf2Tarief  // €0.03898/kWh
} 
// ... tot schijf 4 voor > 50.000 kWh

// Gas (schijventarief)
if (gasM3 <= 1000) {
  ebGas = gasM3 * schijf1Tarief  // €0.65032/m³
} else {
  ebGas = 1000 * schijf1Tarief +
          (gasM3 - 1000) * schijf2Tarief  // €0.21972/m³
}

// Vermindering EB (alleen kleinverbruik)
verminderingEB = isKleinverbruik ? €553.64 : €0

// SUBTOTAAL ENERGIEBELASTING
subtotaalEB = ebElektriciteit + ebGas - verminderingEB
```

#### 3. NETBEHEERKOSTEN (excl. BTW)
```javascript
// Vaste bedragen per jaar op basis van:
// - Netbeheerder (o.b.v. postcode)
// - Aansluitwaarde elektriciteit
// - Aansluitwaarde gas

// Bijvoorbeeld voor 3x25A + G6 bij Liander:
netbeheerElektriciteit = €430,00  // Per jaar
netbeheerGas = €245,00             // Per jaar

// Grootverbruik heeft aangepaste tarieven of €0

// SUBTOTAAL NETBEHEER
subtotaalNetbeheer = netbeheerElektriciteit + netbeheerGas
```

#### 4. TOTAAL BEREKENEN
```javascript
// TOTAAL EXCL. BTW
totaalJaarExclBtw = subtotaalLeverancier + 
                     subtotaalEB + 
                     subtotaalNetbeheer

// BTW (21%)
btw = totaalJaarExclBtw * 0.21

// TOTAAL INCL. BTW
totaalJaarInclBtw = totaalJaarExclBtw + btw

// MAANDBEDRAG
maandbedragExclBtw = totaalJaarExclBtw / 12
maandbedragInclBtw = totaalJaarInclBtw / 12  // ← DIT WORDT GETOOND
```

---

## 🟢 DYNAMISCH CONTRACT - Berekening

### FORMULE
```
Maandbedrag = (Totaal Jaar incl. BTW) / 12
```

### HET VERSCHIL

**Dynamisch** gebruikt **MARKTPRIJZEN + OPSLAG** in plaats van vaste tarieven!

### STAP-VOOR-STAP

#### 1. MARKTPRIJZEN OPHALEN (30-dagen gemiddelde)
```javascript
// Wordt ELKE KEER opgehaald bij berekening
dynamicPrices = {
  elektriciteitDag: €0.13991,    // 30-dagen gemiddelde dag
  elektriciteitNacht: €0.09213,  // 30-dagen gemiddelde nacht
  gas: €0.28500                   // 30-dagen gemiddelde
}

// Bron: energieprijzen_historie tabel (EnergyZero API)
```

#### 2. LEVERANCIERSKOSTEN (excl. BTW) - MET MARKTPRIJZEN
```javascript
// SPOTPRIJZEN
S_dag = dynamicPrices.elektriciteitDag
S_nacht = dynamicPrices.elektriciteitNacht
S_enkel = (S_dag + S_nacht) / 2
P_gas = dynamicPrices.gas

// TARIEVEN = SPOTPRIJS + OPSLAG
P_dag = S_dag + opslagElektriciteit          // bijv. 0.13991 + 0.02
P_nacht = S_nacht + opslagElektriciteit      // bijv. 0.09213 + 0.02
P_enkel = S_enkel + opslagElektriciteit      // bijv. 0.11602 + 0.02
P_gasTarief = P_gas + opslagGas              // bijv. 0.28500 + 0.05
P_teruglever = S_enkel + opslagTeruglevering // bijv. 0.11602 - 0.01

// ELEKTRICITEIT MET SALDERING
if (!heeftDubbeleMeter) {
  // Enkeltarief
  if (terugleveringKwh <= verbruikKwh) {
    // Geen overschot
    nettoKwh = verbruikKwh - terugleveringKwh
    kostenElektriciteit = nettoKwh * P_enkel
    overschotKwh = 0
  } else {
    // Overschot (meer teruglevering dan verbruik)
    overschotKwh = terugleveringKwh - verbruikKwh
    opbrengstOverschot = overschotKwh * P_teruglever
    kostenElektriciteit = -opbrengstOverschot  // Negatief!
    nettoKwh = 0
  }
} else {
  // Dubbeltarief - saldering 50/50 verdeeld
  if (terugleveringKwh <= totaalVerbruik) {
    // Geen overschot
    Z_normaal = terugleveringKwh / 2
    Z_dal = terugleveringKwh / 2
    
    nettoNormaal = max(0, verbruikNormaal - Z_normaal)
    nettoDal = max(0, verbruikDal - Z_dal)
    
    // Cross-compensatie als één negatief wordt
    if (verbruikNormaal - Z_normaal < 0) {
      overschot = -(verbruikNormaal - Z_normaal)
      nettoDal = max(0, nettoDal - overschot)
      nettoNormaal = 0
    }
    
    kostenElektriciteit = (nettoNormaal * P_dag) + (nettoDal * P_nacht)
    nettoKwh = nettoNormaal + nettoDal
    overschotKwh = 0
  } else {
    // Overschot
    overschotKwh = terugleveringKwh - totaalVerbruik
    opbrengstOverschot = overschotKwh * P_teruglever
    kostenElektriciteit = -opbrengstOverschot
    nettoKwh = 0
  }
}

// GAS
kostenGas = gasM3 * P_gasTarief

// VASTRECHT (zelfde als vast contract)
vastrechtStroom = vastrechtStroomMaand * 12
vastrechtGas = vastrechtGasMaand * 12
kostenVastrecht = vastrechtStroom + vastrechtGas

// SUBTOTAAL LEVERANCIER
subtotaalLeverancier = kostenElektriciteit + kostenGas + kostenVastrecht
// Let op: kostenElektriciteit kan NEGATIEF zijn bij overschot!
```

#### 3. ENERGIEBELASTING (excl. BTW)
```javascript
// EXACT HETZELFDE als vast contract
// Gebruikt nettoKwh (na saldering)
// Schijventarief elektriciteit + gas
// Vermindering EB voor kleinverbruik
```

#### 4. NETBEHEERKOSTEN (excl. BTW)
```javascript
// EXACT HETZELFDE als vast contract
// Vaste bedragen per jaar
```

#### 5. TOTAAL BEREKENEN
```javascript
// EXACT HETZELFDE als vast contract
totaalJaarExclBtw = subtotaalLeverancier + subtotaalEB + subtotaalNetbeheer
btw = totaalJaarExclBtw * 0.21
totaalJaarInclBtw = totaalJaarExclBtw + btw
maandbedragInclBtw = totaalJaarInclBtw / 12  // ← DIT WORDT GETOOND
```

---

## 🔑 KERNVERSCHILLEN VAST vs DYNAMISCH

| Aspect | VAST | DYNAMISCH |
|--------|------|-----------|
| **Elektriciteit tarief** | Vast in contract (bijv. €0.22/kWh) | Marktprijs + Opslag (bijv. €0.13991 + €0.02) |
| **Gas tarief** | Vast in contract (bijv. €0.85/m³) | Marktprijs + Opslag (bijv. €0.28500 + €0.05) |
| **Teruglevering** | Vast tarief (bijv. €0.08/kWh) | Marktprijs + Opslag (bijv. €0.11602 - €0.01) |
| **Marktprijzen** | Geen | 30-dagen gemiddelde (EnergyZero) |
| **Saldering** | Identiek | Identiek |
| **Energiebelasting** | Identiek | Identiek |
| **Netbeheer** | Identiek | Identiek |
| **BTW** | Identiek (21%) | Identiek (21%) |
| **Vastrecht** | Identiek | Identiek |

---

## 📐 REKENVOORBEELD

### Invoer
- Elektriciteit normaal: 2000 kWh/jaar
- Elektriciteit dal: 1000 kWh/jaar  
- Gas: 800 m³/jaar
- Teruglevering: 500 kWh/jaar
- Aansluitwaarde: 3x25A / G6
- Postcode: Liander gebied

### VAST CONTRACT
```
LEVERANCIER:
  Elektriciteit: (2000-250) * 0.22 + (1000-250) * 0.18 = €520,00
  Gas: 800 * 0.85 = €680,00
  Vastrecht stroom: 4 * 12 = €48,00
  Vastrecht gas: 4 * 12 = €48,00
  Teruglevering: 500 * 0.08 = -€40,00
  Subtotaal: €1.256,00

ENERGIEBELASTING:
  Elektriciteit: 2500 * 0.14294 = €357,35
  Gas: 800 * 0.65032 = €520,26
  Vermindering: -€553,64
  Subtotaal: €323,97

NETBEHEER:
  Elektriciteit: €430,00
  Gas: €245,00
  Subtotaal: €675,00

TOTAAL EXCL. BTW: €2.254,97
BTW (21%): €473,54
TOTAAL INCL. BTW: €2.728,51

MAANDBEDRAG: €227,38
```

### DYNAMISCH CONTRACT (met marktprijzen €0.13991 dag / €0.09213 nacht / €0.28500 gas)
```
LEVERANCIER:
  Marktprijs dag: €0.13991
  Marktprijs nacht: €0.09213
  Opslag: €0.02
  
  Elektriciteit dag: (2000-250) * (0.13991+0.02) = €279,84
  Elektriciteit dal: (1000-250) * (0.09213+0.02) = €84,10
  Gas: 800 * (0.28500+0.05) = €268,00
  Vastrecht stroom: 4 * 12 = €48,00
  Vastrecht gas: 4 * 12 = €48,00
  Subtotaal: €727,94

ENERGIEBELASTING: €323,97 (zelfde)
NETBEHEER: €675,00 (zelfde)

TOTAAL EXCL. BTW: €1.726,91
BTW (21%): €362,65
TOTAAL INCL. BTW: €2.089,56

MAANDBEDRAG: €174,13  ← €53 goedkoper!
```

---

## ⚠️ BELANGRIJKE OPMERKINGEN

### 1. SALDERING
- Teruglevering wordt EERST afgetrokken van verbruik
- Alleen NETTO verbruik wordt gebruikt voor tarieven EN energiebelasting
- Bij dubbeltarief: 50/50 verdeling van teruglevering

### 2. OVERSCHOT TERUGLEVERING (dynamisch)
- Als teruglevering > verbruik → negatieve kosten!
- Overschot wordt tegen teruglevertarief "uitbetaald"
- `kostenElektriciteit` kan negatief zijn

### 3. MARKTPRIJZEN (dynamisch)
- Worden ELKE KEER opgehaald bij berekening
- 30-dagen gemiddelde van EnergyZero
- Betekent: **maandbedrag verandert continu!**

### 4. VASTRECHT
- Altijd APART voor stroom en gas
- Wordt vermenigvuldigd met 12 (per jaar)
- Bij geen gas: vastrechtGas = €0

### 5. ENERGIEBELASTING
- Schijventarief op NETTO verbruik (na saldering)
- Vermindering €553,64 alleen voor kleinverbruik
- Grootverbruik krijgt geen vermindering

### 6. NETBEHEER
- Vaste bedragen PER JAAR
- Afhankelijk van netbeheerder + aansluitwaarde
- Niet afhankelijk van verbruik!

---

## 📍 WAAR BEREKENINGEN WORDEN GEDAAN

### Hoofd berekening (voor API en intern gebruik):
- `src/lib/bereken-contract-internal.ts` - **MASTER BEREKENING**
  - Gebruikt door aanvraag API
  - Gebruikt door email generatie

### Dynamische contract specifiek:
- `src/lib/dynamic-pricing/calculate-dynamic-contract.ts`
  - Pure functie voor dynamische berekening
  - Wordt aangeroepen door master berekening

### Marktprijzen:
- `src/lib/dynamic-pricing/database.ts` - `getCurrentDynamicPrices()`
  - Haalt 30-dagen gemiddelde op
  - Uit tabel: `energieprijzen_historie`

### API endpoints:
- `src/app/api/energie/bereken-contract/route.ts`
  - Publieke API voor calculator
  - Gebruikt master berekening
  
- `src/app/api/aanvragen/create/route.ts`
  - Berekent maandbedrag bij aanvraag
  - Slaat breakdown op in database

---

## ✅ CONCLUSIE

**Beide contracttypen** gebruiken EXACT DEZELFDE FORMULE:

```
Maandbedrag = (Leverancier + Energiebelasting + Netbeheer + BTW) / 12
```

**Het enige verschil** is hoe de leverancierskosten worden berekend:
- **VAST**: Vaste tarieven uit database
- **DYNAMISCH**: Marktprijs (30d gemiddelde) + Opslag

Alle andere componenten (energiebelasting, netbeheer, BTW, vastrecht) zijn IDENTIEK!

