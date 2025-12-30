# 📋 Contract Details Card - Verbeteringsvoorstellen

## Huidige Situatie
De `ContractDetailsCard` toont momenteel:
- ✅ Logo en contractnaam
- ✅ Leverancier naam
- ✅ Rating en reviews
- ❌ Maandbedrag (alleen uitgeklapt, niet prominent)
- ❌ Besparing per jaar (alleen uitgeklapt, niet prominent)
- ❌ Geen tarieven zichtbaar
- ❌ Geen berekening breakdown
- ❌ Geen jaarbedrag zichtbaar

## Beschikbare Data
Uit `ContractOptie` type:
- `maandbedrag: number`
- `jaarbedrag: number`
- `besparing?: number` (maandelijks)
- `tariefElektriciteit: number`
- `tariefElektriciteitEnkel?: number`
- `tariefElektriciteitDal?: number`
- `tariefGas?: number`
- `details_vast` of `details_dynamisch` (volledige tarieven)
- `breakdown?: any` (kosten breakdown)

---

## Voorstel 1: Compact & Informatief (Aanbevolen)

### Concept
**Prominente prijsinformatie in collapsed state, uitgebreide details in expanded state.**

### Collapsed State (Desktop & Mobile):
```
┌─────────────────────────────────────────────┐
│ [Logo]  ELIX Dynamisch Zakelijk             │
│         ELIX                                │
│         ⭐ 4.8 (1316 reviews)               │
│                                             │
│         💰 €149/maand                       │
│         📊 €1.788/jaar                      │
│         💚 €1.488 besparing/jaar            │
│                                             │
│                          [Bekijk details ▼] │
└─────────────────────────────────────────────┘
```

### Expanded State (Desktop & Mobile):
```
┌─────────────────────────────────────────────┐
│ [Bovenstaande info]                         │
├─────────────────────────────────────────────┤
│ 📋 Contractdetails                          │
│ • Type: Dynamisch contract                  │
│ • Opzegtermijn: 1 maand                     │
│ • Energie: 100% Groen                      │
│                                             │
│ 💰 Tarieven                                 │
│ • Elektriciteit normaal: €0,25/kWh         │
│ • Elektriciteit dal: €0,22/kWh             │
│ • Gas: €1,15/m³                            │
│ • Teruglevering: €0,20/kWh                 │
│ • Vastrecht stroom: €4,50/maand            │
│ • Vastrecht gas: €8,00/maand                │
│                                             │
│ 📊 Berekening (op basis van jouw verbruik)  │
│ Elektriciteit normaal:                      │
│   4.000 kWh × €0,25 = €1.000               │
│ Elektriciteit dal:                          │
│   2.000 kWh × €0,22 = €440                 │
│ Gas:                                        │
│   1.200 m³ × €1,15 = €1.380                │
│ Vastrecht:                                  │
│   (€4,50 + €8,00) × 12 = €150               │
│ ─────────────────────────────────────────── │
│ Totaal leverancier: €2.970/jaar            │
│ Netbeheerder: €450/jaar                     │
│ Belastingen: €1.200/jaar                    │
│ ─────────────────────────────────────────── │
│ Totaal: €4.620/jaar (€385/maand)           │
│                                             │
│ ✅ Bijzonderheden:                          │
│ • Geen opzegtermijn                         │
│ • Flexibele tarieven                        │
└─────────────────────────────────────────────┘
```

### Voordelen:
✅ **Prominente prijsinformatie** - Direct zichtbaar zonder uitklappen  
✅ **Transparantie** - Volledige tarieven en berekening  
✅ **Vertrouwen** - Duidelijke breakdown laat zien hoe prijs tot stand komt  
✅ **Responsive** - Werkt goed op desktop en mobile  
✅ **Scanbaar** - Belangrijkste info (prijs) staat bovenaan  

### Implementatie:
- Maandbedrag, jaarbedrag en besparing prominent in collapsed state
- Uitklappen toont: contractdetails, tarieven, volledige berekening
- Gebruik icons voor visuele hiërarchie
- Mobile: Stack layout, desktop: Grid layout voor tarieven

---

## Voorstel 2: Tabbed Interface

### Concept
**Tabs voor verschillende informatie categorieën: Overzicht, Tarieven, Berekening**

### Collapsed State:
```
┌─────────────────────────────────────────────┐
│ [Logo]  ELIX Dynamisch Zakelijk             │
│         ELIX                                │
│         ⭐ 4.8 (1316 reviews)               │
│                                             │
│         💰 €149/maand                       │
│         💚 €1.488 besparing/jaar            │
│                                             │
│                          [Bekijk details ▼] │
└─────────────────────────────────────────────┘
```

### Expanded State:
```
┌─────────────────────────────────────────────┐
│ [Bovenstaande info]                         │
├─────────────────────────────────────────────┤
│ [Overzicht] [Tarieven] [Berekening]        │
├─────────────────────────────────────────────┤
│                                             │
│ 📋 Overzicht Tab:                           │
│ • Type: Dynamisch contract                  │
│ • Looptijd: Onbepaald                       │
│ • Opzegtermijn: 1 maand                     │
│ • Energie: 100% Groen                      │
│ • Maandbedrag: €149                         │
│ • Jaarbedrag: €1.788                        │
│ • Besparing: €1.488/jaar                    │
│                                             │
│ 💰 Tarieven Tab:                            │
│ [Grid met tarieven]                         │
│                                             │
│ 📊 Berekening Tab:                          │
│ [Volledige breakdown]                       │
│                                             │
└─────────────────────────────────────────────┘
```

### Voordelen:
✅ **Georganiseerd** - Informatie in logische categorieën  
✅ **Niet overweldigend** - Gebruiker kiest wat hij wil zien  
✅ **Uitbreidbaar** - Makkelijk nieuwe tabs toevoegen  
✅ **Desktop-friendly** - Tabs werken goed op grotere schermen  

### Nadelen:
⚠️ **Mobile UX** - Tabs kunnen krap zijn op kleine schermen  
⚠️ **Meer clicks** - Gebruiker moet tussen tabs wisselen  

---

## Voorstel 3: Accordion Style met Highlights

### Concept
**Prominente prijsinformatie + accordion secties voor details**

### Collapsed State:
```
┌─────────────────────────────────────────────┐
│ [Logo]  ELIX Dynamisch Zakelijk             │
│         ELIX                                │
│         ⭐ 4.8 (1316 reviews)               │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 💰 €149/maand                            │ │
│ │ 📊 €1.788/jaar                           │ │
│ │ 💚 €1.488 besparing/jaar                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [▼ Contractdetails]                        │
│ [▼ Tarieven]                               │
│ [▼ Berekening]                             │
└─────────────────────────────────────────────┘
```

### Expanded State:
```
┌─────────────────────────────────────────────┐
│ [Bovenstaande info met prijs highlight]     │
├─────────────────────────────────────────────┤
│ ▼ Contractdetails                          │
│   • Type: Dynamisch contract                │
│   • Opzegtermijn: 1 maand                   │
│   • Energie: 100% Groen                     │
│                                             │
│ ▶ Tarieven                                  │
│                                             │
│ ▶ Berekening                                │
└─────────────────────────────────────────────┘
```

### Voordelen:
✅ **Scanbaar** - Prijsinformatie direct zichtbaar in highlight box  
✅ **Flexibel** - Gebruiker kiest welke secties hij uitklapt  
✅ **Mobile-friendly** - Accordion werkt goed op kleine schermen  
✅ **Geen tabs** - Geen extra navigatie nodig  

### Nadelen:
⚠️ **Meer scrollen** - Alle secties kunnen lang worden  
⚠️ **Minder overzicht** - Minder zichtbaar dan tabs  

---

## Vergelijking

| Feature | Voorstel 1 | Voorstel 2 | Voorstel 3 |
|---------|------------|------------|------------|
| **Prijs prominent** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Tarieven zichtbaar** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Berekening breakdown** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Mobile UX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Desktop UX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Implementatie complexiteit** | Medium | Hoog | Medium |
| **Scanbaarheid** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Aanbeveling

**Voorstel 1 (Compact & Informatief)** is de beste keuze omdat:
1. ✅ **Prominente prijsinformatie** - Direct zichtbaar zonder uitklappen
2. ✅ **Volledige transparantie** - Alle tarieven en berekening in één overzicht
3. ✅ **Werkt perfect op mobile en desktop** - Responsive design
4. ✅ **Vertrouwen** - Duidelijke breakdown laat zien hoe prijs tot stand komt
5. ✅ **Niet overweldigend** - Collapsed state toont alleen belangrijkste info

**Implementatie details:**
- Collapsed: Logo, naam, rating, **maandbedrag, jaarbedrag, besparing**
- Expanded: Contractdetails + Tarieven + Volledige berekening breakdown
- Mobile: Stack layout, desktop: Grid voor tarieven
- Icons voor visuele hiërarchie (💰 voor prijs, 📊 voor data, 💚 voor besparing)

