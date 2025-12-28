# 🎬 Animaties Overzicht - PakketAdvies Website

## 📊 Samenvatting

**Huidige Status**: De website heeft **zeer weinig animaties**. De meeste interacties zijn statisch of hebben alleen basis hover-effecten.

**Performance Prioriteit**: ✅ Alle voorgestelde animaties zijn CSS-based (geen JavaScript libraries) en gebruiken `transform` en `opacity` voor optimale performance.

---

## ✅ BESTAANDE ANIMATIES

### 1. **CSS Keyframes (globals.css)**
- ✅ `slide-down` - 0.3s ease-out
- ✅ `slide-up` - 0.3s ease-out  
- ✅ `scale-in` - 0.2s ease-out
- ✅ `fade-in` - 0.2s ease-out
- ✅ `bounce-in` - 0.5s ease-out
- ✅ `pulse-slow` - 4s infinite
- ✅ `float` - 3s infinite

**Gebruik**: Zeer beperkt, vooral in `contract/bevestiging` pagina.

### 2. **Hover Effecten (Tailwind Classes)**

#### **Buttons** (`Button.tsx`)
- ✅ `hover:scale-105` - 5% scale op hover
- ✅ `transition-all duration-300` - 300ms transitions
- ✅ `hover:shadow-xl` - Shadow versterking
- ✅ **Desktop & Mobile**: Beide

#### **Cards** (`Card.tsx`)
- ✅ `hover:shadow-lg` - Shadow versterking
- ✅ `hover:-translate-y-0.5` - Subtiele lift (2px)
- ✅ `transition-all duration-250` - 250ms transitions
- ✅ **Desktop & Mobile**: Beide

#### **Contract Cards** (`ContractCard.tsx`, `ConsumerContractRowCard.tsx`)
- ✅ `hover:shadow-lg` - Shadow versterking
- ✅ `transition-all duration-200` - 200ms transitions
- ✅ **Desktop & Mobile**: Beide

### 3. **Drawer/Slide-over Animaties**

#### **SiteMenuDrawer** (`SiteMenuDrawer.tsx`)
- ❌ **GEEN animatie** - Drawer verschijnt direct zonder slide-in effect
- **Desktop**: Slide-in van rechts (420px width)
- **Mobile**: Full-screen overlay

#### **ContractDetailsDrawer** (`ContractDetailsDrawer.tsx`)
- ✅ **Mount/unmount animatie** - 250ms fade + slide
- ✅ `visible` state met 10ms delay voor smooth entry
- ✅ **Desktop**: Slide-in van rechts
- ✅ **Mobile**: Full-screen slide-in

#### **Keuzehulp** (`Keuzehulp.tsx`)
- ✅ **Zelfde animatie** als ContractDetailsDrawer
- ✅ 250ms fade + slide
- ✅ **Desktop**: Slide-in van rechts
- ✅ **Mobile**: Full-screen slide-in

### 4. **Modal Animaties** (`Modal.tsx`)
- ✅ `animate-slide-up` - Mobile: bottom sheet slide-up
- ✅ `animate-scale-in` - Desktop: centered scale-in
- ✅ Backdrop fade-in
- ✅ **Desktop & Mobile**: Verschillende animaties

### 5. **HowItWorks Sectie** (`HowItWorks.tsx`)
- ✅ `hover-lift` class - Card lift op hover
- ✅ `group-hover:scale-110` - Icon/badge scale op hover
- ✅ `group-hover:bg-brand-purple-500` - Color transition
- ✅ `transition-all duration-300` - 300ms transitions
- ✅ `animationDelay` per step (0.1s stagger)
- ✅ **Alleen Desktop**: Hover effecten werken niet op mobile

### 6. **Loading States**

#### **Spinners**
- ✅ `animate-spin` - Tailwind default spinner
- ✅ Gebruikt in: PrijzenGrafiek, PrijzenTabel, etc.
- ✅ **Desktop & Mobile**: Beide

#### **Skeleton Loaders**
- ❌ **GEEN** - Geen skeleton loaders geïmplementeerd

### 7. **Form Inputs** (`Input.tsx`)
- ✅ `focus:ring-2` - Focus ring
- ✅ `transition-colors` - Color transitions
- ✅ **Desktop & Mobile**: Beide

### 8. **Bevestiging Pagina** (`contract/bevestiging/page.tsx`)
- ✅ `animate-scale-in` - Custom scale-in animatie
- ✅ `animate-slide-up` - Staggered slide-up
- ✅ `animate-bounce-slow` - Slow bounce animatie
- ✅ Confetti effect (canvas-confetti library)
- ✅ **Desktop & Mobile**: Beide

---

## ❌ ONTBREKENDE ANIMATIES

### **Kritieke Gebieden (High Impact, Low Performance Cost)**

#### 1. **Page Transitions**
- ❌ **GEEN** - Pagina's laden zonder fade/slide
- **Impact**: ⭐⭐⭐⭐⭐ (Zeer hoog)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Subtiele fade-in (200ms) bij page load

#### 2. **Scroll-triggered Animaties**
- ❌ **GEEN** - Content verschijnt direct zonder animatie
- **Impact**: ⭐⭐⭐⭐ (Hoog)
- **Performance**: ✅ Goed (Intersection Observer + CSS)
- **Voorstel**: Fade-in + slide-up voor cards/sections bij scroll

#### 3. **List Items (Staggered Animation)**
- ❌ **GEEN** - Contract cards verschijnen allemaal tegelijk
- **Impact**: ⭐⭐⭐⭐ (Hoog)
- **Performance**: ✅ Goed (CSS animation-delay)
- **Voorstel**: Staggered fade-in voor contract cards (50ms delay per item)

#### 4. **Button States**
- ⚠️ **Beperkt** - Alleen hover, geen loading/active states
- **Impact**: ⭐⭐⭐ (Medium)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: 
  - Loading spinner animatie
  - Active state (scale-down)
  - Success state (checkmark fade-in)

#### 5. **Form Validation**
- ❌ **GEEN** - Errors verschijnen direct zonder animatie
- **Impact**: ⭐⭐⭐ (Medium)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Slide-down + fade-in voor error messages

#### 6. **Dropdown/Select Menus**
- ❌ **GEEN** - Dropdowns openen direct
- **Impact**: ⭐⭐⭐ (Medium)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Fade-in + slide-down (150ms)

#### 7. **Tooltips** (`Tooltip.tsx`)
- ⚠️ **Beperkt** - Alleen basis fade
- **Impact**: ⭐⭐ (Laag)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Verbeterde fade-in + scale (200ms)

#### 8. **Skeleton Loaders**
- ❌ **GEEN** - Alleen spinners
- **Impact**: ⭐⭐⭐⭐ (Hoog - UX)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Pulse animatie voor skeleton cards

#### 9. **Header/Navigation**
- ❌ **GEEN** - Header is statisch
- **Impact**: ⭐⭐ (Laag)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: 
  - Subtiele shadow op scroll (desktop)
  - Menu icon transform (hamburger → X)

#### 10. **Search/Filter Results**
- ❌ **GEEN** - Results verschijnen direct
- **Impact**: ⭐⭐⭐ (Medium)
- **Performance**: ✅ Goed (CSS only)
- **Voorstel**: Fade-in voor nieuwe results

---

## 🎯 VOORGESTELDE ANIMATIES (Prioriteit)

### **Fase 1: High Impact, Zero Performance Cost** ⚡

#### 1. **Page Load Fade-in**
- **Type**: Fade-in (200ms)
- **Waar**: Alle pagina's
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 2. **Contract Cards Staggered Animation**
- **Type**: Fade-in + slide-up (staggered 50ms)
- **Waar**: Results pagina (zowel business als consumer)
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS animation-delay)

#### 3. **Button Loading State**
- **Type**: Spinner fade-in + button scale-down (150ms)
- **Waar**: Alle submit buttons
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 4. **Form Error Messages**
- **Type**: Slide-down + fade-in (200ms)
- **Waar**: Alle form validatie errors
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 5. **SiteMenuDrawer Slide-in**
- **Type**: Slide-in van rechts (300ms ease-out)
- **Waar**: SiteMenuDrawer component
- **Desktop**: ✅ (420px width)
- **Mobile**: ✅ (full-screen)
- **Performance**: ✅ Excellent (CSS transform)

---

### **Fase 2: Medium Impact, Low Performance Cost** 🚀

#### 6. **Scroll-triggered Animations (Intersection Observer)**
- **Type**: Fade-in + slide-up bij scroll
- **Waar**: Sections, cards, features
- **Desktop**: ✅
- **Mobile**: ⚠️ Optioneel (kan performance impact hebben)
- **Performance**: ✅ Goed (lazy loading met Intersection Observer)

#### 7. **Skeleton Loaders**
- **Type**: Pulse animatie
- **Waar**: Loading states (contracts, data tables)
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 8. **Dropdown/Select Animations**
- **Type**: Fade-in + slide-down (150ms)
- **Waar**: Alle dropdowns, selects
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 9. **Tooltip Improvements**
- **Type**: Fade-in + scale (200ms)
- **Waar**: Tooltip component
- **Desktop**: ✅
- **Mobile**: ❌ (tooltips werken niet goed op mobile)
- **Performance**: ✅ Excellent (CSS only)

#### 10. **Header Scroll Shadow**
- **Type**: Box-shadow transition (200ms)
- **Waar**: Header component
- **Desktop**: ✅
- **Mobile**: ❌ (niet nodig)
- **Performance**: ✅ Excellent (CSS only)

---

### **Fase 3: Nice-to-Have, Low Performance Cost** ✨

#### 11. **Menu Icon Transform**
- **Type**: Hamburger → X transform (200ms)
- **Waar**: Header menu button
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 12. **Success States**
- **Type**: Checkmark fade-in + scale (300ms)
- **Waar**: Form submissions, actions
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 13. **Number Counters**
- **Type**: Count-up animatie (voor statistieken)
- **Waar**: Homepage, over-ons pagina
- **Desktop**: ✅
- **Mobile**: ⚠️ Optioneel (JavaScript nodig)
- **Performance**: ⚠️ Medium (JavaScript, maar alleen bij scroll)

#### 14. **Progress Bar Animation**
- **Type**: Width transition (smooth)
- **Waar**: Calculator progress bar
- **Desktop**: ✅
- **Mobile**: ✅
- **Performance**: ✅ Excellent (CSS only)

#### 15. **Card Hover Improvements**
- **Type**: Meer subtiele lift + shadow
- **Waar**: Alle cards
- **Desktop**: ✅
- **Mobile**: ❌ (hover werkt niet)
- **Performance**: ✅ Excellent (CSS only)

---

## 📱 DESKTOP vs MOBILE

### **Desktop Only Animaties**
- ✅ Hover effects (cards, buttons)
- ✅ Header scroll shadow
- ✅ Menu icon transform (optioneel)

### **Mobile Only Animaties**
- ✅ Bottom sheet slide-up (modals)
- ✅ Full-screen drawer slide-in

### **Beide Platforms**
- ✅ Page load fade-in
- ✅ Staggered card animations
- ✅ Button loading states
- ✅ Form error animations
- ✅ Drawer slide-in
- ✅ Skeleton loaders
- ✅ Dropdown animations

---

## ⚡ PERFORMANCE OVERWEGINGEN

### **✅ Goed (CSS Only)**
- Alle voorgestelde animaties gebruiken `transform` en `opacity`
- Geen `width`, `height`, `top`, `left` animaties (trigger layout)
- Hardware-accelerated (GPU)
- Geen JavaScript libraries nodig

### **⚠️ Let Op**
- **Intersection Observer**: Kan performance impact hebben op mobile met veel elements
- **Number Counters**: JavaScript nodig, maar alleen bij scroll (lazy)
- **Scroll-triggered**: Gebruik `will-change` spaarzaam

### **❌ Vermijden**
- ❌ Framer Motion of andere JS animation libraries (te zwaar)
- ❌ Animaties op `width`/`height` (layout thrashing)
- ❌ Te veel simultane animaties (>10 tegelijk)
- ❌ Animaties tijdens scroll op mobile (kan janky zijn)

---

## 🎨 ANIMATIE TIMING

### **Snelle Interacties** (100-200ms)
- Button clicks
- Hover states
- Dropdowns
- Tooltips

### **Medium Interacties** (200-300ms)
- Page transitions
- Drawer slide-in
- Form errors
- Card hover

### **Langzame Interacties** (300-500ms)
- Page load fade-in
- Staggered animations
- Success states

### **Infinite Animations** (alleen subtiel)
- Pulse (loading)
- Float (decoratief, spaarzaam)

---

## 📋 IMPLEMENTATIE CHECKLIST

### **Fase 1 (High Priority)**
- [ ] Page load fade-in
- [ ] Contract cards staggered animation
- [ ] Button loading state
- [ ] Form error animations
- [ ] SiteMenuDrawer slide-in

### **Fase 2 (Medium Priority)**
- [ ] Scroll-triggered animations (optioneel)
- [ ] Skeleton loaders
- [ ] Dropdown animations
- [ ] Tooltip improvements
- [ ] Header scroll shadow

### **Fase 3 (Nice-to-Have)**
- [ ] Menu icon transform
- [ ] Success states
- [ ] Number counters (optioneel)
- [ ] Progress bar animation
- [ ] Card hover improvements

---

## 🔍 SPECIFIEKE COMPONENTEN ANALYSE

### **Header** (`Header.tsx`)
- **Huidig**: Geen animaties
- **Voorstel**: 
  - Menu icon transform (hamburger → X)
  - Scroll shadow (desktop)
  - Audience switch smooth transition

### **SiteMenuDrawer** (`SiteMenuDrawer.tsx`)
- **Huidig**: Geen slide-in animatie
- **Voorstel**: Slide-in van rechts (300ms ease-out)

### **Contract Cards** (`ContractCard.tsx`, `ConsumerContractRowCard.tsx`)
- **Huidig**: Alleen hover shadow
- **Voorstel**: 
  - Staggered fade-in bij load
  - Verbeterde hover lift
  - Loading skeleton

### **Forms** (`BedrijfsgegevensForm.tsx`, `ParticulierAanvraagForm.tsx`)
- **Huidig**: Geen animaties
- **Voorstel**: 
  - Error message slide-down
  - Success state checkmark
  - Loading button state

### **Calculator Flow** (`CalculatorFlow.tsx`)
- **Huidig**: Geen animaties
- **Voorstel**: 
  - Step transition fade
  - Progress bar smooth animation

### **Results Page** (`ResultatenFlow.tsx`)
- **Huidig**: Geen animaties
- **Voorstel**: 
  - Staggered card fade-in
  - Filter results fade-in

---

## 💡 AANBEVELINGEN

1. **Start met Fase 1** - High impact, zero performance cost
2. **Test op mobile** - Zorg dat animaties niet janky zijn
3. **Gebruik `prefers-reduced-motion`** - Respecteer gebruikersvoorkeuren
4. **Performance budget** - Max 60fps, gebruik `will-change` spaarzaam
5. **Consistentie** - Gebruik dezelfde timing curves (ease-out voor meeste)

---

## 🚫 WAT NIET TOEVOEGEN

- ❌ Parallax scrolling (performance killer)
- ❌ Auto-playing video backgrounds
- ❌ Complexe 3D transforms
- ❌ Te veel simultane animaties
- ❌ Animaties die layout shifts veroorzaken
- ❌ JavaScript animation libraries (Framer Motion, etc.)

---

**Laatste Update**: 27 december 2025
**Status**: Klaar voor implementatie review

