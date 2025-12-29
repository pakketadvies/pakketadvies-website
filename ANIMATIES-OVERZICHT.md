# 📊 Animaties Overzicht - PakketAdvies Website

**Datum:** 27 december 2025  
**Status:** Analyse van bestaande animaties en suggesties voor verbetering

---

## 🎯 Samenvatting

De website heeft momenteel **minimale animaties**. De meeste animaties zijn:
- **CSS transitions** op hover states (buttons, cards, links)
- **Tailwind utility classes** voor fade-in/slide-in effecten
- **Geen** complexe JavaScript animaties (Framer Motion is verwijderd)
- **Geen** page transitions meer (PageTransition component is verwijderd)

**Performance:** ✅ Goed - alle animaties zijn CSS-based en lightweight.

---

## 📋 BESTAANDE ANIMATIES

### 1. **CSS Transitions (Tailwind)**

#### **Hover States**
- **Buttons** (`Button.tsx`):
  - `hover:scale-105` - lichte scale op hover (alle varianten)
  - `hover:shadow-xl` - shadow versterking
  - `transition-all duration-300` - vloeiende overgang
  - **Desktop & Mobile:** ✅ Beide

- **Cards** (`ContractCard.tsx`, `ConsumerContractRowCard.tsx`):
  - `hover:shadow-lg` - shadow versterking op hover
  - `transition-all duration-200` - snelle overgang
  - **Desktop & Mobile:** ✅ Beide (maar minder zichtbaar op mobile)

- **Links** (verschillende componenten):
  - `hover:text-brand-teal-700` - kleur verandering
  - `hover:bg-brand-teal-50` - achtergrond verandering
  - `transition-colors` - kleur overgang
  - **Desktop & Mobile:** ✅ Beide

- **Icons** (pijltjes, etc.):
  - `group-hover:translate-x-0.5` - kleine beweging op hover
  - `transition-transform` - transform overgang
  - **Desktop & Mobile:** ✅ Beide

#### **Focus States**
- `focus:ring-2 focus:ring-offset-2` - focus ring voor accessibility
- **Desktop & Mobile:** ✅ Beide

#### **Active States**
- `active:bg-gray-200` - feedback bij klik
- **Desktop & Mobile:** ✅ Beide

---

### 2. **Custom CSS Animations** (`globals.css`)

#### **Defined Keyframes:**
1. **`slide-down`** (0.3s ease-out)
   - Gebruikt: ✅ `animate-slide-down` class
   - Locaties: Form success/error messages, dropdowns
   - **Desktop & Mobile:** ✅ Beide

2. **`slide-up`** (0.3s ease-out)
   - Gebruikt: ✅ `animate-slide-up` class
   - Locaties: Modals (mobile), bottom sheets
   - **Desktop & Mobile:** ✅ Beide (meer op mobile)

3. **`scale-in`** (0.2s ease-out)
   - Gebruikt: ✅ `animate-scale-in` class
   - Locaties: Modals (desktop), tooltips
   - **Desktop & Mobile:** ✅ Beide

4. **`fade-in`** (0.2s ease-out)
   - Gebruikt: ✅ `animate-fade-in` class
   - Locaties: Tooltips, overlays
   - **Desktop & Mobile:** ✅ Beide

5. **`bounce-in`** (0.5s ease-out)
   - Gebruikt: ❌ **NIET GEBRUIKT**
   - **Status:** Gedefinieerd maar niet gebruikt

6. **`pulse-slow`** (4s infinite)
   - Gebruikt: ❌ **NIET GEBRUIKT**
   - **Status:** Gedefinieerd maar niet gebruikt

7. **`float`** (3s infinite)
   - Gebruikt: ❌ **NIET GEBRUIKT**
   - **Status:** Gedefinieerd maar niet gebruikt

#### **Utility Classes:**
- **`hover-lift`** (globals.css):
  - `transform: translateY(-4px)` + shadow op hover
  - Gebruikt: ✅ `HowItWorks.tsx` cards
  - **Desktop & Mobile:** ✅ Beide

---

### 3. **Component-Specific Animations**

#### **SiteMenuDrawer** (`SiteMenuDrawer.tsx`)
- **Animatie:** ❌ **GEEN**
- **Status:** Drawer verschijnt direct zonder animatie
- **Desktop & Mobile:** ❌ Geen animatie op beide

#### **ContractDetailsDrawer** (`ContractDetailsDrawer.tsx`)
- **Animatie:** ⚠️ **PARTIEEL**
- **Status:** Gebruikt `mounted` + `visible` state met `setTimeout` voor fade-in
- **Implementatie:** CSS-based via conditional classes
- **Desktop & Mobile:** ✅ Beide (slide-in from right)

#### **Keuzehulp** (`Keuzehulp.tsx`)
- **Animatie:** ⚠️ **PARTIEEL**
- **Status:** Zelfde als ContractDetailsDrawer (mounted/visible pattern)
- **Desktop & Mobile:** ✅ Beide (slide-in from right)

#### **Modal** (`Modal.tsx`)
- **Animatie:** ✅ **JA**
- **Mobile:** `animate-slide-up` (van onder)
- **Desktop:** `animate-scale-in` (centered scale)
- **Backdrop:** `transition-opacity` fade-in
- **Desktop & Mobile:** ✅ Beide (verschillende animaties)

#### **Tooltip** (`Tooltip.tsx`)
- **Animatie:** ✅ **JA**
- **Backdrop:** `animate-fade-in`
- **Content:** `animate-scale-in`
- **Desktop & Mobile:** ✅ Beide

#### **ProgressBar** (`ProgressBar.tsx`)
- **Animatie:** ✅ **JA**
- **Status:** `transition-all duration-500 ease-out` op progress bar
- **Desktop & Mobile:** ✅ Beide

#### **Loading Spinners**
- **Animatie:** ✅ **JA**
- **Status:** `animate-spin` (Tailwind default)
- **Locaties:** Forms, buttons, data loading
- **Desktop & Mobile:** ✅ Beide

#### **Form Success/Error Messages**
- **Animatie:** ✅ **JA**
- **Status:** `animate-slide-down` voor nieuwe messages
- **Desktop & Mobile:** ✅ Beide

---

### 4. **Page-Specific Animations**

#### **Bevestiging Page** (`contract/bevestiging/page.tsx`)
- **Animatie:** ✅ **JA** (custom inline styles)
- **Animations:**
  - `scale-in` (0.5s) - voor success icon
  - `slide-up` (0.6s) - voor content met delays
  - `bounce-slow` (2s infinite) - voor floating effect
- **Confetti:** ✅ `canvas-confetti` library
- **Desktop & Mobile:** ✅ Beide

---

## 🚫 VERWIJDERDE ANIMATIES

1. **Page Transitions** (`PageTransition.tsx`)
   - **Status:** ❌ Verwijderd (gebruiker wilde dit niet)
   - **Reden:** Te opvallend, storend voor gebruikerservaring

2. **Framer Motion**
   - **Status:** ❌ Verwijderd uit package.json
   - **Reden:** Performance, bundle size

---

## 💡 SUGGESTIES VOOR NIEUWE ANIMATIES

### **PRIORITEIT 1: Hoog Impact, Laag Risico**

#### 1. **SiteMenuDrawer Slide-In Animatie**
- **Wat:** Slide-in van rechts naar links (desktop) / full-screen fade-in (mobile)
- **Waarom:** Nu verschijnt menu direct, voelt abrupt
- **Performance:** ✅ CSS transform (will-change: transform)
- **Desktop:** Slide van rechts (300ms ease-out)
- **Mobile:** Fade-in + slide-up (250ms ease-out)
- **Impact:** ⭐⭐⭐⭐⭐ (Groot - eerste indruk)

#### 2. **Contract Cards Staggered Fade-In**
- **Wat:** Contract cards verschijnen met kleine delay tussen elkaar
- **Waarom:** Maakt results page levendiger, helpt scannen
- **Performance:** ✅ CSS only, geen JS
- **Implementatie:** `animation-delay` per card (0.05s increments)
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐⭐ (Middel-Hoog)

#### 3. **Form Field Focus Animations**
- **Wat:** Subtle scale-up (1.02x) + border color transition op focus
- **Waarom:** Betere feedback, modernere feel
- **Performance:** ✅ CSS only
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐ (Middel)

#### 4. **Button Loading State**
- **Wat:** Spinner fade-in + button text fade-out tijdens loading
- **Waarom:** Duidelijke feedback dat actie wordt verwerkt
- **Performance:** ✅ CSS transitions
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐⭐ (Middel-Hoog)

#### 5. **Accordion/Collapsible Sections**
- **Wat:** Smooth height transition bij openen/sluiten
- **Waarom:** ContractCard accordions voelen nu abrupt
- **Performance:** ⚠️ CSS `max-height` transition (kan tricky zijn)
- **Alternatief:** JavaScript met `requestAnimationFrame` voor smooth animatie
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐⭐ (Middel-Hoog)

---

### **PRIORITEIT 2: Nice-to-Have, Subtle**

#### 6. **Scroll-Triggered Animations (Intersection Observer)**
- **Wat:** Fade-in + slide-up wanneer elementen in viewport komen
- **Waarom:** Maakt lange pagina's levendiger
- **Performance:** ⚠️ Intersection Observer (lightweight, maar extra JS)
- **Locaties:** 
  - Hero sections
  - Feature cards
  - Testimonials
  - "How it Works" sections
- **Desktop & Mobile:** ✅ Beide (maar minder op mobile voor performance)
- **Impact:** ⭐⭐⭐ (Middel)

#### 7. **Skeleton Loading States**
- **Wat:** Shimmer/pulse effect tijdens data loading
- **Waarom:** Betere UX dan lege states of spinners
- **Performance:** ✅ CSS animation (pulse)
- **Locaties:** Contract cards, results page
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐⭐ (Middel-Hoog)

#### 8. **Toast Notifications**
- **Wat:** Slide-in from top + fade-out na timeout
- **Waarom:** Betere feedback dan inline messages
- **Performance:** ✅ CSS transitions
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐ (Middel)

#### 9. **Input Validation Feedback**
- **Wat:** Subtle shake animation bij invalid input
- **Waarom:** Duidelijke visuele feedback
- **Performance:** ✅ CSS keyframe animation (0.3s)
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐ (Laag-Middel)

#### 10. **Hover Card Lift Effect (Verbetering)**
- **Wat:** Contract cards krijgen meer lift + shadow op hover
- **Waarom:** Maakt interactie duidelijker
- **Performance:** ✅ CSS transform (will-change)
- **Desktop:** ✅ (hover werkt niet op mobile)
- **Impact:** ⭐⭐⭐ (Middel)

---

### **PRIORITEIT 3: Advanced, Optioneel**

#### 11. **Micro-Interactions**
- **Wat:** 
  - Checkbox/radio button checkmark animation
  - Switch toggle animation
  - Badge count-up animation
- **Waarom:** Maakt UI levendiger, premium feel
- **Performance:** ✅ CSS transitions
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐ (Laag-Middel)

#### 12. **Progress Indicators**
- **Wat:** Smooth progress bar animations (beyond current basic transition)
- **Waarom:** Betere feedback tijdens multi-step forms
- **Performance:** ✅ CSS transitions
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐⭐ (Middel)

#### 13. **Parallax Effects (Subtle)**
- **Wat:** Background images bewegen langzamer dan content bij scroll
- **Waarom:** Depth gevoel, premium look
- **Performance:** ⚠️ Kan performance impact hebben op mobile
- **Locaties:** Hero sections
- **Desktop:** ✅ (alleen desktop)
- **Mobile:** ❌ (skip voor performance)
- **Impact:** ⭐⭐ (Laag-Middel)

#### 14. **Number Count-Up Animation**
- **Wat:** Cijfers tellen op van 0 naar eindwaarde
- **Waarom:** Visueel aantrekkelijk voor statistieken
- **Performance:** ⚠️ JavaScript (maar lightweight)
- **Locaties:** Homepage stats, results page savings
- **Desktop & Mobile:** ✅ Beide
- **Impact:** ⭐⭐ (Laag-Middel)

---

## ⚠️ ANIMATIES OM TE VERMIJDEN

1. **Auto-playing animations** (distracting)
2. **Heavy JavaScript animations** (performance)
3. **Page transitions** (gebruiker wilde dit niet)
4. **Parallax op mobile** (performance killer)
5. **Complex 3D transforms** (browser support, performance)

---

## 📊 PERFORMANCE OVERWEGINGEN

### **Best Practices:**
- ✅ Gebruik `transform` en `opacity` (GPU-accelerated)
- ✅ Gebruik `will-change` voor elementen die geanimeerd worden
- ✅ Vermijd animeren van `width`, `height`, `top`, `left` (layout thrashing)
- ✅ Gebruik `prefers-reduced-motion` media query voor accessibility
- ✅ Limiteer animaties op mobile (batterij, performance)

### **CSS vs JavaScript:**
- ✅ **CSS:** Voor simpele transitions, hover states, fade-in/slide-in
- ⚠️ **JavaScript:** Alleen voor complexe animaties (accordion height, scroll-triggered)

### **Mobile-Specific:**
- ✅ Kortere durations (200-300ms vs 300-500ms desktop)
- ✅ Minder animaties tegelijk
- ✅ Geen parallax
- ✅ Geen auto-playing animations

---

## 🎨 ANIMATIE STIJL GUIDELINES

### **Timing:**
- **Fast:** 150-200ms (micro-interactions, hover)
- **Normal:** 250-300ms (buttons, cards, modals)
- **Slow:** 400-500ms (page transitions, complex animations)

### **Easing:**
- **Ease-out:** Meeste animaties (natuurlijk gevoel)
- **Ease-in-out:** Voor symmetrische animaties
- **Cubic-bezier:** Voor custom feel (sparingly)

### **Principles:**
1. **Subtle:** Animaties moeten niet opvallen, maar wel merkbaar zijn
2. **Purposeful:** Elke animatie heeft een doel (feedback, guidance, delight)
3. **Consistent:** Zelfde type animaties gebruiken voor zelfde acties
4. **Accessible:** Respecteer `prefers-reduced-motion`

---

## 📝 IMPLEMENTATIE CHECKLIST

### **Voor elke nieuwe animatie:**
- [ ] Performance test (Lighthouse, Chrome DevTools)
- [ ] Mobile test (verschillende devices)
- [ ] Accessibility check (`prefers-reduced-motion`)
- [ ] Cross-browser test (Chrome, Firefox, Safari)
- [ ] User testing (optioneel, maar aanbevolen)

---

## 🚀 VOLGENDE STAPPEN

1. **Review dit document** met het team
2. **Prioriteer** welke animaties toe te voegen
3. **Implementeer** één voor één (niet alles tegelijk)
4. **Test** performance en UX impact
5. **Itereer** op basis van feedback

---

**Laatste update:** 27 december 2025  
**Auteur:** AI Assistant (Auto)

