# 📊 COMPLETE ENERGIEPRIJS BEREKENING SYSTEEM - PROFESSIONEEL VOORSTEL

## 🎯 DOEL
Een volledig professioneel systeem dat rekening houdt met:
- ✅ Contract tarieven (vast/dynamisch/maatwerk)
- ✅ Energiebelasting met schijven
- ✅ Netbeheerkosten op basis van **aansluitwaarden**
- ✅ ODE (Opslag Duurzame Energie)
- ✅ BTW met regelgeving
- ✅ Terugleveringsvergoeding (zonnepanelen)
- ✅ Capaciteitstarieven
- ✅ Kortingen en acties

---

## 📐 VOLLEDIGE COMPONENTEN VAN EEN ENERGIEREKENING

### **1. LEVERANCIER TARIEVEN** (Per contract instelbaar)
```
✅ Variabel - Per contract verschillend:

ELEKTRICITEIT:
├─ Normaal tarief (€/kWh)
├─ Dal tarief (€/kWh) - optioneel voor dubbeluurmeter
├─ Teruglevering tarief (€/kWh) - voor zonnepanelen
└─ Vastrecht leverancier (€/maand)

GAS:
├─ Gas tarief (€/m³)
└─ Vastrecht gas leverancier (€/maand)

EXTRA:
├─ Administratiekosten (€/maand)
├─ Korting eerste jaar (€ of %)
└─ Welkomstbonus (€ eenmalig)
```

### **2. AANSLUITWAARDEN** (Bepaalt netbeheerkosten!)

#### **ELEKTRICITEIT - Aansluiting**
```
🔌 Aansluitwaarden elektriciteit:
├─ 1x25A (kleinverbruik)
├─ 1x35A (kleinverbruik)
├─ 1x40A (kleinverbruik)
├─ 3x25A (grootverbruik - meest voorkomend zakelijk)
├─ 3x35A (grootverbruik)
├─ 3x40A (grootverbruik)
├─ 3x50A (grootverbruik)
├─ 3x63A (grootverbruik)
├─ 3x80A (grootverbruik - industrie)
└─ >3x80A (zeer groot - maatwerk)

Impact: 
- Kleinverbruik (1-fase): Lager vastrecht netbeheer
- Grootverbruik (3-fase): Hoger vastrecht, mogelijk capaciteitstarief
```

#### **GAS - Aansluiting**
```
🔥 Aansluitwaarden gas:
├─ G4 (max 6 m³/uur) - kleinverbruik huishoudelijk
├─ G6 (max 10 m³/uur) - standaard zakelijk
├─ G10 (max 16 m³/uur) - middelgroot zakelijk
├─ G16 (max 25 m³/uur) - groot zakelijk
├─ G25 (max 40 m³/uur) - industrie
├─ G40 (max 65 m³/uur) - grote industrie
└─ >G40 - zeer groot verbruik

Impact:
- Hogere aansluiting = hoger vastrecht netbeheer
- Capaciteitstarief bij grootverbruik
```

### **3. ENERGIEBELASTING** (Centraal beheerd - Jaarlijks aanpasbaar)
```
🏛️ Overheid - Standaard per jaar:

ELEKTRICITEIT - Schijven per aansluiting:
├─ Kleinverbruik (1-fase, <3x25A):
│  ├─ Schijf 1: 0-10.000 kWh (€ X/kWh)
│  ├─ Schijf 2: 10.000-50.000 kWh (€ Y/kWh)
│  └─ Schijf 3: >50.000 kWh (€ Z/kWh)
│
└─ Grootverbruik (3-fase, >=3x25A):
   ├─ Schijf 1: 0-50.000 kWh (€ A/kWh)
   └─ Schijf 2: >50.000 kWh (€ B/kWh)

GAS - Schijven:
├─ Schijf 1: 0-170.000 kWh (€ X/kWh) - omgerekend van m³
└─ Schijf 2: >170.000 kWh (€ Y/kWh)

ODE (Opslag Duurzame Energie):
├─ ODE elektriciteit (€/kWh)
└─ ODE gas (€/kWh) - omgerekend

VERMINDERING:
├─ Vermindering EB elektriciteit (€/jaar) - alleen kleinverbruik
└─ Vermindering EB gas (€/jaar) - alleen kleinverbruik
```

### **4. NETBEHEERKOSTEN** (Per netbeheerder + aansluitwaarde)
```
🔌 Netwerkbedrijf tarieven:

ELEKTRICITEIT:
A. VASTRECHT (afhankelijk van aansluitwaarde):
   ├─ 1x25A: € X/jaar
   ├─ 1x35A: € Y/jaar
   ├─ 1x40A: € Z/jaar
   ├─ 3x25A: € A/jaar ⚠️ Meest voorkomend zakelijk
   ├─ 3x35A: € B/jaar
   ├─ 3x40A: € C/jaar
   ├─ 3x50A: € D/jaar
   ├─ 3x63A: € E/jaar
   ├─ 3x80A: € F/jaar
   └─ >3x80A: Op aanvraag

B. VARIABELE KOSTEN:
   ├─ Transportkosten (€/kWh)
   ├─ Systeemdienstentarief (€/kWh)
   ├─ Capaciteitstarief (€/kW/maand) - alleen grootverbruik >50.000 kWh
   │  └─ Gebaseerd op piekverbruik
   └─ Congestietarief (€/kWh) - indien van toepassing in regio

GAS:
A. VASTRECHT (afhankelijk van G-waarde):
   ├─ G4: € X/jaar
   ├─ G6: € Y/jaar
   ├─ G10: € Z/jaar
   ├─ G16: € A/jaar
   ├─ G25: € B/jaar
   ├─ G40: € C/jaar
   └─ >G40: Op aanvraag

B. VARIABELE KOSTEN:
   ├─ Transportkosten (€/m³)
   └─ Systeemdienstentarief (€/m³)

MEETKOSTEN:
├─ Slimme meter elektriciteit (€/jaar) - verplicht nieuwbouw
├─ Traditionele meter elektriciteit (€/jaar)
├─ Slimme meter gas (€/jaar)
└─ Traditionele meter gas (€/jaar)
```

### **5. CAPACITEITSTARIEF** (Grootverbruik >50.000 kWh/jaar)
```
⚡ Capaciteitstarief (maandelijks):
├─ Gebaseerd op piekverbruik per maand (kW)
├─ Berekening: hoogste kW in die maand × tarief
├─ Tarief: €/kW/maand (varieert per netbeheerder)
└─ Alleen voor grootverbruik aansluitingen (3x25A+)

Voorbeeld:
- Bedrijf heeft piek van 15 kW in januari
- Capaciteitstarief: €5/kW/maand
- Kosten januari: 15 × €5 = €75
```

### **6. TERUGLEVERINGSVERGOEDING** (Zonnepanelen)
```
☀️ Voor bedrijven met zonnepanelen:
├─ Teruglevering (kWh/jaar)
├─ Vergoeding leverancier (€/kWh)
├─ Saldering (t/m 2025 voor kleinverbruik)
└─ Vanaf 2025: geen saldering meer, alleen vergoeding

Berekening:
- Opwek zonnepanelen: X kWh
- Teruglevering aan net: Y kWh (overschot)
- Vergoeding: Y × tarief = €
- Trek af van totale kosten
```

### **7. BTW** (Centraal beheerd)
```
💰 Belastingdienst:
├─ Standaard BTW: 21%
├─ Kleinverbruik (<10.000 kWh elektriciteit EN <170.000 kWh gas):
│  └─ BTW op deel onder drempel kan lager zijn
└─ Grootverbruik: Altijd 21%

⚠️ BTW OVER:
✅ Leverancierskosten (incl. vastrecht)
✅ Energiebelasting (ná vermindering)
✅ ODE
✅ Netbeheerkosten
❌ NIET over vermindering EB (wordt afgetrokken voor BTW)
```

### **8. OVERIGE KOSTEN & KORTINGEN**
```
📋 Extra componenten:
├─ Administratiekosten leverancier (€/maand)
├─ Incassokosten (€/maand) - bij automatische incasso vaak €0
├─ Welkomstbonus (€ eenmalig, jaar 1)
├─ Korting eerste jaar (€ of %)
└─ Actiekorting (€/maand, bepaalde periode)
```

---

## 🗄️ DATABASE STRUCTUUR - VOLLEDIG

### **1. Tabel: `aansluitwaarden_elektriciteit`**
```sql
CREATE TABLE aansluitwaarden_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE, -- '1x25A', '3x25A', etc.
  naam VARCHAR(100) NOT NULL,
  fase INTEGER NOT NULL, -- 1 of 3
  ampere INTEGER NOT NULL, -- 25, 35, 40, 50, 63, 80
  max_vermogen_kw DECIMAL(10,2), -- Theoretisch max vermogen
  type VARCHAR(20) NOT NULL, -- 'kleinverbruik' of 'grootverbruik'
  beschrijving TEXT,
  volgorde INTEGER DEFAULT 0,
  actief BOOLEAN DEFAULT true
);

-- Seed data
INSERT INTO aansluitwaarden_elektriciteit (code, naam, fase, ampere, max_vermogen_kw, type, volgorde) VALUES
('1x25A', '1x25 Ampère', 1, 25, 5.75, 'kleinverbruik', 1),
('1x35A', '1x35 Ampère', 1, 35, 8.05, 'kleinverbruik', 2),
('1x40A', '1x40 Ampère', 1, 40, 9.20, 'kleinverbruik', 3),
('3x25A', '3x25 Ampère', 3, 25, 17.25, 'grootverbruik', 4),
('3x35A', '3x35 Ampère', 3, 35, 24.15, 'grootverbruik', 5),
('3x40A', '3x40 Ampère', 3, 40, 27.60, 'grootverbruik', 6),
('3x50A', '3x50 Ampère', 3, 50, 34.50, 'grootverbruik', 7),
('3x63A', '3x63 Ampère', 3, 63, 43.47, 'grootverbruik', 8),
('3x80A', '3x80 Ampère', 3, 80, 55.20, 'grootverbruik', 9);
```

### **2. Tabel: `aansluitwaarden_gas`**
```sql
CREATE TABLE aansluitwaarden_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE, -- 'G4', 'G6', 'G10', etc.
  naam VARCHAR(100) NOT NULL,
  max_debiet_m3_uur DECIMAL(10,2) NOT NULL, -- Max m³ per uur
  type VARCHAR(20) NOT NULL, -- 'kleinverbruik', 'grootverbruik', 'industrie'
  beschrijving TEXT,
  volgorde INTEGER DEFAULT 0,
  actief BOOLEAN DEFAULT true
);

-- Seed data
INSERT INTO aansluitwaarden_gas (code, naam, max_debiet_m3_uur, type, volgorde) VALUES
('G4', 'G4 (max 6 m³/uur)', 6, 'kleinverbruik', 1),
('G6', 'G6 (max 10 m³/uur)', 10, 'grootverbruik', 2),
('G10', 'G10 (max 16 m³/uur)', 16, 'grootverbruik', 3),
('G16', 'G16 (max 25 m³/uur)', 25, 'grootverbruik', 4),
('G25', 'G25 (max 40 m³/uur)', 40, 'industrie', 5),
('G40', 'G40 (max 65 m³/uur)', 65, 'industrie', 6);
```

### **3. Tabel: `tarieven_overheid`** (Uitgebreid)
```sql
CREATE TABLE tarieven_overheid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jaar INTEGER NOT NULL UNIQUE,
  
  -- ENERGIEBELASTING ELEKTRICITEIT - KLEINVERBRUIK
  eb_elektriciteit_kv_schijf1_max INTEGER DEFAULT 10000,
  eb_elektriciteit_kv_schijf1 DECIMAL(10,6) NOT NULL,
  eb_elektriciteit_kv_schijf2_max INTEGER DEFAULT 50000,
  eb_elektriciteit_kv_schijf2 DECIMAL(10,6) NOT NULL,
  eb_elektriciteit_kv_schijf3 DECIMAL(10,6) NOT NULL,
  
  -- ENERGIEBELASTING ELEKTRICITEIT - GROOTVERBRUIK
  eb_elektriciteit_gv_schijf1_max INTEGER DEFAULT 50000,
  eb_elektriciteit_gv_schijf1 DECIMAL(10,6) NOT NULL,
  eb_elektriciteit_gv_schijf2 DECIMAL(10,6) NOT NULL,
  
  -- ENERGIEBELASTING GAS (in kWh voor uniformiteit)
  eb_gas_schijf1_max INTEGER DEFAULT 170000, -- kWh
  eb_gas_schijf1 DECIMAL(10,6) NOT NULL, -- €/kWh
  eb_gas_schijf2 DECIMAL(10,6) NOT NULL, -- €/kWh
  gas_omrekenfactor DECIMAL(10,4) DEFAULT 10.3158, -- m³ naar kWh
  
  -- ODE (Opslag Duurzame Energie)
  ode_elektriciteit DECIMAL(10,6) NOT NULL,
  ode_gas DECIMAL(10,6) NOT NULL, -- per kWh
  
  -- BTW
  btw_percentage DECIMAL(5,2) DEFAULT 21.00,
  
  -- VERMINDERING (alleen kleinverbruik)
  vermindering_eb_elektriciteit DECIMAL(10,2) DEFAULT 0,
  vermindering_eb_gas DECIMAL(10,2) DEFAULT 0,
  
  -- DREMPELS
  kleinverbruik_elektriciteit_drempel INTEGER DEFAULT 10000, -- kWh voor BTW
  kleinverbruik_gas_drempel INTEGER DEFAULT 170000, -- kWh voor BTW
  
  actief BOOLEAN DEFAULT true,
  notities TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tarieven_overheid_jaar ON tarieven_overheid(jaar);
```

### **4. Tabel: `netbeheerders`**
```sql
CREATE TABLE netbeheerders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE, -- 'ENEXIS', 'LIANDER', etc.
  naam VARCHAR(100) NOT NULL,
  regio TEXT[], -- Array: ['Noord-Brabant', 'Limburg']
  postcode_ranges TEXT[], -- Array: ['5000-5999', '6000-6999']
  website VARCHAR(255),
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed data Nederlandse netbeheerders
INSERT INTO netbeheerders (code, naam, regio, website) VALUES
('ENEXIS', 'Enexis Netbeheer', ARRAY['Noord-Brabant', 'Limburg', 'Noord-Holland', 'Groningen', 'Friesland', 'Drenthe'], 'https://www.enexis.nl'),
('LIANDER', 'Liander', ARRAY['Noord-Holland', 'Zuid-Holland', 'Gelderland', 'Flevoland'], 'https://www.liander.nl'),
('STEDIN', 'Stedin', ARRAY['Zuid-Holland', 'Utrecht'], 'https://www.stedin.net'),
('WESTLAND', 'Westland Infra', ARRAY['Zuid-Holland'], 'https://www.westlandinfra.nl'),
('COTEQ', 'Coteq Netbeheer', ARRAY['Noord-Holland'], 'https://www.coteq.nl');
```

### **5. Tabel: `netbeheer_tarieven_elektriciteit`**
```sql
CREATE TABLE netbeheer_tarieven_elektriciteit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID REFERENCES aansluitwaarden_elektriciteit(id),
  
  -- VASTRECHT (per jaar, per aansluitwaarde)
  vastrecht DECIMAL(10,2) NOT NULL,
  
  -- VARIABELE KOSTEN
  transport_normaal DECIMAL(10,6) NOT NULL, -- €/kWh normaal
  transport_dal DECIMAL(10,6), -- €/kWh dal (optioneel)
  systeemdiensten DECIMAL(10,6) NOT NULL, -- €/kWh
  
  -- CAPACITEITSTARIEF (alleen grootverbruik >50.000 kWh)
  capaciteitstarief DECIMAL(10,4), -- €/kW/maand
  capaciteitstarief_drempel INTEGER DEFAULT 50000, -- kWh/jaar
  
  -- CONGESTIETARIEF (indien van toepassing)
  congestietarief DECIMAL(10,6) DEFAULT 0, -- €/kWh
  
  -- MEETKOSTEN
  meetkosten_slim DECIMAL(10,2) NOT NULL, -- €/jaar slimme meter
  meetkosten_traditioneel DECIMAL(10,2) NOT NULL, -- €/jaar traditionele meter
  
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(netbeheerder_id, jaar, aansluitwaarde_id)
);

CREATE INDEX idx_netbeheer_tarieven_e_jaar ON netbeheer_tarieven_elektriciteit(jaar);
CREATE INDEX idx_netbeheer_tarieven_e_netbeheerder ON netbeheer_tarieven_elektriciteit(netbeheerder_id);
```

### **6. Tabel: `netbeheer_tarieven_gas`**
```sql
CREATE TABLE netbeheer_tarieven_gas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  netbeheerder_id UUID REFERENCES netbeheerders(id) ON DELETE CASCADE,
  jaar INTEGER NOT NULL,
  aansluitwaarde_id UUID REFERENCES aansluitwaarden_gas(id),
  
  -- VASTRECHT (per jaar, per G-waarde)
  vastrecht DECIMAL(10,2) NOT NULL,
  
  -- VARIABELE KOSTEN
  transport DECIMAL(10,6) NOT NULL, -- €/m³
  systeemdiensten DECIMAL(10,6) NOT NULL, -- €/m³
  
  -- MEETKOSTEN
  meetkosten_slim DECIMAL(10,2) NOT NULL,
  meetkosten_traditioneel DECIMAL(10,2) NOT NULL,
  
  actief BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(netbeheerder_id, jaar, aansluitwaarde_id)
);

CREATE INDEX idx_netbeheer_tarieven_g_jaar ON netbeheer_tarieven_gas(jaar);
CREATE INDEX idx_netbeheer_tarieven_g_netbeheerder ON netbeheer_tarieven_gas(netbeheerder_id);
```

### **7. Update: Contract Details Tabellen**
```sql
-- Toevoegen aan bestaande contract details tabellen:

-- VAST
ALTER TABLE contract_details_vast ADD COLUMN aansluitwaarde_elektriciteit_id UUID REFERENCES aansluitwaarden_elektriciteit(id);
ALTER TABLE contract_details_vast ADD COLUMN aansluitwaarde_gas_id UUID REFERENCES aansluitwaarden_gas(id);
ALTER TABLE contract_details_vast ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
ALTER TABLE contract_details_vast ADD COLUMN tarief_teruglevering DECIMAL(10,6); -- Voor zonnepanelen

-- DYNAMISCH
ALTER TABLE contract_details_dynamisch ADD COLUMN aansluitwaarde_elektriciteit_id UUID REFERENCES aansluitwaarden_elektriciteit(id);
ALTER TABLE contract_details_dynamisch ADD COLUMN aansluitwaarde_gas_id UUID REFERENCES aansluitwaarden_gas(id);
ALTER TABLE contract_details_dynamisch ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
ALTER TABLE contract_details_dynamisch ADD COLUMN tarief_teruglevering DECIMAL(10,6);

-- MAATWERK
ALTER TABLE contract_details_maatwerk ADD COLUMN aansluitwaarde_elektriciteit_id UUID REFERENCES aansluitwaarden_elektriciteit(id);
ALTER TABLE contract_details_maatwerk ADD COLUMN aansluitwaarde_gas_id UUID REFERENCES aansluitwaarden_gas(id);
ALTER TABLE contract_details_maatwerk ADD COLUMN netbeheerder_id UUID REFERENCES netbeheerders(id);
ALTER TABLE contract_details_maatwerk ADD COLUMN tarief_teruglevering DECIMAL(10,6);
```

### **8. Tabel: `verbruik_profiel`** (Voor capaciteitstarief)
```sql
CREATE TABLE verbruik_profiel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_sessie_id UUID, -- Link naar calculator sessie
  user_id UUID, -- Optioneel: link naar user
  
  -- VERBRUIKSDATA
  verbruik_elektriciteit_jaar INTEGER NOT NULL,
  verbruik_gas_jaar INTEGER,
  
  -- PIEKVERBRUIK (schatting voor capaciteitstarief)
  piek_verbruik_kw DECIMAL(10,2), -- Geschat piekverbruik in kW
  piek_schatting_methode VARCHAR(50), -- 'gemiddeld', 'opgegeven', 'berekend'
  
  -- Als we piekverbruik niet weten, schatten op basis van:
  -- Formule: (jaarverbruik kWh / 8760 uur) × 3 = gemiddelde piek
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🧮 COMPLETE BEREKENINGSLOGICA

```typescript
// TYPE DEFINITIONS
interface BerekeningInput {
  // Contract info
  contract: Contract;
  contractType: 'vast' | 'dynamisch' | 'maatwerk';
  
  // Verbruik
  verbruikElektriciteitNormaal: number; // kWh/jaar
  verbruikElektriciteitDal?: number; // kWh/jaar
  verbruikGas: number; // m³/jaar
  terugleveringZonnepanelen?: number; // kWh/jaar
  
  // Aansluitingen (CRUCIAAL!)
  aansluitwaardeElektriciteit: string; // '3x25A'
  aansluitwaardeGas: string; // 'G6'
  
  // Netbeheerder
  netbeheerderId: string;
  
  // Piekverbruik (voor capaciteitstarief)
  piekVerbruikKW?: number; // Als bekend
  
  // Jaar
  jaar?: number; // Default: huidige jaar
  
  // Meter type
  slimmeMeterElektriciteit: boolean;
  slimmeMeterGas: boolean;
}

interface BerekeningOutput {
  totaalMaand: number;
  totaalJaar: number;
  breakdown: {
    leverancier: BedragBreakdown;
    energiebelasting: BedragBreakdown;
    ode: BedragBreakdown;
    netbeheer: BedragBreakdown;
    capaciteit: BedragBreakdown;
    btw: number;
    vermindering: number;
    teruglevering: number; // Negatief = korting
  };
  details: BerekentDetailInfo;
}

// ================================================
// HOOFDBEREKENING
// ================================================
const berekenTotaleKosten = async (input: BerekeningInput): Promise<BerekeningOutput> => {
  const jaar = input.jaar || new Date().getFullYear();
  
  // Haal alle benodigde tarieven op
  const tarievenOverheid = await getTarievenOverheid(jaar);
  const aansluitingElektriciteit = await getAansluitwaarde('elektriciteit', input.aansluitwaardeElektriciteit);
  const aansluitingGas = await getAansluitwaarde('gas', input.aansluitwaardeGas);
  const netbeheerTarievenE = await getNetbeheerTarievenElektriciteit(
    input.netbeheerderId, 
    jaar, 
    aansluitingElektriciteit.id
  );
  const netbeheerTarievenG = await getNetbeheerTarievenGas(
    input.netbeheerderId,
    jaar,
    aansluitingGas.id
  );
  
  // Bereken totaal elektriciteitsverbruik
  const totaalElektriciteit = input.verbruikElektriciteitNormaal + (input.verbruikElektriciteitDal || 0);
  
  // Omrekenen gas naar kWh
  const gasKWh = input.verbruikGas * tarievenOverheid.gas_omrekenfactor;
  
  // Bepaal of grootverbruik of kleinverbruik
  const isGrootverbruikElektriciteit = aansluitingElektriciteit.type === 'grootverbruik';
  const isGrootverbruikGas = aansluitingGas.type === 'grootverbruik' || aansluitingGas.type === 'industrie';
  
  // ============================================
  // 1. LEVERANCIERSKOSTEN
  // ============================================
  const leverancierKosten = berekenLeverancierKosten(input);
  
  // ============================================
  // 2. ENERGIEBELASTING
  // ============================================
  const energiebelasting = berekenEnergiebelasting(
    totaalElektriciteit,
    gasKWh,
    isGrootverbruikElektriciteit,
    isGrootverbruikGas,
    tarievenOverheid
  );
  
  // ============================================
  // 3. ODE (Opslag Duurzame Energie)
  // ============================================
  const ode = berekenODE(
    totaalElektriciteit,
    gasKWh,
    tarievenOverheid
  );
  
  // ============================================
  // 4. NETBEHEERKOSTEN
  // ============================================
  const netbeheerKosten = berekenNetbeheerKosten(
    totaalElektriciteit,
    input.verbruikGas,
    netbeheerTarievenE,
    netbeheerTarievenG,
    input.slimmeMeterElektriciteit,
    input.slimmeMeterGas
  );
  
  // ============================================
  // 5. CAPACITEITSTARIEF (alleen grootverbruik >50k kWh)
  // ============================================
  const capaciteitKosten = berekenCapaciteitstarief(
    totaalElektriciteit,
    input.piekVerbruikKW,
    netbeheerTarievenE,
    isGrootverbruikElektriciteit
  );
  
  // ============================================
  // 6. TERUGLEVERING (zonnepanelen)
  // ============================================
  const terugleveringVergoeding = berekenTeruglevering(
    input.terugleveringZonnepanelen || 0,
    input.contract.tarief_teruglevering || 0
  );
  
  // ============================================
  // 7. SUBTOTAAL (excl. BTW)
  // ============================================
  const subtotaal = 
    leverancierKosten.totaal +
    energiebelasting.totaal +
    ode.totaal +
    netbeheerKosten.totaal +
    capaciteitKosten.totaal;
  
  // ============================================
  // 8. VERMINDERING ENERGIEBELASTING
  // ============================================
  const vermindering = berekenVermindering(
    isGrootverbruikElektriciteit,
    isGrootverbruikGas,
    tarievenOverheid
  );
  
  // ============================================
  // 9. BTW (21% over subtotaal - vermindering)
  // ============================================
  const btw = (subtotaal - vermindering) * (tarievenOverheid.btw_percentage / 100);
  
  // ============================================
  // 10. TOTAAL
  // ============================================
  const totaalJaar = subtotaal - vermindering + btw - terugleveringVergoeding;
  const totaalMaand = totaalJaar / 12;
  
  return {
    totaalMaand: Math.round(totaalMaand * 100) / 100,
    totaalJaar: Math.round(totaalJaar * 100) / 100,
    breakdown: {
      leverancier: leverancierKosten,
      energiebelasting: energiebelasting,
      ode: ode,
      netbeheer: netbeheerKosten,
      capaciteit: capaciteitKosten,
      btw: Math.round(btw * 100) / 100,
      vermindering: -Math.round(vermindering * 100) / 100,
      teruglevering: -Math.round(terugleveringVergoeding * 100) / 100
    },
    details: {
      aansluitingElektriciteit: aansluitingElektriciteit.naam,
      aansluitingGas: aansluitingGas.naam,
      isGrootverbruik: isGrootverbruikElektriciteit || isGrootverbruikGas,
      jaar: jaar
    }
  };
};

// ================================================
// HELPER FUNCTIES
// ================================================

// 1. Leverancierskosten
const berekenLeverancierKosten = (input: BerekeningInput): BedragBreakdown => {
  const contract = input.contract;
  const details = contract.details; // vast/dynamisch/maatwerk specific
  
  const elektriciteitNormaal = input.verbruikElektriciteitNormaal * details.tarief_elektriciteit_normaal;
  const elektriciteitDal = (input.verbruikElektriciteitDal || 0) * (details.tarief_elektriciteit_dal || details.tarief_elektriciteit_normaal);
  const gas = input.verbruikGas * (details.tarief_gas || 0);
  const vastrecht = (details.vaste_kosten_maand || 0) * 12;
  
  return {
    totaal: elektriciteitNormaal + elektriciteitDal + gas + vastrecht,
    details: {
      'Elektriciteit normaal': elektriciteitNormaal,
      'Elektriciteit dal': elektriciteitDal,
      'Gas': gas,
      'Vastrecht': vastrecht
    }
  };
};

// 2. Energiebelasting met schijven
const berekenEnergiebelasting = (
  verbruikElektriciteitKWh: number,
  verbruikGasKWh: number,
  isGrootverbruikE: boolean,
  isGrootverbruikG: boolean,
  tarieven: TarievenOverheid
): BedragBreakdown => {
  
  // ELEKTRICITEIT
  let ebElektriciteit = 0;
  
  if (isGrootverbruikE) {
    // Grootverbruik: 2 schijven
    const schijf1 = Math.min(verbruikElektriciteitKWh, tarieven.eb_elektriciteit_gv_schijf1_max);
    const schijf2 = Math.max(0, verbruikElektriciteitKWh - tarieven.eb_elektriciteit_gv_schijf1_max);
    
    ebElektriciteit = 
      (schijf1 * tarieven.eb_elektriciteit_gv_schijf1) +
      (schijf2 * tarieven.eb_elektriciteit_gv_schijf2);
  } else {
    // Kleinverbruik: 3 schijven
    const schijf1 = Math.min(verbruikElektriciteitKWh, tarieven.eb_elektriciteit_kv_schijf1_max);
    const schijf2 = Math.min(
      Math.max(0, verbruikElektriciteitKWh - tarieven.eb_elektriciteit_kv_schijf1_max),
      tarieven.eb_elektriciteit_kv_schijf2_max - tarieven.eb_elektriciteit_kv_schijf1_max
    );
    const schijf3 = Math.max(0, verbruikElektriciteitKWh - tarieven.eb_elektriciteit_kv_schijf2_max);
    
    ebElektriciteit = 
      (schijf1 * tarieven.eb_elektriciteit_kv_schijf1) +
      (schijf2 * tarieven.eb_elektriciteit_kv_schijf2) +
      (schijf3 * tarieven.eb_elektriciteit_kv_schijf3);
  }
  
  // GAS (altijd 2 schijven, ongeacht klein/groot)
  const gasSchijf1 = Math.min(verbruikGasKWh, tarieven.eb_gas_schijf1_max);
  const gasSchijf2 = Math.max(0, verbruikGasKWh - tarieven.eb_gas_schijf1_max);
  
  const ebGas = 
    (gasSchijf1 * tarieven.eb_gas_schijf1) +
    (gasSchijf2 * tarieven.eb_gas_schijf2);
  
  return {
    totaal: ebElektriciteit + ebGas,
    details: {
      'Energiebelasting elektriciteit': ebElektriciteit,
      'Energiebelasting gas': ebGas
    }
  };
};

// 3. ODE
const berekenODE = (
  verbruikElektriciteitKWh: number,
  verbruikGasKWh: number,
  tarieven: TarievenOverheid
): BedragBreakdown => {
  const odeElektriciteit = verbruikElektriciteitKWh * tarieven.ode_elektriciteit;
  const odeGas = verbruikGasKWh * tarieven.ode_gas;
  
  return {
    totaal: odeElektriciteit + odeGas,
    details: {
      'ODE elektriciteit': odeElektriciteit,
      'ODE gas': odeGas
    }
  };
};

// 4. Netbeheerkosten (met aansluitwaarde!)
const berekenNetbeheerKosten = (
  verbruikElektriciteitKWh: number,
  verbruikGasM3: number,
  tarievenE: NetbeheerTarievenElektriciteit,
  tarievenG: NetbeheerTarievenGas,
  slimmeMeterE: boolean,
  slimmeMeterG: boolean
): BedragBreakdown => {
  
  // ELEKTRICITEIT
  const vastrechtE = tarievenE.vastrecht;
  const transportE = verbruikElektriciteitKWh * tarievenE.transport_normaal;
  const systeemdienstenE = verbruikElektriciteitKWh * tarievenE.systeemdiensten;
  const congestieE = verbruikElektriciteitKWh * (tarievenE.congestietarief || 0);
  const meetkostenE = slimmeMeterE ? tarievenE.meetkosten_slim : tarievenE.meetkosten_traditioneel;
  
  const totaalElektriciteit = vastrechtE + transportE + systeemdienstenE + congestieE + meetkostenE;
  
  // GAS
  const vastrechtG = tarievenG.vastrecht;
  const transportG = verbruikGasM3 * tarievenG.transport;
  const systeemdienstenG = verbruikGasM3 * tarievenG.systeemdiensten;
  const meetkostenG = slimmeMeterG ? tarievenG.meetkosten_slim : tarievenG.meetkosten_traditioneel;
  
  const totaalGas = vastrechtG + transportG + systeemdienstenG + meetkostenG;
  
  return {
    totaal: totaalElektriciteit + totaalGas,
    details: {
      'Netbeheer elektriciteit': {
        'Vastrecht': vastrechtE,
        'Transport': transportE,
        'Systeemdiensten': systeemdienstenE,
        'Congestie': congestieE,
        'Meetkosten': meetkostenE
      },
      'Netbeheer gas': {
        'Vastrecht': vastrechtG,
        'Transport': transportG,
        'Systeemdiensten': systeemdienstenG,
        'Meetkosten': meetkostenG
      }
    }
  };
};

// 5. Capaciteitstarief
const berekenCapaciteitstarief = (
  verbruikElektriciteitKWh: number,
  piekVerbruikKW: number | undefined,
  tarieven: NetbeheerTarievenElektriciteit,
  isGrootverbruik: boolean
): BedragBreakdown => {
  
  // Alleen voor grootverbruik >50.000 kWh
  if (!isGrootverbruik || !tarieven.capaciteitstarief || verbruikElektriciteitKWh < (tarieven.capaciteitstarief_drempel || 50000)) {
    return { totaal: 0, details: {} };
  }
  
  // Schat piekverbruik als niet opgegeven
  const piek = piekVerbruikKW || schatPiekverbruik(verbruikElektriciteitKWh);
  
  // Capaciteitstarief per maand, dus × 12
  const kosten = piek * tarieven.capaciteitstarief * 12;
  
  return {
    totaal: kosten,
    details: {
      'Piekverbruik': `${piek} kW`,
      'Tarief': `€${tarieven.capaciteitstarief}/kW/maand`,
      'Kosten per jaar': kosten
    }
  };
};

// Schat piekverbruik op basis van jaarverbruik
const schatPiekverbruik = (jaarverbruikKWh: number): number => {
  // Formule: (jaarverbruik / 8760 uur) × 3 = gemiddelde piek
  // Dit is een conservatieve schatting
  const gemiddeldVermogen = jaarverbruikKWh / 8760;
  const geschattePiek = gemiddeldVermogen * 3;
  return Math.round(geschattePiek * 100) / 100;
};

// 6. Teruglevering (zonnepanelen)
const berekenTeruglevering = (
  terugleveringKWh: number,
  tariefPerKWh: number
): number => {
  return terugleveringKWh * tariefPerKWh;
};

// 7. Vermindering energiebelasting
const berekenVermindering = (
  isGrootverbruikE: boolean,
  isGrootverbruikG: boolean,
  tarieven: TarievenOverheid
): number => {
  // Vermindering alleen voor kleinverbruik
  if (isGrootverbruikE && isGrootverbruikG) {
    return 0;
  }
  
  let vermindering = 0;
  if (!isGrootverbruikE) {
    vermindering += tarieven.vermindering_eb_elektriciteit;
  }
  if (!isGrootverbruikG) {
    vermindering += tarieven.vermindering_eb_gas;
  }
  
  return vermindering;
};
```

---

## 📋 ADMIN INTERFACE

### **Nieuwe Pagina's:**

1. **`/admin/tarieven/overheid`**
   - Jaar selecteren
   - Alle EB tarieven invoeren (klein + grootverbruik)
   - ODE tarieven
   - BTW percentages
   - Vermindering EB

2. **`/admin/tarieven/netbeheerders`**
   - Netbeheerder selecteren
   - Jaar selecteren
   - Per aansluitwaarde (3x25A, 3x35A, etc.) tarieven invoeren
   - Capaciteitstarief instellen

3. **`/admin/aansluitingen`**
   - Overzicht aansluitwaarden elektriciteit
   - Overzicht aansluitwaarden gas
   - Actief/inactief zetten

### **Update Contract Formulieren:**

```
Nieuw Contract Toevoegen:
├─ [Bestaande velden: leverancier, naam, type, etc.]
├─ **NIEUW:** Netbeheerder (dropdown)
├─ **NIEUW:** Aansluiting elektriciteit (dropdown: 1x25A, 3x25A, etc.)
├─ **NIEUW:** Aansluiting gas (dropdown: G4, G6, G10, etc.)
├─ Tarief teruglevering (€/kWh) - voor zonnepanelen
└─ Note: "Belastingen, heffingen en netbeheerkosten worden automatisch berekend"
```

---

## ✅ TODO: IMPLEMENTATIE

Wil je dat ik dit ga implementeren? Dan doe ik:

1. ✅ Database migraties
2. ✅ Seed data (2025 tarieven)
3. ✅ Berekeningslogica implementeren
4. ✅ Admin interface voor tarieven beheer
5. ✅ Contract formulieren updaten
6. ✅ Results page met volledige breakdown

**Geef me de cijfers uit de Sepa offerte en ik kan de precieze 2025 tarieven invullen!** 📊

