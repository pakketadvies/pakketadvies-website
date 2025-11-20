# 📊 SEPA GREEN OFFERTE ANALYSE - EXACTE BEREKENING

## 📄 BRON
Offerte Sepa Green Zakelijk 3 jaar vast (J)
- **Datum**: 20-11-2025
- **Offerte ID**: 7336331
- **Klant**: PakketAdvies B.V.
- **Leveringsadres**: Stavangerweg 13, 9723JC Groningen

---

## 📐 VERBRUIKSGEGEVENS

### **Elektriciteit**
- **EAN-code**: 871694840003992488
- **Jaarverbruik**: 150.000 kWh
- **Dubbele meter**: Nee (enkele meter)
- **Aansluiting**: 3x80A (grootverbruik)
- **Netbeheerder**: Enexis

### **Gas**
- **EAN-code**: 871694840010567495
- **Jaarverbruik**: 50.000 m³
- **Aansluiting**: G25
- **Netbeheerder**: Enexis
- **Gasregio**: Regio 4 (G2)

---

## 💰 COMPLETE PRIJSOPBOUW (uit offerte)

### **STROOM - Breakdown**

#### **1. LEVERANCIERSKOSTEN**
```
Leveringskosten enkel:
├─ 150.000 kWh × €0,12294/kWh = €18.441,00
└─ Vaste leveringskosten: €99,00/jaar

TOTAAL LEVERANCIER: €18.540,00
```

#### **2. OVERHEIDSHEFFINGEN (Energiebelasting)**
```
⚠️ GROOTVERBRUIK (3x80A) - Specifieke schijven:

Schijf 1: 0 - 2.900 kWh
├─ 2.900 kWh × €0,10154/kWh = €294,47

Schijf 2: 2.901 - 10.000 kWh
├─ 7.100 kWh × €0,10154/kWh = €720,93

Schijf 3: 10.001 - 50.000 kWh
├─ 40.000 kWh × €0,06937/kWh = €2.774,80

Schijf 4: 50.001 - 150.000 kWh
├─ 100.000 kWh × €0,03868/kWh = €3.868,00

TOTAAL ENERGIEBELASTING: €7.658,20
```

#### **3. VERMINDERING ENERGIEBELASTING**
```
Vermindering: -€524,95
(Alleen voor kleinverbruik component tot bepaalde grens)
```

#### **4. NETBEHEERKOSTEN**
```
Enexis 3x80A:
└─ Totaal: €4.055,59/jaar
   (Inclusief vastrecht + transport + systeemdiensten + meetkosten)
```

#### **STROOM TOTAAL**
```
Leverancier:              €18.540,00
+ Energiebelasting:       €7.658,20
- Vermindering EB:        -€524,95
+ Netbeheerkosten:        €4.055,59
─────────────────────────────────
TOTAAL STROOM (excl BTW): €29.728,84
```

---

### **GAS - Breakdown**

#### **1. LEVERANCIERSKOSTEN**
```
Leveringskosten gasregio 4 (G2):
├─ 50.000 m³ × €0,44746/m³ = €22.373,00
└─ Vaste leveringskosten: €99,00/jaar

TOTAAL LEVERANCIER: €22.472,00
```

#### **2. OVERHEIDSHEFFINGEN (Energiebelasting)**
```
Schijf 1: 0 - 1.000 m³
├─ 1.000 m³ × €0,57816/m³ = €578,16

Schijf 2: 1.001 - 50.000 m³
├─ 49.000 m³ × €0,57816/m³ = €28.329,84

TOTAAL ENERGIEBELASTING: €28.908,00
```

#### **3. NETBEHEERKOSTEN**
```
Enexis G25:
└─ Totaal: €1.262,43/jaar
   (Inclusief vastrecht + transport + systeemdiensten + meetkosten)
```

#### **GAS TOTAAL**
```
Leverancier:              €22.472,00
+ Energiebelasting:       €28.908,00
+ Netbeheerkosten:        €1.262,43
─────────────────────────────────
TOTAAL GAS (excl BTW):    €52.642,43
```

---

## 💵 EINDTOTAAL

```
Stroom (excl BTW):        €29.728,84
Gas (excl BTW):           €52.642,43
─────────────────────────────────
SUBTOTAAL (excl BTW):     €82.371,26

BTW (21%):                €17.297,97
─────────────────────────────────
TOTAAL (incl BTW):        €99.669,23

Maandbedrag (excl BTW):   €6.864,27
Maandbedrag (incl BTW):   €8.305,77
```

---

## 🔍 BELANGRIJKE INZICHTEN

### **1. ENERGIEBELASTING SCHIJVEN (2025)**

#### **Elektriciteit - Grootverbruik (3x80A)**
```sql
-- Voor deze offerte gelden deze schijven:
Schijf 1: 0 - 2.900 kWh        → €0,10154/kWh
Schijf 2: 2.901 - 10.000 kWh   → €0,10154/kWh  
Schijf 3: 10.001 - 50.000 kWh  → €0,06937/kWh
Schijf 4: >50.000 kWh          → €0,03868/kWh

⚠️ DIT IS ANDERS dan standaard schijven!
Waarschijnlijk specifiek voor grootverbruik 3x80A
```

#### **Gas**
```sql
Schijf 1: 0 - 1.000 m³     → €0,57816/m³
Schijf 2: >1.000 m³        → €0,57816/m³

⚠️ Beide schijven ZELFDE tarief in 2025!
```

### **2. NETBEHEERKOSTEN PER AANSLUITING**

#### **Elektriciteit - Enexis**
```
3x80A (grootverbruik):
└─ €4.055,59/jaar
   (Dit is een all-in bedrag voor deze aansluiting)
```

#### **Gas - Enexis**
```
G25 (industrie):
└─ €1.262,43/jaar
   (Dit is een all-in bedrag voor deze aansluiting)
```

### **3. ODE**
```
⚠️ ODE niet apart vermeld in offerte
Waarschijnlijk €0,00 in 2025 of verwerkt in EB tarieven
```

### **4. TERUGLEVERING**
```
Terugleververgoeding: €0,11000/kWh
(50% van normaaltarief vanaf 2027)

Terugleverkosten: 
- Per kWh voor kleinverbruik met teruglevertelwerken
- Vaste kosten verhoging €500/jaar (excl BTW) voor kleinverbruik zonder telwerken
```

---

## 🗄️ DATABASE SEED DATA (2025)

### **1. Overheidstarieven 2025**
```sql
INSERT INTO tarieven_overheid (
  jaar,
  
  -- Energiebelasting Elektriciteit - Grootverbruik (3x80A voorbeeld)
  eb_elektriciteit_gv_schijf1_max, eb_elektriciteit_gv_schijf1,
  eb_elektriciteit_gv_schijf2_max, eb_elektriciteit_gv_schijf2,
  eb_elektriciteit_gv_schijf3_max, eb_elektriciteit_gv_schijf3,
  eb_elektriciteit_gv_schijf4, -- >50.000 kWh
  
  -- Energiebelasting Gas
  eb_gas_schijf1_max, eb_gas_schijf1,
  eb_gas_schijf2,
  gas_omrekenfactor,
  
  -- ODE
  ode_elektriciteit, ode_gas,
  
  -- BTW
  btw_percentage,
  
  -- Vermindering (alleen kleinverbruik)
  vermindering_eb_elektriciteit, vermindering_eb_gas
  
) VALUES (
  2025,
  
  -- EB Elektriciteit Grootverbruik
  2900, 0.10154,    -- Schijf 1: 0-2.900 kWh
  10000, 0.10154,   -- Schijf 2: 2.901-10.000 kWh
  50000, 0.06937,   -- Schijf 3: 10.001-50.000 kWh
  0.03868,          -- Schijf 4: >50.000 kWh
  
  -- EB Gas (beide schijven zelfde tarief in 2025!)
  1000, 0.57816,    -- Schijf 1: 0-1.000 m³ (€0,57816/m³)
  0.57816,          -- Schijf 2: >1.000 m³ (€0,57816/m³)
  10.3158,          -- Omrekenfactor m³ naar kWh (standaard)
  
  -- ODE (€0,00 in 2025 of verwerkt in EB)
  0.00000, 0.00000,
  
  -- BTW
  21.00,
  
  -- Vermindering EB
  524.95, 0.00  -- Alleen elektriciteit kleinverbruik component
);
```

### **2. Enexis Netbeheertarieven 2025**
```sql
-- Elektriciteit 3x80A
INSERT INTO netbeheer_tarieven_elektriciteit (
  netbeheerder_id, 
  jaar, 
  aansluitwaarde_id,
  vastrecht,
  transport_normaal,
  transport_dal,
  systeemdiensten,
  capaciteitstarief,
  capaciteitstarief_drempel,
  congestietarief,
  meetkosten_slim,
  meetkosten_traditioneel
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_elektriciteit WHERE code = '3x80A'),
  4055.59, -- All-in tarief uit offerte
  0, 0, 0, -- Allemaal verwerkt in vastrecht
  NULL, 50000, -- Geen capaciteitstarief in deze offerte
  0, -- Geen congestietarief
  0, 0 -- Meetkosten verwerkt in vastrecht
);

-- Gas G25
INSERT INTO netbeheer_tarieven_gas (
  netbeheerder_id,
  jaar,
  aansluitwaarde_id,
  vastrecht,
  transport,
  systeemdiensten,
  meetkosten_slim,
  meetkosten_traditioneel
) VALUES (
  (SELECT id FROM netbeheerders WHERE code = 'ENEXIS'),
  2025,
  (SELECT id FROM aansluitwaarden_gas WHERE code = 'G25'),
  1262.43, -- All-in tarief uit offerte
  0, 0, -- Verwerkt in vastrecht
  0, 0 -- Meetkosten verwerkt in vastrecht
);
```

---

## 🧮 VERIFICATIE BEREKENING

### **Stroom**
```javascript
// Test berekening
const testStroom = {
  verbruik: 150000, // kWh
  
  leverancier: 150000 * 0.12294 + 99,
  // = 18441 + 99 = 18540 ✅
  
  energiebelasting: 
    (2900 * 0.10154) +      // = 294.47
    (7100 * 0.10154) +      // = 720.93
    (40000 * 0.06937) +     // = 2774.80
    (100000 * 0.03868),     // = 3868.00
  // = 7658.20 ✅
  
  vermindering: 524.95,     // ✅
  netbeheer: 4055.59,       // ✅
  
  totaal: 18540 + 7658.20 - 524.95 + 4055.59
  // = 29728.84 ✅ KLOPT!
};
```

### **Gas**
```javascript
const testGas = {
  verbruik: 50000, // m³
  
  leverancier: 50000 * 0.44746 + 99,
  // = 22373 + 99 = 22472 ✅
  
  energiebelasting:
    (1000 * 0.57816) +      // = 578.16
    (49000 * 0.57816),      // = 28329.84
  // = 28908.00 ✅
  
  netbeheer: 1262.43,       // ✅
  
  totaal: 22472 + 28908 + 1262.43
  // = 52642.43 ✅ KLOPT!
};
```

---

## ⚠️ BIJZONDERHEDEN VOOR IMPLEMENTATIE

### **1. Energiebelasting heeft 4 schijven voor grootverbruik**
In plaats van standaard 2 schijven, heeft deze grootverbruik aansluiting 4 schijven.
Dit kan afhankelijk zijn van:
- Type aansluiting (3x80A)
- Netbeheerder regio
- Contracttype

**Oplossing**: Database moet flexibele schijven ondersteunen

### **2. Gas EB tarief is gelijk voor beide schijven**
Normaal is schijf 2 lager, maar in 2025 zijn ze gelijk.

**Oplossing**: Beide schijven toch in database opnemen voor toekomstige jaren

### **3. Netbeheerkosten zijn "all-in"**
Sepa Green geeft 1 totaalbedrag zonder breakdown.

**Oplossing**: 
- In admin: Optie voor "all-in" netbeheertarief
- Of: Breakdown invoeren op basis van Enexis officiële tarieven

### **4. ODE is €0,00 of verwerkt**
ODE wordt niet apart vermeld.

**Oplossing**: ODE velden behouden maar €0,00 invullen voor 2025

### **5. Teruglevering heeft meerdere scenario's**
Afhankelijk van meter type en periode (voor/na 2027).

**Oplossing**: Teruglevering logica moet rekening houden met:
- Wel/geen teruglevertelwerken
- Datum contract (voor/na 2027)
- Klein vs groot verbruik

---

## ✅ CONCLUSIE

De offerte laat zien dat de berekening bestaat uit:

1. ✅ **Leverancierstarieven** (per kWh/m³ + vastrecht)
2. ✅ **Energiebelasting** (met schijven)
3. ✅ **Vermindering EB** (alleen kleinverbruik component)
4. ✅ **Netbeheerkosten** (all-in per aansluiting)
5. ✅ **BTW** (21% over totaal)

**Geen capaciteitstarief** in deze offerte (mogelijk niet van toepassing of verwerkt in netbeheertarief).

---

## 🚀 VOLGENDE STAPPEN

Wil je dat ik nu implementeer:
1. ✅ Database schema (alle tabellen)
2. ✅ Seed data 2025 (op basis van deze offerte)
3. ✅ Berekeningslogica
4. ✅ Admin interface
5. ✅ Contract formulieren

Ik heb nu alle data! 🎯

