# ⚡ Animaties Performance Analyse - Desktop vs Mobile

## 📊 Executive Summary

**Kritieke Inzicht**: Mobile devices hebben **10-100x minder rekenkracht** dan desktop computers. Animaties die soepel draaien op desktop kunnen op mobile devices **janky, traag of zelfs onbruikbaar** zijn.

**Aanbeveling**: Implementeer **progressive enhancement** - basis animaties voor alle devices, geavanceerde animaties alleen voor high-end devices.

---

## 🖥️ DESKTOP PERFORMANCE

### **Hardware Specificaties**
- **CPU**: 4-16 cores, 2.5-4.5 GHz
- **GPU**: Dedicated graphics card (hardware acceleration)
- **RAM**: 8-32 GB
- **Battery**: Niet relevant (altijd aangesloten)
- **Network**: Meestal stabiel (WiFi/Ethernet)

### **Performance Capaciteit**
- ✅ **60 FPS** - Geen probleem, zelfs met complexe animaties
- ✅ **120 FPS** - Mogelijk op high-end displays
- ✅ **Meerdere simultane animaties** - Geen probleem
- ✅ **Complexe transforms** - Geen probleem
- ✅ **Parallax scrolling** - Mogelijk (maar niet aanbevolen)

### **Desktop Animaties - Aanbevolen**
| Animaties Type | FPS | Performance | Aanbevolen |
|---------------|-----|-------------|------------|
| CSS Transforms (transform, opacity) | 60 | ✅ Excellent | ✅ Ja |
| Hover effects | 60 | ✅ Excellent | ✅ Ja |
| Multiple simultaneous animations | 60 | ✅ Excellent | ✅ Ja |
| Scroll-triggered animations | 60 | ✅ Excellent | ✅ Ja |
| Complex keyframes | 60 | ✅ Excellent | ✅ Ja |
| Parallax scrolling | 30-60 | ⚠️ Medium | ❌ Nee (UX) |

### **Desktop Best Practices**
1. ✅ Gebruik `transform` en `opacity` (hardware-accelerated)
2. ✅ Gebruik `will-change` spaarzaam (alleen voor complexe animaties)
3. ✅ Combineer meerdere animaties zonder zorgen
4. ✅ Hover effects zijn prima (mouse interaction)
5. ✅ Scroll-triggered animations zijn prima

---

## 📱 MOBILE PERFORMANCE - OVERZICHT

### **Device Categorieën**

#### **1. High-End Mobile (iPhone 13+, Samsung S21+, Pixel 6+)**
- **CPU**: 6-8 cores, 2.0-3.2 GHz
- **GPU**: Dedicated, hardware-accelerated
- **RAM**: 6-12 GB
- **Battery**: Goed, maar animaties verbruiken energie
- **Network**: 4G/5G (variabel)

**Performance Capaciteit**:
- ✅ **60 FPS** - Mogelijk met goede optimalisatie
- ⚠️ **Meerdere simultane animaties** - Beperkt (max 5-8)
- ⚠️ **Complexe transforms** - Mogelijk, maar kan janky zijn
- ❌ **Parallax scrolling** - Niet aanbevolen (battery drain)

#### **2. Mid-Range Mobile (iPhone 11, Samsung A52, OnePlus Nord)**
- **CPU**: 4-6 cores, 1.8-2.5 GHz
- **GPU**: Integrated, basic hardware acceleration
- **RAM**: 4-6 GB
- **Battery**: Matig, animaties verbruiken significant energie
- **Network**: 4G (variabel)

**Performance Capaciteit**:
- ⚠️ **60 FPS** - Alleen met simpele animaties
- ⚠️ **Meerdere simultane animaties** - Beperkt (max 3-5)
- ❌ **Complexe transforms** - Kan janky zijn
- ❌ **Parallax scrolling** - Niet aanbevolen

#### **3. Low-End Mobile (iPhone SE, Samsung A12, budget Android)**
- **CPU**: 2-4 cores, 1.2-1.8 GHz
- **GPU**: Basic, limited hardware acceleration
- **RAM**: 2-4 GB
- **Battery**: Slecht, animaties verbruiken veel energie
- **Network**: 3G/4G (langzaam, onstabiel)

**Performance Capaciteit**:
- ❌ **60 FPS** - Moeilijk, vaak 30-45 FPS
- ❌ **Meerdere simultane animaties** - Zeer beperkt (max 1-2)
- ❌ **Complexe transforms** - Janky, slechte UX
- ❌ **Parallax scrolling** - Onbruikbaar
- ❌ **Scroll-triggered animations** - Kan problemen veroorzaken

---

## 🔋 BATTERY IMPACT

### **Desktop**
- ✅ **Geen impact** - Altijd aangesloten
- ✅ Animaties kunnen complexer zijn zonder zorgen

### **Mobile**
- ⚠️ **Significant impact** - Animaties verbruiken CPU/GPU → battery drain
- ⚠️ **Complexe animaties** = snellere battery drain
- ⚠️ **Scroll-triggered animations** = constant CPU/GPU gebruik tijdens scroll
- ⚠️ **Infinite animations** = constant battery drain

**Battery Impact Ranking** (van hoog naar laag):
1. ❌ Parallax scrolling (constant scroll calculations)
2. ❌ Infinite animations (pulse, float)
3. ⚠️ Scroll-triggered animations (Intersection Observer)
4. ✅ Hover effects (alleen bij interaction)
5. ✅ Page load animations (eenmalig)
6. ✅ Button click animations (kort, eenmalig)

---

## 📶 NETWORK CONSIDERATIONS

### **Desktop**
- ✅ Meestal stabiel (WiFi/Ethernet)
- ✅ Geen impact op animatie performance
- ✅ JavaScript libraries kunnen geladen worden (maar niet aanbevolen)

### **Mobile**
- ⚠️ Variabel (3G/4G/5G/WiFi)
- ⚠️ **Slow network** = delayed JavaScript execution = delayed animations
- ⚠️ **JavaScript animation libraries** = extra download = slechtere UX
- ✅ **CSS-only animaties** = geen network impact

**Network Impact**:
- ❌ JavaScript libraries (Framer Motion, GSAP) = +50-200KB download
- ✅ CSS-only animaties = 0KB extra download
- ⚠️ Intersection Observer (JavaScript) = minimale impact (native API)

---

## 🎯 PERFORMANCE METRICS

### **Frame Rate Doelen**

| Device Type | Target FPS | Minimum Acceptable | Jank Threshold |
|------------|------------|-------------------|----------------|
| Desktop | 60 FPS | 60 FPS | < 60 FPS |
| High-End Mobile | 60 FPS | 50 FPS | < 45 FPS |
| Mid-Range Mobile | 60 FPS | 45 FPS | < 30 FPS |
| Low-End Mobile | 45 FPS | 30 FPS | < 20 FPS |

### **Animation Duration Limits**

| Device Type | Max Duration | Recommended | Too Slow |
|------------|--------------|-------------|----------|
| Desktop | Geen limiet | 200-500ms | > 1000ms |
| High-End Mobile | 1000ms | 200-400ms | > 800ms |
| Mid-Range Mobile | 800ms | 200-300ms | > 600ms |
| Low-End Mobile | 500ms | 150-250ms | > 400ms |

**Regel**: Hoe langzamer het device, hoe korter de animatie moet zijn.

---

## 🚀 HARDWARE ACCELERATION

### **CSS Properties - Performance Ranking**

#### **✅ Excellent (Hardware-Accelerated)**
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness) - *beperkt*

**Gebruik deze voor alle animaties!**

#### **⚠️ Medium (Kan Layout Triggeren)**
- `width`, `height` - **Vermijden**
- `top`, `left`, `right`, `bottom` - **Vermijden**
- `margin`, `padding` - **Vermijden**
- `border-width` - **Vermijden**

**Deze properties triggeren layout recalculations = jank!**

#### **❌ Slecht (Layout Thrashing)**
- `display` changes
- `position` changes (static → fixed)
- `overflow` changes
- Font size changes

**Vermijd deze tijdens animaties!**

### **will-change Property**

**Gebruik spaarzaam** - Het reserveert GPU resources:

```css
/* ✅ Goed - Alleen voor complexe, langlopende animaties */
.will-animate {
  will-change: transform;
}

/* ❌ Slecht - Te veel will-change = performance degradatie */
.every-element {
  will-change: transform, opacity; /* Te veel! */
}
```

**Regel**: Gebruik `will-change` alleen voor:
- Elementen die binnenkort geanimeerd worden
- Langlopende animaties (> 1 seconde)
- Complexe transforms

**Verwijder `will-change` na animatie** om resources vrij te geven.

---

## 📱 MOBILE-SPECIFIEKE OVERWEGINGEN

### **Touch Interaction**

#### **Desktop (Mouse)**
- ✅ Hover states werken perfect
- ✅ Precise cursor control
- ✅ Click events zijn instant

#### **Mobile (Touch)**
- ❌ **Geen hover states** - Gebruik active/tap states
- ⚠️ **Touch delay** - 300ms delay op sommige devices (oude browsers)
- ⚠️ **Scroll performance** - Scroll events kunnen janky zijn

**Mobile Touch Best Practices**:
```css
/* ✅ Goed - Active state voor mobile */
.button:active {
  transform: scale(0.95);
}

/* ❌ Slecht - Hover werkt niet op mobile */
.button:hover {
  transform: scale(1.1);
}
```

### **Scroll Performance**

#### **Desktop**
- ✅ Smooth scrolling (60 FPS)
- ✅ Scroll-triggered animations werken goed
- ✅ Parallax mogelijk (maar niet aanbevolen)

#### **Mobile**
- ⚠️ **Scroll jank** - Kan voorkomen bij:
  - Te veel scroll listeners
  - Complexe scroll calculations
  - Layout changes tijdens scroll
- ⚠️ **Momentum scrolling** - iOS heeft native momentum, Android niet altijd
- ❌ **Parallax scrolling** - Niet aanbevolen (battery drain, jank)

**Mobile Scroll Best Practices**:
1. ✅ Gebruik `passive: true` voor scroll listeners
2. ✅ Debounce/throttle scroll events
3. ✅ Gebruik Intersection Observer (native, geoptimaliseerd)
4. ❌ Vermijd layout changes tijdens scroll
5. ❌ Vermijd complexe calculations tijdens scroll

---

## 🎨 ANIMATIE COMPLEXITEIT

### **Simpele Animaties (✅ Alle Devices)**
- Fade-in/out (opacity)
- Slide-in/out (transform: translateX/Y)
- Scale (transform: scale)
- Single property changes

**Performance**: ✅ Excellent op alle devices

### **Medium Animaties (⚠️ High-End Mobile+)**
- Multiple simultaneous transforms
- Staggered animations (3-5 items)
- Combined opacity + transform
- Simple keyframes

**Performance**: 
- ✅ Desktop: Excellent
- ✅ High-End Mobile: Good
- ⚠️ Mid-Range Mobile: Acceptable
- ❌ Low-End Mobile: Kan janky zijn

### **Complexe Animaties (❌ Alleen Desktop)**
- Parallax scrolling
- Multiple simultaneous complex transforms
- Many staggered animations (> 10 items)
- Complex keyframes met veel keyframes
- 3D transforms

**Performance**:
- ✅ Desktop: Good
- ❌ Mobile: Niet aanbevolen

---

## 🔍 TESTING STRATEGIE

### **Device Testing Matrix**

| Device Category | Test Devices | Priority |
|----------------|--------------|----------|
| Desktop | Chrome, Firefox, Safari | ⭐⭐⭐⭐⭐ |
| High-End Mobile | iPhone 13+, Samsung S21+ | ⭐⭐⭐⭐⭐ |
| Mid-Range Mobile | iPhone 11, Samsung A52 | ⭐⭐⭐⭐ |
| Low-End Mobile | iPhone SE, Budget Android | ⭐⭐⭐ |

### **Performance Testing Tools**

#### **Desktop**
- Chrome DevTools Performance tab
- Lighthouse (Performance score)
- WebPageTest

#### **Mobile**
- Chrome DevTools Mobile Emulation (beperkt)
- Real device testing (aanbevolen)
- BrowserStack / Sauce Labs (cloud testing)
- Lighthouse Mobile (Chrome DevTools)

### **Metrics om te Monitoren**

1. **Frame Rate (FPS)**
   - Target: 60 FPS
   - Minimum: 30 FPS (mobile)
   - Tool: Chrome DevTools FPS meter

2. **Layout Shifts (CLS)**
   - Target: < 0.1
   - Animaties mogen geen layout shifts veroorzaken
   - Tool: Lighthouse

3. **Time to Interactive (TTI)**
   - Animaties mogen TTI niet vertragen
   - Tool: Lighthouse

4. **Battery Usage** (Mobile)
   - Test op echte devices
   - Monitor CPU/GPU usage tijdens animaties

---

## 🛡️ PROGRESSIVE ENHANCEMENT

### **Strategie: Feature Detection + Device Detection**

```javascript
// Detect device capabilities
const isLowEndDevice = 
  navigator.hardwareConcurrency <= 4 || // <= 4 CPU cores
  navigator.deviceMemory <= 4 || // <= 4GB RAM
  /Android.*Chrome/.test(navigator.userAgent); // Basic Android detection

// Disable complex animations on low-end devices
if (isLowEndDevice) {
  document.documentElement.classList.add('reduced-animations');
}
```

```css
/* Reduced animations for low-end devices */
.reduced-animations * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Or disable specific complex animations */
.reduced-animations .staggered-animation {
  animation: none !important;
}
```

### **Respect prefers-reduced-motion**

```css
/* Always respect user preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Waarom belangrijk**:
- Accessibility (mensen met motion sickness)
- Battery saving (mobile)
- Performance (low-end devices)

---

## 📋 ANIMATIE RECOMMENDATIES PER DEVICE

### **Desktop**
✅ **Alles toegestaan**:
- Complexe animaties
- Meerdere simultane animaties
- Scroll-triggered animations
- Hover effects
- Parallax (optioneel, niet aanbevolen voor UX)

### **High-End Mobile (iPhone 13+, Samsung S21+)**
✅ **Toegestaan**:
- Simpele tot medium animaties
- Staggered animations (max 5-8 items)
- Scroll-triggered animations (met Intersection Observer)
- Button/click animations
- Page load animations

⚠️ **Beperkt**:
- Meerdere simultane animaties (max 5)
- Complexe keyframes

❌ **Niet aanbevolen**:
- Parallax scrolling
- Infinite animations (battery drain)
- Te veel scroll listeners

### **Mid-Range Mobile (iPhone 11, Samsung A52)**
✅ **Toegestaan**:
- Simpele animaties (fade, slide, scale)
- Staggered animations (max 3-5 items)
- Button/click animations
- Page load animations

⚠️ **Beperkt**:
- Scroll-triggered animations (alleen met Intersection Observer, spaarzaam)
- Meerdere simultane animaties (max 3)

❌ **Niet aanbevolen**:
- Complexe animaties
- Parallax scrolling
- Infinite animations
- Te veel scroll listeners

### **Low-End Mobile (iPhone SE, Budget Android)**
✅ **Toegestaan**:
- Zeer simpele animaties (fade, basic slide)
- Button click feedback (zeer kort, < 200ms)
- Page load fade-in (optioneel)

⚠️ **Beperkt**:
- Staggered animations (max 2-3 items, korte duration)
- Scroll-triggered animations (alleen essentiële)

❌ **Niet aanbevolen**:
- Complexe animaties
- Meerdere simultane animaties
- Parallax scrolling
- Infinite animations
- Scroll-triggered animations (kan janky zijn)

---

## 🎯 CONCRETE IMPLEMENTATIE AANBEVELINGEN

### **1. Page Load Fade-in**

**Desktop**: ✅ 200ms fade-in
**High-End Mobile**: ✅ 200ms fade-in
**Mid-Range Mobile**: ✅ 150ms fade-in (korter)
**Low-End Mobile**: ⚠️ 100ms fade-in of skip

**Code**:
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.page-content {
  animation: fade-in 200ms ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .page-content {
    animation: none;
  }
}
```

### **2. Staggered Contract Cards**

**Desktop**: ✅ 50ms delay per item, max 20 items
**High-End Mobile**: ✅ 50ms delay, max 8 items
**Mid-Range Mobile**: ⚠️ 75ms delay, max 5 items
**Low-End Mobile**: ❌ Geen staggered, alle cards tegelijk of skip

**Code**:
```css
.contract-card {
  animation: fade-in-up 300ms ease-out;
  animation-fill-mode: both;
}

.contract-card:nth-child(1) { animation-delay: 0ms; }
.contract-card:nth-child(2) { animation-delay: 50ms; }
.contract-card:nth-child(3) { animation-delay: 100ms; }
/* ... max 8 items voor mobile */

/* Low-end: disable stagger */
@media (max-width: 640px) {
  .contract-card {
    animation-delay: 0ms !important;
  }
}
```

### **3. Button Loading State**

**Alle Devices**: ✅ 150ms scale-down + spinner fade-in

**Code**:
```css
.button-loading {
  transform: scale(0.98);
  transition: transform 150ms ease-out;
}

.button-spinner {
  animation: spin 1s linear infinite;
}
```

### **4. Scroll-triggered Animations**

**Desktop**: ✅ Intersection Observer, alle sections
**High-End Mobile**: ✅ Intersection Observer, belangrijke sections
**Mid-Range Mobile**: ⚠️ Intersection Observer, alleen hero/key sections
**Low-End Mobile**: ❌ Geen scroll-triggered animations

**Code**:
```javascript
// Feature detection
const supportsIntersectionObserver = 'IntersectionObserver' in window;
const isLowEndDevice = navigator.hardwareConcurrency <= 4;

if (supportsIntersectionObserver && !isLowEndDevice) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el);
  });
}
```

### **5. SiteMenuDrawer Slide-in**

**Desktop**: ✅ 300ms ease-out slide-in
**High-End Mobile**: ✅ 300ms ease-out slide-in
**Mid-Range Mobile**: ✅ 250ms ease-out (iets sneller)
**Low-End Mobile**: ✅ 200ms ease-out (sneller, maar nog steeds smooth)

**Code**:
```css
.drawer {
  transform: translateX(100%);
  transition: transform 300ms ease-out;
}

.drawer.open {
  transform: translateX(0);
}

/* Faster on mobile */
@media (max-width: 640px) {
  .drawer {
    transition-duration: 250ms;
  }
}
```

---

## 🚨 RED FLAGS - WAT TE VERMIJDEN

### **❌ Altijd Vermijden (Alle Devices)**
1. Animaties op `width`/`height` (layout thrashing)
2. Animaties op `top`/`left` (layout thrashing)
3. Te veel `will-change` declarations
4. JavaScript animation libraries (Framer Motion, GSAP) - te zwaar
5. Auto-playing video backgrounds
6. Parallax scrolling (battery drain, jank)

### **❌ Mobile-Specifiek Vermijden**
1. Hover effects (werken niet op mobile)
2. Complexe scroll calculations tijdens scroll
3. Te veel simultane animaties (> 5)
4. Infinite animations (battery drain)
5. Scroll-triggered animations op low-end devices

### **⚠️ Voorzichtig Gebruiken**
1. Intersection Observer (goed, maar spaarzaam op mobile)
2. `will-change` (alleen voor complexe, langlopende animaties)
3. Staggered animations (beperk aantal items op mobile)
4. Scroll-triggered animations (alleen belangrijke sections)

---

## 📊 PERFORMANCE BUDGET

### **Animation Performance Budget**

| Device Type | Max Simultaneous Animations | Max Animation Duration | Max Staggered Items |
|------------|----------------------------|----------------------|---------------------|
| Desktop | Unlimited | 1000ms | 20+ |
| High-End Mobile | 5-8 | 400ms | 8 |
| Mid-Range Mobile | 3-5 | 300ms | 5 |
| Low-End Mobile | 1-2 | 200ms | 2-3 |

### **Frame Budget**

- **Desktop**: 16.67ms per frame (60 FPS)
- **High-End Mobile**: 16.67ms per frame (60 FPS target)
- **Mid-Range Mobile**: 22.22ms per frame (45 FPS target)
- **Low-End Mobile**: 33.33ms per frame (30 FPS target)

**Regel**: Als een animatie > frame budget duurt, wordt het janky.

---

## ✅ CHECKLIST VOOR IMPLEMENTATIE

### **Voor Elke Animatie**
- [ ] Gebruikt `transform` en `opacity` (hardware-accelerated)
- [ ] Geen `width`/`height`/`top`/`left` animaties
- [ ] Duration < 500ms (mobile) of < 1000ms (desktop)
- [ ] Respecteert `prefers-reduced-motion`
- [ ] Getest op low-end mobile device
- [ ] Geen layout shifts (CLS)
- [ ] Geen JavaScript libraries (CSS-only)

### **Voor Mobile-Specifieke Animaties**
- [ ] Feature detection (device capabilities)
- [ ] Progressive enhancement (disable op low-end)
- [ ] Touch-friendly (active states, geen hover)
- [ ] Battery-conscious (geen infinite animations)
- [ ] Scroll performance getest (geen jank)

### **Voor Scroll-triggered Animaties**
- [ ] Intersection Observer gebruikt (niet scroll listeners)
- [ ] Passive event listeners
- [ ] Debounced/throttled calculations
- [ ] Geen layout changes tijdens scroll
- [ ] Getest op mid-range mobile

---

## 🎓 CONCLUSIE

**Kernboodschap**: 
- ✅ **Desktop**: Bijna alles kan, maar houd het subtiel
- ✅ **High-End Mobile**: Veel kan, maar wees voorzichtig
- ⚠️ **Mid-Range Mobile**: Beperkt, simpele animaties
- ❌ **Low-End Mobile**: Zeer beperkt, alleen essentiële animaties

**Gouden Regel**: 
> "Als een animatie niet essentieel is voor de UX, skip het op mobile. Performance > Pretty animations."

**Implementatie Strategie**:
1. Start met desktop animaties
2. Test op high-end mobile
3. Disable/vereenvoudig voor mid-range mobile
4. Minimaliseer voor low-end mobile
5. Respecteer `prefers-reduced-motion`

---

**Laatste Update**: 27 december 2025
**Status**: Klaar voor implementatie met performance garanties

