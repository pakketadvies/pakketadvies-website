# 📊 ENERGIEPRIJS BEREKENING SYSTEEM - IMPLEMENTATIE VOORSTEL

## 🎯 DOEL
Een flexibel systeem waarbij:
- **Contract tarieven** (vast, dynamisch, maatwerk) per leverancier instelbaar zijn
- **Belastingen & heffingen** centraal beheerd en jaarlijks aanpasbaar
- **Netbeheerkosten** per regio/netbeheerder configureerbaar
- **Automatische berekening** van maand- en jaarbedragen

---

## 📐 COMPONENTEN VAN EEN ENERGIEREKENING

### **1. LEVERANCIER TARIEVEN** (Per contract instelbaar)
```
✅ Variabel - Per contract verschillend:
├─ Elektriciteit normaal tarief (€/kWh)
├─ Elektriciteit dal tarief (€/kWh) 
├─ Gas tarief (€/m³)
└─ Vastrecht leverancier (€/maand)
```

### **2. ENERGIEBELASTING** (Centraal beheerd - Jaarlijks aanpasbaar)
```
🏛️ Overheid - Standaard per jaar:
├─ Energiebelasting elektriciteit (€/kWh)
│  ├─ Schijf 1: 0-10.000 kWh
│  ├─ Schijf 2: 10.000-50.000 kWh
│  └─ Schijf 3: >50.000 kWh
├─ Energiebelasting gas (€/m³)
│  ├─ Schijf 1: 0-5.000 m³
│  └─ Schijf 2: >5.000 m³
└─ ODE (Opslag Duurzame Energie) (€/kWh + €/m³)
```

### **3. BTW** (Centraal beheerd)
```
💰 Belastingdienst:
└─ BTW percentage (21% of 9% voor kleinverbruik)
```

### **4. NETBEHEERKOSTEN** (Per netbeheerder - Jaarlijks aanpasbaar)
```
🔌 Netwerkbedrijf (bijv. Enexis, Liander):
├─ Vastrecht elektriciteit (€/jaar)
├─ Vastrecht gas (€/jaar)
├─ Transportkosten elektriciteit (€/kWh)
└─ Transportkosten gas (€/m³)
```

### **5. OVERIGE KOSTEN** (Optioneel)
```
📋 Extra:
├─ Vermindering energiebelasting (€ korting)
├─ Korting/actie van leverancier (€ of %)
└─ Administratiekosten (€/maand)
```

---

## 🗄️ DATABASE STRUCTUUR

### **Tabel: `tarieven_overheid`** (Jaarlijks aanpasbaar)
```sql
CREATE TABLE tarieven_overheid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jaar INTEGER NOT NULL UNIQUE,
  
  -- Energiebelasting Elektriciteit (per kWh)
  eb_elektriciteit_schijf1_max INTEGER DEFAULT 10000,  -- Max kWh schijf 1
  eb_elektriciteit_schijf1 DECIMAL(10,6) NOT NULL,     -- €/kWh
  eb_elektriciteit_schijf2_max INTEGER DEFAULT 50000,  -- Max kWh schijf 2
  eb_elektriciteit_schijf2 DECIMAL(10,6) NOT NULL,     -- €/kWh
  eb_elektriciteit_schijf3 DECIMAL(10,6) NOT NULL,     -- €/kWh
  
  -- Energiebelasting Gas (per m³)
  eb_gas_schijf1_max INTEGER DEFAULT 5000,             -- Max m³ schijf 1
  eb_gas_schijf1 DECIMAL(10,6) NOT NULL,               -- €/m³
  eb_gas_schijf2 DECIMAL(10,6) NOT NULL,               -- €/m³
  
  -- ODE (Opslag Duurzame Energie)
  ode_elektriciteit DECIMAL(10,6) NOT NULL,            -- €/kWh
  ode_gas DECIMAL(10,6) NOT NULL,                      -- €/m³
  
  -- BTW
  btw_percentage DECIMAL(5,2) DEFAULT 21.00,           -- %
  btw_kleinverbruik_percentage DECIMAL(5,2) DEFAULT 9.00, -- % (optioneel)
  btw_kleinverbruik_drempel INTEGER DEFAULT 10000,     -- kWh grens
  
  -- Vermindering energiebelasting
  vermindering_eb_elektriciteit DECIMAL(10,2) DEFAULT 0, -- € per jaar
  vermindering_eb_gas DECIMAL(10,2) DEFAULT 0,           -- € per jaar
  
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snelle jaar lookup
CREATE INDEX idx_tarieven_overheid_jaar ON tarieven_overheid(jaar);
```

### **Tabel: `netbeheerders`**
```sql
CREATE TABLE netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam VARCHAR(100) NOT NULL,
  regio VARCHAR(200),
  postcode_gebieden TEXT[], -- Array van postcode ranges
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Tabel: `netbeheer_tarieven`** (Per jaar + netbeheerder)
```sql
CREATE TABLE netbeheer_tarieven (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID REFERENCES netbeheerders(id),
  jaar INTEGER NOT NULL,
  
  -- Vastrecht
  vastrecht_elektriciteit_laag DECIMAL(10,2) NOT NULL,  -- €/jaar (kleinverbruik)
  vastrecht_elektriciteit_hoog DECIMAL(10,2) NOT NULL,  -- €/jaar (grootverbruik)
  vastrecht_gas DECIMAL(10,2) NOT NULL,                 -- €/jaar
  
  -- Transport/Netkosten (variabel)
  transport_elektriciteit DECIMAL(10,6) NOT NULL,       -- €/kWh
  transport_gas DECIMAL(10,6) NOT NULL,                 -- €/m³
  
  -- Grootverbruik drempel
  grootverbruik_drempel INTEGER DEFAULT 50000,          -- kWh
  
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(netbeheerder_id, jaar)
);
```

### **Update: `contract_details_vast` / `dynamisch` / `maatwerk`**
Huidige structure blijft, maar voeg toe:
```sql
-- Toevoegen aan bestaande details tabellen:
ALTER TABLE contract_details_vast ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
ALTER TABLE contract_details_dynamisch ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
ALTER TABLE contract_details_maatwerk ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
```

---

## 🧮 BEREKENINGSLOGICA

### **Formule: TOTALE MAANDKOSTEN**

```javascript
// VAST CONTRACT
const berekenVastContract = (contract, verbruikElektriciteit, verbruikGas, jaar = 2025) => {
  // 1. TARIEVEN LEVERANCIER (uit contract)
  const leverancierKosten = 
    (verbruikElektriciteit * contract.tarief_elektriciteit_normaal) +
    (verbruikGas * contract.tarief_gas) +
    (contract.vastrecht_maand * 12);
  
  // 2. ENERGIEBELASTING (uit tarieven_overheid)
  const ebElektriciteit = berekenEnergiebelasting(
    verbruikElektriciteit, 
    'elektriciteit', 
    jaar
  );
  const ebGas = berekenEnergiebelasting(
    verbruikGas, 
    'gas', 
    jaar
  );
  
  // 3. ODE (uit tarieven_overheid)
  const ode = 
    (verbruikElektriciteit * tarieven.ode_elektriciteit) +
    (verbruikGas * tarieven.ode_gas);
  
  // 4. NETBEHEERKOSTEN (uit netbeheer_tarieven)
  const netbeheerKosten = berekenNetbeheerKosten(
    verbruikElektriciteit,
    verbruikGas,
    contract.netbeheerder_id,
    jaar
  );
  
  // 5. SUBTOTAAL (excl BTW)
  const subtotaal = leverancierKosten + ebElektriciteit + ebGas + ode + netbeheerKosten;
  
  // 6. VERMINDERING ENERGIEBELASTING
  const vermindering = tarieven.vermindering_eb_elektriciteit + tarieven.vermindering_eb_gas;
  
  // 7. BTW
  const btwPercentage = bepaalBTWPercentage(verbruikElektriciteit, jaar);
  const btw = (subtotaal - vermindering) * (btwPercentage / 100);
  
  // 8. TOTAAL
  const totaalJaar = subtotaal - vermindering + btw;
  const totaalMaand = totaalJaar / 12;
  
  return {
    totaalMaand: Math.round(totaalMaand * 100) / 100,
    totaalJaar: Math.round(totaalJaar * 100) / 100,
    breakdown: {
      leverancier: leverancierKosten,
      energiebelasting: ebElektriciteit + ebGas,
      ode: ode,
      netbeheer: netbeheerKosten,
      vermindering: -vermindering,
      btw: btw
    }
  };
};

// HELPER: Energiebelasting berekenen (schijven)
const berekenEnergiebelasting = (verbruik, type, jaar) => {
  const tarieven = getTarievenOverheid(jaar);
  
  if (type === 'elektriciteit') {
    const schijf1 = Math.min(verbruik, tarieven.eb_elektriciteit_schijf1_max);
    const schijf2 = Math.min(
      Math.max(0, verbruik - tarieven.eb_elektriciteit_schijf1_max),
      tarieven.eb_elektriciteit_schijf2_max - tarieven.eb_elektriciteit_schijf1_max
    );
    const schijf3 = Math.max(0, verbruik - tarieven.eb_elektriciteit_schijf2_max);
    
    return (
      (schijf1 * tarieven.eb_elektriciteit_schijf1) +
      (schijf2 * tarieven.eb_elektriciteit_schijf2) +
      (schijf3 * tarieven.eb_elektriciteit_schijf3)
    );
  } else {
    const schijf1 = Math.min(verbruik, tarieven.eb_gas_schijf1_max);
    const schijf2 = Math.max(0, verbruik - tarieven.eb_gas_schijf1_max);
    
    return (
      (schijf1 * tarieven.eb_gas_schijf1) +
      (schijf2 * tarieven.eb_gas_schijf2)
    );
  }
};

// HELPER: Netbeheerkosten
const berekenNetbeheerKosten = (verbruikElektriciteit, verbruikGas, netbeheerderId, jaar) => {
  const tarieven = getNetbeheerTarieven(netbeheerderId, jaar);
  
  // Bepaal vastrecht op basis van verbruik
  const vastrechtElektriciteit = verbruikElektriciteit > tarieven.grootverbruik_drempel
    ? tarieven.vastrecht_elektriciteit_hoog
    : tarieven.vastrecht_elektriciteit_laag;
  
  return (
    vastrechtElektriciteit +
    tarieven.vastrecht_gas +
    (verbruikElektriciteit * tarieven.transport_elektriciteit) +
    (verbruikGas * tarieven.transport_gas)
  );
};

// HELPER: BTW percentage bepalen
const bepaalBTWPercentage = (verbruikElektriciteit, jaar) => {
  const tarieven = getTarievenOverheid(jaar);
  
  // Kleinverbruikers (<10.000 kWh) krijgen soms verlaagd tarief
  return verbruikElektriciteit < tarieven.btw_kleinverbruik_drempel
    ? tarieven.btw_kleinverbruik_percentage
    : tarieven.btw_percentage;
};
```

---

## 📝 ADMIN INTERFACE AANPASSINGEN

### **Nieuwe Admin Pagina: "Tarieven & Belastingen"**

```
/admin/tarieven
├─ Overheidstarieven (per jaar)
│  ├─ Energiebelasting elektriciteit (3 schijven)
│  ├─ Energiebelasting gas (2 schijven)
│  ├─ ODE
│  ├─ BTW percentages
│  └─ Vermindering energiebelasting
│
├─ Netbeheerders
│  ├─ Lijst van netbeheerders
│  └─ Per netbeheerder tarieven per jaar
│
└─ Acties
   ├─ "Nieuw jaar toevoegen" (kopieert vorig jaar)
   └─ "Tarieven bewerken"
```

### **Contract Formulieren Aanpassen**
```
Vast/Dynamisch/Maatwerk Formulier:
├─ [Bestaande velden]
├─ **NIEUW:** Netbeheerder (dropdown)
└─ Note: "Belastingen en heffingen worden automatisch berekend"
```

---

## 🚀 IMPLEMENTATIE STAPPEN

### **Stap 1: Database Migraties**
1. Maak `tarieven_overheid` tabel
2. Maak `netbeheerders` tabel
3. Maak `netbeheer_tarieven` tabel
4. Voeg `netbeheerder_id` toe aan contract details tabellen

### **Stap 2: Seed Data 2025**
1. Voeg overheidstarieven 2025 toe
2. Voeg Nederlandse netbeheerders toe (Enexis, Liander, Stedin, Westland Infra)
3. Voeg netbeheertarieven 2025 toe

### **Stap 3: Berekeningslogica**
1. Maak utility functies voor berekeningen
2. Update `/api/contracten/actief` endpoint met volledige berekening
3. Voeg breakdown toe aan response (voor transparantie)

### **Stap 4: Admin Interface**
1. Maak `/admin/tarieven` pagina
2. Update contract formulieren met netbeheerder selectie
3. Voeg "Kopieer naar volgend jaar" functionaliteit toe

### **Stap 5: Frontend Display**
1. Update resultaten pagina met prijsbreakdown
2. Toon "incl. belastingen en netbeheerkosten"
3. Optioneel: Tooltip met volledige breakdown

---

## 💡 VOORDELEN VAN DEZE AANPAK

✅ **Scheiding van concerns**
- Contract tarieven blijven per leverancier uniek
- Belastingen centraal beheerd (geen duplicatie)
- Netbeheerkosten per regio

✅ **Flexibiliteit**
- Jaarlijkse updates makkelijk toe te voegen
- Schijven energie belasting configureerbaar
- BTW regels aanpasbaar

✅ **Transparantie**
- Volledige breakdown beschikbaar
- Klant ziet waar kosten vandaan komen

✅ **Schaalbaarheid**
- Makkelijk nieuwe netbeheerders toevoegen
- Historische data behouden per jaar

✅ **Onderhoud**
- 1x per jaar tarieven updaten
- Geen aanpassingen aan contracten nodig

---

## 📊 VOORBEELD: 2025 TARIEVEN (TE VERIFIËREN)

```javascript
// Voorbeeld seed data (CONTROLEER OFFICIËLE CIJFERS)
const tarieven2025 = {
  jaar: 2025,
  
  // Energiebelasting Elektriciteit
  eb_elektriciteit_schijf1_max: 10000,
  eb_elektriciteit_schijf1: 0.12599, // €/kWh
  eb_elektriciteit_schijf2_max: 50000,
  eb_elektriciteit_schijf2: 0.03776, // €/kWh
  eb_elektriciteit_schijf3: 0.00304, // €/kWh
  
  // Energiebelasting Gas
  eb_gas_schijf1_max: 5000,
  eb_gas_schijf1: 0.51151, // €/m³
  eb_gas_schijf2: 0.15134, // €/m³
  
  // ODE
  ode_elektriciteit: 0.00000, // €/kWh (check actueel)
  ode_gas: 0.00000, // €/m³ (check actueel)
  
  // BTW
  btw_percentage: 21.00,
  btw_kleinverbruik_percentage: 21.00, // Was 9% in verleden
  btw_kleinverbruik_drempel: 10000,
  
  // Vermindering
  vermindering_eb_elektriciteit: 543.00, // €/jaar
  vermindering_eb_gas: 205.00, // €/jaar
};
```

---

## ❓ VRAGEN VOOR JOU

Om dit perfect te implementeren heb ik nodig:

1. **Uit de Sepa offerte PDF:**
   - Exacte bedragen per component
   - Welke netbeheerder?
   - Welk jaar zijn deze tarieven?

2. **Wensen:**
   - Moet de klant de volledige breakdown kunnen zien?
   - Wil je historische tarieven bewaren?
   - Moet het systeem automatisch het juiste jaar selecteren?

3. **Netbeheerders:**
   - Voor welke regio's bieden jullie energie aan?
   - Moeten we alle Nederlandse netbeheerders toevoegen?

---

Zodra je me de cijfers uit de offerte geeft, kan ik de exacte berekening implementeren! 🚀

