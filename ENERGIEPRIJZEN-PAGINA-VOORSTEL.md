# Energieprijzen Pagina - Implementatie Voorstel

## 🎯 Concept & Positionering

### Waarom deze pagina?
- **Transparantie**: Toon marktprijzen om klanten te helpen begrijpen wat "normale" prijzen zijn
- **Educatief**: Help zakelijke klanten de energiemarkt beter te begrijpen
- **Vertrouwen**: Laat zien dat jullie onafhankelijk zijn en objectieve informatie bieden
- **Differentiatie**: Onderscheid je van leveranciers door marktprijzen te tonen (niet alleen eigen tarieven)

### Positionering
- **Niet** als leverancier (zoals NieuweStroom)
- **Wel** als onafhankelijke vergelijkingssite die marktinzicht biedt
- Focus op **educatie** en **transparantie**, niet op verkoop

---

## 📍 Locatie & Navigatie

### Optie 1: Onder Kennisbank (AANBEVOLEN)
**Route**: `/kennisbank/energieprijzen`

**Voordelen**:
- Past logisch bij educatieve content
- Gebruikt bestaande kennisbank structuur
- Makkelijk te vinden voor geïnteresseerde klanten

**Implementatie**:
- Toevoegen aan kennisbank overzichtspagina als featured artikel
- Link in footer onder "Kennisbank"
- Breadcrumb: Home > Kennisbank > Energieprijzen

### Optie 2: Aparte sectie in hoofdmenu
**Route**: `/energieprijzen`

**Voordelen**:
- Meer zichtbaarheid
- Directe toegang vanuit hoofdmenu
- Kan als standalone tool functioneren

**Nadelen**:
- Mogelijk te prominent voor een informatieve pagina
- Breekt met huidige navigatiestructuur

**Aanbeveling**: **Optie 1 (Kennisbank)** - past beter bij jullie positionering als informatieve vergelijkingssite

---

## 🎨 Design & Styling

### Consistentie met huidige thema:
- **Kleuren**: Brand-teal (#00AF9B) voor primaire acties, Brand-navy (#1A3756) voor headers
- **Cards**: Witte cards met shadow-lg, rounded-2xl, hover effects
- **Typography**: Space Grotesk voor headers, Plus Jakarta Sans voor body
- **Glassmorphism**: Voor filter controls (zoals in header)
- **Gradients**: Subtiele gradients voor accenten

### Layout structuur:
```
┌─────────────────────────────────────┐
│ Hero Section (brand-navy bg)        │
│ - Titel: "Energieprijzen"           │
│ - Subtitel: Uitleg over marktprijzen│
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Info Cards (3 kolommen)             │
│ - Huidige prijzen                  │
│ - Gemiddelde prijzen               │
│ - Prijsontwikkeling                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Filter Controls (glassmorphism)     │
│ - Periode (1m, 3m, 1j, 2j, 5j)     │
│ - Type (Elektriciteit/Gas)          │
│ - Tarief (Dag/Nacht/Gemiddeld)     │
│ - Inclusief/Exclusief belastingen  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Interactieve Grafiek                │
│ - Line chart met hover tooltips     │
│ - Responsive (mobile: stacked)      │
│ - Smooth animations                 │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Prijstabel (expandable)             │
│ - Dagelijkse prijzen               │
│ - Sorteerbaar                       │
│ - Export optie (CSV)                │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ Uitleg Sectie                       │
│ - Wat zijn marktprijzen?            │
│ - Hoe worden ze bepaald?            │
│ - Verschil met contractprijzen      │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ CTA Sectie                          │
│ - "Vergelijk contracten" button     │
│ - Link naar calculator              │
└─────────────────────────────────────┘
```

---

## 📊 Functionaliteiten

### 1. Interactieve Grafiek
**Library**: Recharts of Chart.js (Recharts heeft betere TypeScript support)

**Features**:
- **Line chart** met meerdere lijnen (dag/nacht/gemiddeld)
- **Hover tooltips** met exacte prijzen en datum
- **Zoom functionaliteit** (in/out op specifieke periodes)
- **Responsive**: Op mobile gestapeld, op desktop naast elkaar
- **Smooth animations** bij filter wijzigingen
- **Legenda** met klikbare items (show/hide lijnen)

**Data**:
- Haal historische data op uit `dynamic_prices` tabel
- Real-time updates voor huidige dag
- Fallback voor ontbrekende data (interpolatie)

### 2. Filter Controls
**Styling**: Glassmorphism cards met toggle buttons

**Filters**:
- **Periode**: 
  - 1 maand (default)
  - 3 maanden
  - 1 jaar
  - 2 jaar
  - 5 jaar
  - Custom range (date picker)
  
- **Energietype**:
  - Elektriciteit (default)
  - Gas
  - Beide (split view)
  
- **Tarieftype** (alleen voor elektriciteit):
  - Gemiddeld (default)
  - Dagtarief
  - Nachttarief
  
- **Belastingen**:
  - Exclusief belastingen (default) - marktprijzen
  - Inclusief belastingen - consumentenprijzen

**UX**:
- Filters zijn persistent (URL params)
- Smooth transitions bij wijzigingen
- Loading states tijdens data fetch

### 3. Prijstabel
**Features**:
- **Sorteerbaar** op datum, prijs (oplopend/aflopend)
- **Expandable**: Standaard laatste 30 dagen, "Toon meer" voor volledige dataset
- **Export**: CSV download knop
- **Responsive**: Op mobile horizontaal scrollbaar
- **Highlight**: Huidige dag gemarkeerd

**Kolommen**:
- Datum
- Elektriciteit dag (€/kWh)
- Elektriciteit nacht (€/kWh)
- Elektriciteit gemiddeld (€/kWh)
- Gas (€/m³)
- Bron (ENERGYZERO/ENTSOE)

### 4. Info Cards (Top Section)
**3 Cards**:
1. **Huidige Prijzen**
   - Vandaag: Elektriciteit + Gas
   - Trend indicator (↑↓) vs gisteren
   - Kleur: brand-teal

2. **Gemiddelde Prijzen (30 dagen)**
   - Elektriciteit gemiddeld
   - Gas gemiddeld
   - Kleur: brand-navy

3. **Prijsontwikkeling**
   - % verandering vs vorige maand
   - % verandering vs vorige jaar
   - Kleur: brand-purple (accent)

### 5. Uitleg Sectie
**Content**:
- **Wat zijn marktprijzen?**
  - Uitleg over EPEX Spot, TTF
  - Hoe worden ze bepaald?
  - Waarom variëren ze?

- **Marktprijzen vs Contractprijzen**
  - Verschil tussen dynamische en vaste contracten
  - Wanneer kies je wat?
  - Link naar kennisbank artikel

- **Disclaimer**
  - Deze prijzen zijn marktprijzen, niet contractprijzen
  - Contractprijzen kunnen afwijken door opslagen
  - Link naar calculator om contracten te vergelijken

---

## 🔧 Technische Implementatie

### API Routes:
1. `/api/energieprijzen/historie` - Haal historische prijzen op
   - Query params: startDate, endDate, type (elektriciteit/gas)
   - Returns: Array van prijsrecords

2. `/api/energieprijzen/huidig` - Huidige prijzen
   - Returns: Vandaag + statistieken

3. `/api/energieprijzen/statistieken` - Gemiddelden en trends
   - Query params: periode (30d, 1j, etc.)
   - Returns: Gemiddelden, min, max, trends

### Data Source:
- **Primair**: `dynamic_prices` tabel in Supabase
- **Fallback**: EnergyZero API voor real-time updates
- **Caching**: 1 uur cache voor historische data, 15 min voor huidige prijzen

### Componenten:
1. `EnergieprijzenPage` - Main page component
2. `PrijzenGrafiek` - Recharts line chart component
3. `PrijzenFilters` - Filter controls component
4. `PrijzenTabel` - Data table component
5. `PrijzenInfoCards` - Top info cards
6. `PrijzenUitleg` - Educational content section

---

## 📱 Responsive Design

### Desktop (>1024px):
- 3-kolommen layout voor info cards
- Grafiek en filters naast elkaar
- Volledige tabel zichtbaar
- Sidebar met uitleg

### Tablet (768px - 1024px):
- 2-kolommen voor info cards
- Grafiek en filters gestapeld
- Compacte tabel

### Mobile (<768px):
- 1-kolom voor alles
- Gestapelde grafiek (elektriciteit en gas apart)
- Horizontaal scrollbare tabel
- Collapsible filter section

---

## 🎯 Content Strategie

### Hero Text:
**Titel**: "Energieprijzen - Inzicht in de markt"

**Subtitel**: 
"Bekijk de actuele en historische marktprijzen voor elektriciteit en gas. Deze prijzen geven inzicht in de energiemarkt en helpen u bij het kiezen van het juiste energiecontract."

### SEO:
- Meta description: "Bekijk actuele en historische energieprijzen. Inzicht in marktprijzen voor elektriciteit en gas om het beste energiecontract te kiezen."
- Keywords: energieprijzen, marktprijzen, elektriciteitsprijzen, gasprijzen, dynamische tarieven
- Structured data: TimeSeries schema voor prijsdata

---

## ✅ Implementatie Checklist

- [ ] Page component (`/kennisbank/energieprijzen/page.tsx`)
- [ ] API routes voor data fetching
- [ ] Recharts grafiek component
- [ ] Filter controls component
- [ ] Data table component
- [ ] Info cards component
- [ ] Uitleg sectie content
- [ ] Responsive styling
- [ ] Loading states
- [ ] Error handling
- [ ] SEO metadata
- [ ] Link toevoegen aan kennisbank overzicht
- [ ] Test met echte data

---

## 🚀 Next Steps

1. **Goedkeuring** van dit voorstel
2. **Content** definitief maken (teksten, uitleg)
3. **Implementatie** starten met basis structuur
4. **Grafiek** implementeren met Recharts
5. **Filters** toevoegen met state management
6. **Styling** perfectioneren voor consistentie
7. **Testing** op verschillende devices
8. **Launch** en monitoring

---

## 💡 Extra Ideeën (Optioneel)

- **Prijs alerts**: Notificatie wanneer prijzen boven/onder bepaalde drempel komen
- **Vergelijking**: Vergelijk prijzen tussen verschillende periodes
- **Export**: PDF rapport genereren met prijsanalyse
- **Embed**: Embeddable widget voor andere websites
- **API**: Publieke API voor ontwikkelaars (toekomst)

---

**Klaar voor implementatie zodra goedgekeurd!** 🎉

