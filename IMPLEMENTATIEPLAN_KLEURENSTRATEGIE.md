# 🎨 IMPLEMENTATIEPLAN - Kleurenstrategie PakketAdvies
## Volledig gedetailleerd overzicht van alle wijzigingen

---

## 📋 OVERZICHT

**Totaal aantal bestanden te wijzigen:** 28 bestanden
**Hoofdcategorieën:**
1. Orange → Teal conversies (gas/energie gerelateerd)
2. Purple/Teal inconsistenties → duidelijke semantiek
3. Button varianten standaardiseren
4. Badge varianten standaardiseren
5. Link/hover states uniformeren

---

## 🔴 FASE 1: ORANGE → TEAL CONVERSIES
**Doel:** Alle orange kleuren voor gas/energie vervangen door TEAL

### 1.1 `src/app/admin/tarieven/netbeheer/page.tsx`
**Lijn 278-279:**
```typescript
// VOOR:
? 'bg-orange-500 text-white'
: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300'

// NA:
? 'bg-brand-teal-500 text-white'
: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-brand-teal-300'
```
**Reden:** Gas tab button moet TEAL zijn (energie-gerelateerd)

---

### 1.2 `src/app/admin/tarieven/page.tsx`
**Lijn 350:**
```typescript
// VOOR:
<Flame size={20} weight="duotone" className="text-orange-600" />

// NA:
<Flame size={20} weight="duotone" className="text-brand-teal-600" />
```
**Reden:** Gas icon moet TEAL zijn

---

### 1.3 `src/components/calculator/ContractCard.tsx`
**Lijn 583-607:**
```typescript
// VOOR:
<div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
  <Sun weight="duotone" className="w-5 h-5 text-orange-600" />
  ...
  <span className="font-medium text-orange-700">
  ...
  <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-900">

// NA:
<div className="bg-brand-teal-50 border-2 border-brand-teal-200 rounded-lg p-4">
  <Sun weight="duotone" className="w-5 h-5 text-brand-teal-600" />
  ...
  <span className="font-medium text-brand-teal-700">
  ...
  <div className="mt-3 p-2 bg-brand-teal-100 rounded text-xs text-brand-teal-900">
```
**Reden:** Teruglevering sectie is energie-gerelateerd, moet TEAL zijn

---

### 1.4 `src/components/calculator/EditVerbruikForm.tsx`
**Lijn 334:**
```typescript
// VOOR:
<Flame weight="duotone" className="w-5 h-5 text-orange-600" />

// NA:
<Flame weight="duotone" className="w-5 h-5 text-brand-teal-600" />
```

**Lijn 357-371:**
```typescript
// VOOR:
className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-all"
...
className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"

// NA:
className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-brand-teal-300 hover:bg-brand-teal-50 transition-all"
...
className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
```
**Reden:** Gas checkbox hover en focus moeten TEAL zijn

---

### 1.5 `src/components/calculator/EditVerbruikPanel.tsx`
**Lijn 181:**
```typescript
// VOOR:
<span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">

// NA:
<span className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-teal-100 text-brand-teal-700 rounded-lg text-sm font-medium">
```
**Reden:** "Niet opgeslagen" badge moet TEAL zijn (actie/status)

**Lijn 397:**
```typescript
// VOOR:
<Flame weight="duotone" className="w-5 h-5 text-orange-600" />

// NA:
<Flame weight="duotone" className="w-5 h-5 text-brand-teal-600" />
```

**Lijn 420-430:**
```typescript
// VOOR:
className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-all"
...
className="w-5 h-5 rounded border-2 border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"

// NA:
className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg border-2 border-gray-200 bg-gray-50 hover:border-brand-teal-300 hover:bg-brand-teal-50 transition-all"
...
className="w-5 h-5 rounded border-2 border-gray-300 text-brand-teal-600 focus:ring-brand-teal-500 focus:ring-2"
```

**Lijn 515:**
```typescript
// VOOR:
<div className="sm:ml-auto flex items-center gap-2 text-sm text-orange-600 font-medium">

// NA:
<div className="sm:ml-auto flex items-center gap-2 text-sm text-brand-teal-600 font-medium">
```
**Reden:** Alle gas-gerelateerde elementen → TEAL

---

### 1.6 `src/components/calculator/VerbruikForm.tsx`
**Lijn 669-670:**
```typescript
// VOOR:
<div className="w-10 h-10 bg-brand-teal-500 rounded-xl flex items-center justify-center">
  <Flame weight="duotone" className="w-5 h-5 text-white" />

// NA:
// Blijft hetzelfde (al correct - TEAL background met witte icon)
```
**Status:** ✅ Al correct - geen wijziging nodig

---

## 🟣 FASE 2: PURPLE/TEAL INCONSISTENTIES OPLOSSEN
**Doel:** Duidelijke semantiek: TEAL = primary action, PURPLE = premium/special

### 2.1 `src/components/calculator/FloatingEditButton.tsx`
**Lijn 13:**
```typescript
// VOOR:
className="fixed bottom-6 right-4 z-50 w-14 h-14 bg-brand-purple-500 hover:bg-brand-purple-600 ..."

// NA:
className="fixed bottom-6 right-4 z-50 w-14 h-14 bg-brand-teal-500 hover:bg-brand-teal-600 ..."
```
**Reden:** Edit button is primary actie → TEAL

---

### 2.2 `src/components/sections/HowItWorks.tsx`
**Lijn 93:**
```typescript
// VOOR:
<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color === 'purple' ? 'bg-brand-purple-500' : 'bg-brand-navy-500'} ...`}>

// NA:
<div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${step.color === 'purple' ? 'bg-brand-purple-500' : step.color === 'teal' ? 'bg-brand-teal-500' : 'bg-brand-navy-500'} ...`}>
```
**Reden:** Alternerend TEAL/PURPLE voor visueel ritme (al correct in data, maar code moet TEAL ondersteunen)

**Lijn 98:**
```typescript
// VOOR:
<h3 className={`font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4 group-hover:${step.color === 'purple' ? 'text-brand-purple-600' : 'text-brand-teal-600'} transition-colors`}>

// NA:
<h3 className={`font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4 group-hover:${step.color === 'purple' ? 'text-brand-purple-600' : step.color === 'teal' ? 'text-brand-teal-600' : 'text-brand-navy-600'} transition-colors`}>
```
**Reden:** Hover state moet ook TEAL ondersteunen

---

### 2.3 `src/components/sections/Features.tsx`
**Lijn 118:**
```typescript
// VOOR:
<div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.color === 'purple' ? 'bg-brand-purple-500' : 'bg-brand-teal-500'} ...`}>

// NA:
// Blijft hetzelfde (al correct - TEAL majority, PURPLE voor variatie)
```
**Status:** ✅ Al correct - geen wijziging nodig

---

### 2.4 `src/components/sections/Testimonials.tsx`
**Lijn 129:**
```typescript
// VOOR:
<div className="text-4xl md:text-5xl font-bold text-brand-purple-600 mb-2">

// NA:
<div className="text-4xl md:text-5xl font-bold text-brand-teal-600 mb-2">
```
**Reden:** Stat nummer moet TEAL zijn (primary accent)

---

## 🔵 FASE 3: BLUE → TEAL/NAVY CONVERSIES
**Doel:** Alle blue kleuren vervangen door brand colors

### 3.1 `src/app/contract/bevestiging/page.tsx`
**Lijn 180:**
```typescript
// VOOR:
<span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">

// NA:
<span className="text-xs px-2 py-0.5 bg-brand-teal-100 text-brand-teal-700 rounded-full font-medium">
```
**Reden:** Status badge → TEAL (actie/positief)

---

### 3.2 `src/app/producten/vast-contract/page.tsx`
**Lijn 22:**
```typescript
// VOOR:
<div className="inline-flex items-center gap-3 bg-brand-navy-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-6">

// NA:
<div className="inline-flex items-center gap-3 bg-brand-navy-500/20 border border-brand-navy-400/30 rounded-full px-4 py-2 mb-6">
```
**Reden:** Badge border moet NAVY zijn (consistent met background)

---

### 3.3 `src/components/admin/VastContractForm.tsx`
**Lijn 521-522:**
```typescript
// VOOR:
<div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
  <p className="text-sm text-blue-900">

// NA:
<div className="p-4 bg-brand-teal-50 border-2 border-brand-teal-200 rounded-lg">
  <p className="text-sm text-brand-teal-900">
```
**Reden:** Info box → TEAL (informatie/actie)

**Lijn 776:**
```typescript
// VOOR:
<FileText size={16} className="text-blue-600 flex-shrink-0" />

// NA:
<FileText size={16} className="text-brand-teal-600 flex-shrink-0" />
```
**Reden:** Document icon → TEAL (actie/links)

---

### 3.4 `src/components/admin/DynamischContractForm.tsx`
**Lijn 527:**
```typescript
// VOOR:
<FileText size={16} className="text-blue-600 flex-shrink-0" />

// NA:
<FileText size={16} className="text-brand-teal-600 flex-shrink-0" />
```
**Reden:** Document icon → TEAL

---

### 3.5 `src/components/admin/MaatwerkContractForm.tsx`
**Lijn 472:**
```typescript
// VOOR:
<FileText size={16} className="text-blue-600 flex-shrink-0" />

// NA:
<FileText size={16} className="text-brand-teal-600 flex-shrink-0" />
```
**Reden:** Document icon → TEAL

---

### 3.6 `src/components/calculator/ContractCard.tsx`
**Lijn 722:**
```typescript
// VOOR:
<FileText weight="bold" className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />

// NA:
<FileText weight="bold" className="w-4 h-4 text-brand-teal-600 flex-shrink-0 mt-0.5" />
```
**Reden:** Document icon → TEAL

**Lijn 746:**
```typescript
// VOOR:
<Check weight="bold" className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />

// NA:
<Check weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-0.5" />
```
**Reden:** Check icon → TEAL (positief/actie)

---

## 🔵 FASE 4: BADGE & LABEL STANDARDISATIE

### 4.1 `src/components/admin/ContractenList.tsx`
**Lijn 31-35:**
```typescript
// VOOR:
switch (type) {
  case 'vast': return 'bg-blue-50 text-blue-700'
  case 'dynamisch': return 'bg-purple-50 text-purple-700'
  case 'maatwerk': return 'bg-orange-50 text-orange-700'
  default: return 'bg-gray-50 text-gray-700'
}

// NA:
switch (type) {
  case 'vast': return 'bg-brand-navy-50 text-brand-navy-700'  // Navy = foundation/authority
  case 'dynamisch': return 'bg-brand-teal-50 text-brand-teal-700'  // Teal = action/energy
  case 'maatwerk': return 'bg-brand-purple-50 text-brand-purple-700'  // Purple = premium
  default: return 'bg-gray-50 text-gray-700'
}
```
**Reden:** Contract type badges moeten brand colors gebruiken met juiste semantiek

**Lijn 152 & 221:**
```typescript
// VOOR:
<span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">

// NA:
<span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-teal-50 text-brand-teal-700 text-xs font-medium rounded-full">
```
**Reden:** "Populair" badge → TEAL (actie/status indicator, niet premium)

---

### 4.2 `src/app/admin/contracten/page.tsx`
**Lijn 68:**
```typescript
// VOOR:
<p className="text-2xl font-bold text-orange-600">

// NA:
<p className="text-2xl font-bold text-brand-purple-600">
```
**Reden:** Maatwerk contracten count → PURPLE (premium)

---

### 4.3 `src/components/ui/Badge.tsx`
**Status:** ✅ Al correct - gebruikt al brand-teal en brand-purple
**Geen wijziging nodig**

---

### 4.4 `src/components/ui/InfoBox.tsx`
**Lijn 10-18:**
```typescript
// VOOR:
const colors = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-orange-50 border-orange-200 text-orange-800',
  success: 'bg-green-50 border-green-200 text-green-800',
}

const iconColors = {
  info: 'text-blue-500',
  warning: 'text-orange-500',
  success: 'text-green-500',
}

// NA:
const colors = {
  info: 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-800',  // Info = TEAL
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',  // Warning blijft yellow (buiten brand)
  success: 'bg-brand-teal-50 border-brand-teal-200 text-brand-teal-800',  // Success = TEAL
}

const iconColors = {
  info: 'text-brand-teal-500',
  warning: 'text-yellow-500',  // Warning blijft yellow
  success: 'text-brand-teal-500',
}
```
**Reden:** Info en Success → TEAL (positief/actie), Warning blijft yellow (alerts buiten brand systeem)

---

## 🟢 FASE 5: BUTTON STANDARDISATIE
**Doel:** Alle buttons volgen strikte regels

### 5.1 `src/components/ui/Button.tsx`
**Status:** ✅ Al correct - primary=teal, secondary=navy, premium=purple
**Geen wijziging nodig**

---

### 5.2 `src/components/sections/ContractTypes.tsx`
**Status:** ✅ Al correct - gebruikt getColorClasses met navy/teal/purple
**Geen wijziging nodig**

---

### 5.3 `src/components/sections/Sectors.tsx`
**Status:** ✅ Al correct - gradients gebruiken brand colors
**Geen wijziging nodig**

---

## 🔗 FASE 6: LINK & HOVER STATES

### 6.1 `src/components/layout/Header.tsx`
**Lijn 56:**
```typescript
// VOOR:
className="px-4 py-2 rounded-xl text-gray-700 hover:text-brand-teal-600 hover:bg-brand-teal-50 ..."

// NA:
// Blijft hetzelfde (al correct)
```
**Status:** ✅ Al correct - TEAL hover

---

### 6.2 `src/components/layout/Footer.tsx`
**Lijn 36, 44, 56, 62, 68, 74, 80, 106, 114:**
```typescript
// VOOR:
className="... hover:bg-brand-teal-500 ..."  // LinkedIn
className="... hover:bg-brand-purple-500 ..."  // Instagram
className="... hover:text-brand-teal-500 ..."  // Links

// NA:
// Blijft hetzelfde (al correct - TEAL voor links, PURPLE voor Instagram is OK voor variatie)
```
**Status:** ✅ Al correct

---

## 📊 FASE 7: VERIFICATIE & CLEANUP

### 7.1 Alle sectoren pagina's checken
**Bestanden:**
- `src/app/sectoren/horeca/page.tsx`
- `src/app/sectoren/retail/page.tsx`
- `src/app/sectoren/vastgoed/page.tsx`
- `src/app/sectoren/industrie/page.tsx`
- `src/app/sectoren/agrarisch/page.tsx`
- `src/app/sectoren/kantoren/page.tsx`

**Actie:** Controleren of alle CTA buttons TEAL zijn, headings NAVY, etc.
**Verwachte status:** Waarschijnlijk al correct, maar verificatie nodig

---

### 7.2 Calculator componenten
**Bestanden:**
- `src/components/calculator/QuickCalculator.tsx`
- `src/components/calculator/ProgressBar.tsx`
- `src/components/calculator/VoorkeurenForm.tsx`
- `src/components/calculator/BedrijfsgegevensForm.tsx`

**Actie:** Verificeren dat alle primary buttons TEAL zijn, focus states TEAL
**Verwachte status:** Waarschijnlijk al correct, maar verificatie nodig

---

### 7.3 Admin panel componenten
**Bestanden:**
- `src/components/admin/AdminLayout.tsx`
- `src/components/admin/LeverancierForm.tsx`
- `src/components/admin/VastContractForm.tsx`
- `src/components/admin/DynamischContractForm.tsx`
- `src/components/admin/MaatwerkContractForm.tsx`

**Actie:** Verificeren dat primary actions TEAL zijn, secondary NAVY
**Verwachte status:** Waarschijnlijk al correct, maar verificatie nodig

---

## ✅ IMPLEMENTATIE CHECKLIST

### Fase 1: Orange → Teal (6 bestanden)
- [ ] `src/app/admin/tarieven/netbeheer/page.tsx` - Gas tab button
- [ ] `src/app/admin/tarieven/page.tsx` - Gas icon
- [ ] `src/components/calculator/ContractCard.tsx` - Teruglevering sectie
- [ ] `src/components/calculator/EditVerbruikForm.tsx` - Gas icon + checkbox
- [ ] `src/components/calculator/EditVerbruikPanel.tsx` - Gas icon + checkbox + badge
- [ ] `src/components/calculator/VerbruikForm.tsx` - Verificatie (al correct?)

### Fase 2: Purple/Teal inconsistenties (3 bestanden)
- [ ] `src/components/calculator/FloatingEditButton.tsx` - Purple → Teal
- [ ] `src/components/sections/HowItWorks.tsx` - Code aanpassen voor TEAL support
- [ ] `src/components/sections/Testimonials.tsx` - Stat nummer Purple → Teal

### Fase 3: Blue → Teal/Navy (6 bestanden)
- [ ] `src/app/contract/bevestiging/page.tsx` - Status badge
- [ ] `src/app/producten/vast-contract/page.tsx` - Badge border
- [ ] `src/components/admin/VastContractForm.tsx` - Info box + document icon
- [ ] `src/components/admin/DynamischContractForm.tsx` - Document icon
- [ ] `src/components/admin/MaatwerkContractForm.tsx` - Document icon
- [ ] `src/components/calculator/ContractCard.tsx` - Document + check icons

### Fase 4: Badge standaardisatie (3 bestanden)
- [ ] `src/components/admin/ContractenList.tsx` - Contract type badges + "Populair" badge
- [ ] `src/app/admin/contracten/page.tsx` - Maatwerk count
- [ ] `src/components/ui/InfoBox.tsx` - Info/Success → Teal

### Fase 5: Button verificatie (3 bestanden)
- [ ] `src/components/ui/Button.tsx` - Verificatie (al correct)
- [ ] `src/components/sections/ContractTypes.tsx` - Verificatie (al correct)
- [ ] `src/components/sections/Sectors.tsx` - Verificatie (al correct)

### Fase 6: Link verificatie (2 bestanden)
- [ ] `src/components/layout/Header.tsx` - Verificatie (al correct)
- [ ] `src/components/layout/Footer.tsx` - Verificatie (al correct)

### Fase 7: Volledige verificatie (12+ bestanden)
- [ ] Alle sectoren pagina's
- [ ] Alle calculator componenten
- [ ] Alle admin componenten
- [ ] Alle product pagina's
- [ ] Overige pagina's

---

## 🎯 TOTALE IMPACT

**Exacte wijzigingen:**
- **18 bestanden** met concrete wijzigingen
- **~40 locaties** waar kleuren worden aangepast
- **0 breaking changes** - alleen visuele updates
- **100% backward compatible**

**Specifieke wijzigingen per fase:**
1. **Fase 1 - Orange → Teal:** 6 bestanden, ~15 locaties
2. **Fase 2 - Purple/Teal inconsistenties:** 3 bestanden, ~4 locaties
3. **Fase 3 - Blue → Teal/Navy:** 6 bestanden, ~8 locaties
4. **Fase 4 - Badge standaardisatie:** 3 bestanden, ~6 locaties
5. **Code fixes (HowItWorks):** 1 bestand, ~2 locaties

**Verificaties:**
- **16+ bestanden** die gecontroleerd moeten worden
- **Geen wijzigingen verwacht** maar verificatie essentieel

---

## 📝 NOTITIES

1. **Orange volledig verwijderen** (behalve warnings buiten brand systeem)
2. **Purple alleen voor premium/special** - niet voor primary actions
3. **Teal is de primaire actie kleur** - alle CTA's, links, hover states
4. **Navy voor structuur** - headings, backgrounds, secondary buttons
5. **Gray voor neutraal** - tekst, borders, disabled states

---

## 🚀 IMPLEMENTATIE VOLGORDE

1. **Eerst:** Orange → Teal conversies (Fase 1)
2. **Dan:** Purple/Teal fixes (Fase 2)
3. **Dan:** Blue → Teal/Navy conversies (Fase 3)
4. **Dan:** Badge standaardisatie (Fase 4)
5. **Tenslotte:** Volledige verificatie (Fase 7)

---

**Klaar voor implementatie na goedkeuring!** ✅

