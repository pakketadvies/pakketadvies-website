# 🎨 PakketAdvies Kleurenstrategie - Volledig Plan

## 📋 Analyse Huidige Situatie

### Huidige Brand Colors (tailwind.config.ts)
- **Navy** (`#1A3756`): Donkerblauw - primaire donkere kleur
- **Teal** (`#00AF9B`): Groen-blauw/turquoise - primaire accentkleur
- **Purple** (`#8B5CF6`): Paars - secundaire accentkleur

### Problemen Geconstateerd:
1. ❌ Geen duidelijke semantiek: kleuren worden door elkaar gebruikt
2. ❌ Inconsistente hiërarchie: geen duidelijke primaire vs secundaire kleuren
3. ❌ Orange/andere kleuren worden gebruikt zonder in brand systeem te zitten
4. ❌ Purple en Teal strijden om dezelfde rol (accent/CTA)
5. ❌ Geen duidelijke regels voor wanneer welke kleur te gebruiken

---

## 🎯 Voorgesteld Kleurensysteem

### Kernprincipe: **Semantisch & Hiërarchisch**

Elke kleur krijgt een **duidelijke rol en betekenis**:

### 🟦 **NAVY (Donkerblauw) - Foundation & Authority**
**Rol:** Basis, professionaliteit, vertrouwen, structuur

**Gebruik voor:**
- ✅ Hero backgrounds (donkere secties)
- ✅ Footer backgrounds
- ✅ Primary headings (titles, h1-h3)
- ✅ Header/navigation background (scrolled state)
- ✅ Cards met autoriteit/trust content
- ✅ Secondary buttons (alternatief voor primary)
- ✅ Borders voor belangrijke elementen

**Niet gebruiken voor:**
- ❌ Accenten of highlights
- ❌ Call-to-action buttons (te weinig contrast/impact)

---

### 🟩 **TEAL (Turquoise) - Action & Energy**
**Rol:** Primaire actie, energie, beweging, groei

**Gebruik voor:**
- ✅ **ALLE primaire Call-to-Action buttons** (conversie focus)
- ✅ Links en hover states
- ✅ Active states (current nav item, selected items)
- ✅ Progress bars en status indicators
- ✅ Icons voor acties en features
- ✅ Accent borders op belangrijke elementen
- ✅ Badges voor success/positieve status
- ✅ Number badges en counters

**Niet gebruiken voor:**
- ❌ Backgrounds (behalve zeer lichte tinten voor accents)
- ❌ Grote tekstblokken

---

### 🟪 **PURPLE (Paars) - Premium & Innovation**
**Rol:** Premium diensten, innovatie, maatwerk, exclusiviteit

**Gebruik voor:**
- ✅ Premium/premium variant buttons (maatwerk, speciale diensten)
- ✅ Premium badges en labels
- ✅ Innovatie/advanced features highlights
- ✅ Speciale secties (bijv. "How it works" alternerende stappen)
- ✅ Tertiary CTA's (minder belangrijk dan primary)
- ✅ Social media links (Instagram)
- ✅ Aanvullende accenten voor variatie

**Niet gebruiken voor:**
- ❌ Primaire CTA's (te secundair)
- ❌ Algemene links (te specifiek)

---

### ⚪ **GRAY - Neutraal & Support**
**Rol:** Tekst, achtergronden, borders, neutrale elementen

**Gebruik voor:**
- ✅ Body tekst
- ✅ Lichte backgrounds
- ✅ Borders (subtiel)
- ✅ Placeholder tekst
- ✅ Disabled states

---

## 🔄 Consistente Toepassing per Component Type

### **Buttons**
```
Primary CTA (meest belangrijk):
→ TEAL (bg-brand-teal-500)

Secondary CTA (alternatief):
→ NAVY (bg-brand-navy-500)

Premium/Special CTA:
→ PURPLE (bg-brand-purple-500)

Outline buttons:
→ TEAL border + text (hover: teal bg)

Ghost buttons:
→ Gray text (hover: teal text)
```

### **Links & Navigation**
```
Default link color:
→ Gray (text-gray-600)

Hover/Active link:
→ TEAL (text-brand-teal-600)

Current nav item:
→ TEAL (text-brand-teal-600 + bg-brand-teal-50)
```

### **Badges & Labels**
```
Success/Positive:
→ TEAL (bg-brand-teal-50 + text-brand-teal-700)

Premium/Special:
→ PURPLE (bg-brand-purple-50 + text-brand-purple-700)

Info:
→ TEAL (bg-brand-teal-50 + text-brand-teal-600)

Warning:
→ Yellow/Orange (buiten brand, voor alerts)

Error:
→ Red (buiten brand, voor errors)

Neutral:
→ Gray (bg-gray-50 + text-gray-600)
```

### **Cards & Sections**
```
Standard card background:
→ White (bg-white)

Card borders:
→ Gray (border-gray-200)

Hover state:
→ TEAL border (border-brand-teal-500/50)

Section backgrounds:
→ White (default) of Gray-50 (afwisseling)

Dark sections:
→ NAVY (bg-brand-navy-500)
```

### **Icons & Illustrations**
```
Primary action icons:
→ TEAL (text-brand-teal-500)

Secondary/premium icons:
→ PURPLE (text-brand-purple-500)

Neutral icons:
→ Gray (text-gray-600)

Icon backgrounds (featured):
→ TEAL (bg-brand-teal-500) of PURPLE (bg-brand-purple-500)
```

### **Headings**
```
Primary headings (h1):
→ NAVY (text-brand-navy-500)

Secondary headings (h2-h3):
→ NAVY (text-brand-navy-500)

Accent in headings:
→ TEAL gradient of PURPLE (gradient-text of text-brand-teal-500)
```

---

## 📐 Specifieke Component Updates

### **Hero Section**
- Background: NAVY (donker, professioneel)
- Accent tekst: TEAL (opvallend)
- CTA buttons: TEAL (primary)
- Trust indicators: TEAL icons

### **Features Section**
- Headings: NAVY
- Feature icons: TEAL (majority) + PURPLE (1-2 voor variatie)
- CTA button: TEAL

### **Contract Types Section**
- Card borders: Gray
- Hover: TEAL border
- Icons: Mix TEAL en PURPLE voor variatie
- CTA: TEAL

### **Sectors Section**
- Gradient backgrounds: Mix van TEAL, NAVY, PURPLE (voor variatie OK)
- Icons: Passend bij gradient

### **How It Works**
- Step icons: Alternerend TEAL en PURPLE (visuele ritme)
- Number badges: TEAL (consistent)
- CTA: TEAL

### **Calculator/Forms**
- Primary buttons: TEAL
- Form inputs: Gray borders, TEAL focus ring
- Submit buttons: TEAL
- Progress bars: TEAL

### **Contract Cards (Results)**
- Primary CTA: TEAL
- Badges: TEAL voor success, PURPLE voor premium
- Headings: NAVY
- Hover states: TEAL border

### **Admin Panel**
- Primary actions: TEAL
- Secondary actions: NAVY
- Delete/danger: Red (buiten brand)
- Success: TEAL

---

## 🚫 Te Vermijden

1. ❌ Orange voor gas/energie (niet in brand systeem)
   → **Oplossing:** Gebruik TEAL voor alles energie-gerelateerd

2. ❌ Purple en Teal door elkaar voor CTA's
   → **Oplossing:** TEAL = primary, PURPLE = premium/alternatief

3. ❌ Willekeurige kleurkeuzes zonder semantiek
   → **Oplossing:** Volg dit document strikt

4. ❌ Te veel kleuren in één sectie
   → **Oplossing:** Max 2 brand colors per sectie (NAVY + TEAL of PURPLE)

---

## ✅ Implementatie Checklist

### Fase 1: Core Components
- [ ] Button component (alleen TEAL primary, NAVY secondary, PURPLE premium)
- [ ] Badge component (update varianten)
- [ ] Link styling (TEAL hover)
- [ ] Form inputs (TEAL focus)

### Fase 2: Sections
- [ ] Hero (NAVY bg, TEAL accents)
- [ ] Features (TEAL icons primair)
- [ ] Contract Types (TEAL/PURPLE mix)
- [ ] Sectors (gradients OK, maar consistent)
- [ ] How It Works (alternerend TEAL/PURPLE)
- [ ] CTA (TEAL buttons)

### Fase 3: Calculator & Results
- [ ] Quick Calculator (TEAL buttons)
- [ ] Contract Cards (TEAL primary actions)
- [ ] Forms (TEAL focus states)

### Fase 4: Admin Panel
- [ ] Primary actions → TEAL
- [ ] Secondary actions → NAVY
- [ ] Premium features → PURPLE

### Fase 5: Cleanup
- [ ] Verwijder alle orange/red/green usage (behalve errors/warnings)
- [ ] Consistent gebruik van TEAL voor energie-gerelateerd
- [ ] Check alle hover states

---

## 📊 Visuele Hiërarchie

```
PRIMARY (Teal):
└── Meest belangrijke acties
└── Conversie-gerichte elementen
└── Primary CTA buttons

SECONDARY (Navy):
└── Structuur en autoriteit
└── Alternatieve CTA's
└── Donkere backgrounds

TERTIARY (Purple):
└── Premium features
└── Speciale diensten
└── Visuele variatie

SUPPORT (Gray):
└── Tekst
└── Neutrale elementen
└── Borders en backgrounds
```

---

## 🎨 Color Psychology (Waarom deze keuzes)

**Navy (Donkerblauw):**
- Betrouwbaarheid, professionaliteit
- Autoriteit en expertise
- Perfect voor zakelijke energie consultancy

**Teal (Turquoise):**
- Energie en groei (perfect voor energiebedrijf!)
- Actie en beweging
- Modern en fris
- Goed contrast op donkere backgrounds

**Purple (Paars):**
- Innovatie en premium
- Creativiteit en maatwerk
- Onderscheidt speciale diensten

---

Dit systeem zorgt voor:
✅ Duidelijke visuele hiërarchie
✅ Consistente gebruikerservaring
✅ Professionele uitstraling
✅ Herkenbare merkidentiteit

