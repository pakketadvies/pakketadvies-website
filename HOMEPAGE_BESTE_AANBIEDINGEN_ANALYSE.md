# 📊 Gaslicht.com Analyse + PakketAdvies Voorstel

## 🔍 Gedetailleerde Analyse Gaslicht.com

### Wat Gaslicht.com Heeft (Linker Kolom):

1. **Titel & Subtitel:**
   - "Gas & licht vergelijken"
   - "Vergelijk de goedkoopste vaste contracten"

2. **Promotie Box:**
   - "Stap in december nog over 92% kiest nu voor 1 jaar vast"
   - Met euro symbool icon

3. **Rating Badge:**
   - ekomi badge: 9.6/10 rating
   - Visueel prominent

4. **Filter Buttons:**
   - "Stroom & gas" (selected)
   - "Alleen stroom"

5. **Sectie: "Beste aanbiedingen voor nieuwe klanten"**

6. **Contract Cards (5 stuks):**
   Elke card bevat:
   - **Leverancier logo** (links)
   - **Rating** (bijv. 7.2, 8.7, 8.1)
   - **Contract type label:** "Vast tarief"
   - **Looptijd:** "1 jaar" of "t/m 31-12-2026"
   - **Optional label:** "Groene stroom NL" (green badge)
   - **Korting:** "€ 442 Korting", "€ 360 Korting"
   - **Maandprijs:** "€ 130,38 Per maand"
   - **Arrow icon** (rechts) voor klik actie

7. **Footer Links:**
   - "Hoe is deze lijst berekend?"
   - "Meer pakketten met vaste tarieven"
   - Disclaimer: "De getoonde tarieven zijn incl. overheidsheffingen 2026."

---

## ✅ PakketAdvies Verbeterde Implementatie - VOORSTEL

### Waarom BETER dan Gaslicht.com:

1. ✅ **Meer visueel aantrekkelijk** - Moderne cards met hover effects
2. ✅ **Duidelijke call-to-action** - Direct "Bereken je besparing" knop
3. ✅ **Betere informatie** - Toont ook besparing t.o.v. gemiddelde
4. ✅ **Trust indicators** - Rating + aantal reviews
5. ✅ **Groe labels** - Voor groene energie contracts
6. ✅ **"Aanbevolen" badges** - Voor beste deals
7. ✅ **Directe actie** - Klik leidt naar calculator met pre-filled data

---

## 🎨 DESIGN CONCEPT

### Linker Sectie (Desktop):

```
┌─────────────────────────────────────────┐
│  ⚡ Energie vergelijken                 │
│  Vergelijk de beste energiecontracten  │
│                                         │
│  [Promotie Box]                         │
│  "Overstappen in december?              │
│   92% kiest voor 1 jaar vast"          │
│                                         │
│  ⭐ 4.9/5 (7.500+ reviews)             │
│                                         │
│  [Filter: Alle | Vast | Dynamisch]     │
│                                         │
│  ───────────────────────────────────    │
│  Beste aanbiedingen                     │
│  ───────────────────────────────────    │
│                                         │
│  ┌───────────────────────────────┐     │
│  │ [Logo] Frank Energie   ⭐ 4.7 │     │
│  │                             → │     │
│  │ Dynamisch • Maandelijks      │     │
│  │ 🟢 Groen                     │     │
│  │                             │     │
│  │ €124 besparing/maand        │     │
│  │ €140 /maand                 │     │
│  │                             │     │
│  │ [Bereken besparing]         │     │
│  └───────────────────────────────┘     │
│                                         │
│  [Herhaal voor 3-4 beste contracts]    │
│                                         │
│  "Hoe worden deze aanbiedingen...?"    │
│  "Meer contracten bekijken →"          │
└─────────────────────────────────────────┘
```

---

## 📋 Functionele Specificaties

### Data Requirements:

1. **Top 3-5 contracten** op basis van:
   - Beste prijs (laagste maandbedrag)
   - Hoogste rating
   - Aanbevolen contracts
   - Mix van vast en dynamisch

2. **Per contract tonen:**
   - Leverancier naam + logo
   - Rating (bijv. 4.7) + aantal reviews (bijv. 481)
   - Contract type (Vast/Dynamisch)
   - Looptijd (voor vast: "1 jaar", "2 jaar", etc.)
   - Groen badge (als groene_energie = true)
   - Besparing t.o.v. gemiddelde (bijv. "€124 besparing/maand")
   - Maandbedrag (bijv. "€140 /maand")
   - Aanbevolen badge (als aanbevolen = true)

3. **Gemiddelde prijs berekening:**
   - Gebaseerd op Eneco modeltarieven
   - Of gemiddelde van alle contracts
   - Voor besparingsberekening

4. **Filters:**
   - "Alle" (toon mix)
   - "Vast" (alleen vaste contracts)
   - "Dynamisch" (alleen dynamische contracts)

### UX Flow:

1. **Bij hover op card:**
   - Slight scale + shadow
   - Highlight effect

2. **Bij klik op "Bereken je besparing":**
   - Scroll naar calculator
   - Pre-fill calculator met gemiddeld verbruik
   - Of leid naar `/calculator` met filter parameter

3. **Bij klik op "Meer contracten":**
   - Navigate naar `/calculator/resultaten`
   - Of open calculator modal

---

## 🎯 Implementatie Details

### Component: `HomepageBestDeals.tsx`

**Features:**
- Fetch top 3-5 contracts via API
- Calculate average price for savings comparison
- Display contract cards with all info
- Filter buttons (Alle/Vast/Dynamisch)
- Responsive design
- Loading states
- Error handling

**Props:**
- `contracts`: Array van top contracts
- `averagePrice`: Gemiddelde prijs voor besparingsberekening

**Styling:**
- Match huisstijl (brand-navy, brand-teal)
- Modern card design
- Hover effects
- Mobile responsive

---

## 💡 Verbeteringen t.o.v. Gaslicht.com:

1. ✅ **Betere visuele hiërarchie** - Duidelijke cards met shadows
2. ✅ **Meer informatie** - Besparing + rating + reviews
3. ✅ **Duidelijke CTA** - "Bereken je besparing" button
4. ✅ **Trust badges** - Aanbevolen, Groen labels
5. ✅ **Betere UX** - Hover effects, smooth transitions
6. ✅ **Mobile optimized** - Responsive grid layout
7. ✅ **Link naar calculator** - Directe actie mogelijkheid

---

## 📊 Data Flow:

```
Homepage → API: /api/contracten/best-deals
         ↓
    Fetch top 5 contracts
    (sorteer op: aanbevolen, rating, prijs)
         ↓
    Calculate average price
    (Eneco modeltarieven of gemiddelde)
         ↓
    Calculate savings per contract
         ↓
    Render cards with data
```

---

## 🎨 Visual Design:

- **Background:** Navy (bg-brand-navy-500) zoals huidige Hero
- **Cards:** White cards met subtle shadow
- **Accents:** Brand-teal voor CTA buttons
- **Green badges:** Voor groene energie
- **Rating stars:** Yellow/gold voor sterren
- **Typography:** Font-display voor headings

---

---

## 📱 MOBIELE VERSIE - Analyse Gaslicht.com

### Wat Gaslicht.com doet op Mobiel:

1. **Compacte Layout:**
   - Verticale stack van contract cards
   - Eén contract per card, full width
   - Minder visuele ruimte tussen elementen

2. **Contract Cards op Mobiel:**
   - Compactere header met logo + rating
   - Labels (Vast tarief, Groen) in één rij
   - Prijs info prominent (korting + maandprijs)
   - Arrow icon rechts voor actie

3. **Visuele Elementen:**
   - Nummering links (1, 2, 3)
   - Logo kleiner
   - Rating button groen met nummer
   - Compacte badges

4. **Scroll Gedrag:**
   - Vertical scroll voor alle cards
   - Cards nemen full width
   - Minder padding tussen cards

---

## 📱 PAKKETADVIES MOBIELE VERSIE - VOORSTEL

### Optie A: Verticale Stack (Zoals Gaslicht.com)

**Voordelen:**
- ✅ Eenvoudig te scannen
- ✅ Veel ruimte per contract
- ✅ Duidelijke hiërarchie

**Layout:**
```
┌─────────────────────────┐
│ ⚡ Energie vergelijken  │
│                         │
│ [Promo Box]             │
│ ⭐ 4.9/5                │
│                         │
│ [Filter: Alle|Vast|...] │
│ ───────────────────     │
│ Beste aanbiedingen      │
│ ───────────────────     │
│                         │
│ ┌───────────────────┐   │
│ │ 1 [Logo] Rating   │   │
│ │   Contract Type   │   │
│ │   🟢 Groen        │   │
│ │                   │   │
│ │ €124 besparing    │   │
│ │ €140 /maand       │   │
│ │                   │   │
│ │ [Bereken →]       │   │
│ └───────────────────┘   │
│                         │
│ [Meer cards...]         │
└─────────────────────────┘
```

---

### Optie B: Horizontale Scroll (Zoals PrijzenInfoCards) ⭐ AANBEVOLEN

**Voordelen:**
- ✅ Snelle swipe actie
- ✅ Meerdere contracts in beeld
- ✅ Moderne UX
- ✅ Consistente met andere mobiele secties

**Layout:**
```
┌─────────────────────────┐
│ ⚡ Energie vergelijken  │
│                         │
│ [Promo] ⭐ 4.9/5        │
│ [Filter: Alle|Vast|...] │
│ ───────────────────     │
│ Beste aanbiedingen      │
│                         │
│ ┌───────┬───────┬──────┐│
│ │  [1]  │  [2]  │  [3] ││ ← Swipe
│ │ Card  │ Card  │ Card ││
│ │ 280px │ 280px │ 280px││
│ └───────┴───────┴──────┘│
│                         │
│ "Meer contracten →"     │
└─────────────────────────┘
```

**Card Design (280px breed):**
```
┌───────────────────┐
│ 1                 │
│ [Logo] ⭐ 4.7    │
│                   │
│ Dynamisch         │
│ 🟢 Groen          │
│                   │
│ €124 besparing    │
│ €140 /maand       │
│                   │
│ [Bereken →]       │
└───────────────────┘
```

---

### ⭐ AANBEVOLEN: Optie B (Horizontale Scroll)

**Waarom?**
1. ✅ **Consistent** met PrijzenInfoCards component
2. ✅ **Modern UX** - swipe is natuurlijker dan scroll
3. ✅ **Meer contracts zichtbaar** - gebruikers zien meer opties
4. ✅ **Compact** - neemt minder verticale ruimte
5. ✅ **Snappier** - snellere interactie

**Implementatie:**
- Gebruik `scrollbar-hide` class (zoals PrijzenInfoCards)
- `snap-x snap-mandatory` voor smooth snapping
- Min-width: 280px per card
- Gap: 12px tussen cards
- Padding: 16px aan zijkanten

---

## 📱 MOBIELE CARD SPECIFICATIES

### Compacte Card Design (280px breed):

```
┌──────────────────────────┐
│ 1                        │ ← Position badge (top-left)
│                          │
│ ┌────┐                   │
│ │Logo│ Frank Energie ⭐4.7│
│ └────┘                   │
│                          │
│ [Vast tarief] [1 jaar]   │ ← Badges
│ [🟢 Groen]               │
│                          │
│ 💰 €124 besparing/maand  │
│ €140 /maand              │ ← Price prominent
│                          │
│ ┌──────────────────────┐ │
│ │  Bereken besparing → │ │ ← CTA button
│ └──────────────────────┘ │
└──────────────────────────┘
```

### Element Sizes (Mobiel):
- **Logo:** 40x40px
- **Rating:** 14px font
- **Badges:** Small (10px font, compact padding)
- **Price:** 20px font (bold)
- **CTA Button:** Full width, 44px hoogte (touch target)

---

## 🎯 MOBIELE UX FLOW

1. **Bij load:**
   - Toon 3 cards zichtbaar
   - Laatste card gedeeltelijk zichtbaar (indicator voor meer)

2. **Bij swipe:**
   - Smooth snap naar volgende card
   - Scroll indicator (dots of gradient fade)

3. **Bij klik op "Bereken":**
   - Scroll naar calculator (als die onder staat)
   - Of navigate naar `/calculator` met pre-filled data

4. **Bij klik op "Meer contracten":**
   - Navigate naar `/calculator/resultaten`

---

## 📐 RESPONSIVE BREAKPOINTS

### Mobile (< 768px):
- Horizontal scroll
- 280px card width
- Snap scrolling
- Compact spacing

### Tablet (768px - 1024px):
- 2 columns grid
- Cards 50% width minus gap
- Geen scroll, gewone grid

### Desktop (> 1024px):
- 1 kolom (linker sectie)
- Full width cards
- Hover effects

---

## 🎨 MOBIELE STYLING SPECIFIEK

```css
/* Mobile Card Container */
.mobile-cards-scroll {
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 0 16px 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
}

.mobile-cards-scroll::-webkit-scrollbar {
  display: none;
}

/* Mobile Card */
.mobile-card {
  min-width: 280px;
  scroll-snap-align: start;
  flex-shrink: 0;
}
```

---

## ✅ SAMENVATTING MOBIELE VERSIE

**Aanbevolen Approach:**
- ✅ Horizontale scroll (zoals PrijzenInfoCards)
- ✅ 280px card width
- ✅ Snap scrolling
- ✅ Compacte cards met alle essentiële info
- ✅ Full width CTA button
- ✅ Position badge (1, 2, 3) top-left

**Wat wordt getoond per card:**
1. Position nummer (1, 2, 3)
2. Logo + Leverancier naam + Rating
3. Contract type badges (compact)
4. Groen badge (als van toepassing)
5. Besparing prominent
6. Maandprijs
7. CTA button full width

**Extra Features:**
- Gradient fade rechts (indicator voor meer)
- Scroll dots indicator (optioneel)
- "Meer contracten bekijken" link onderaan

---

**Is dit het concept wat je voor ogen hebt? Zal ik dit implementeren?** 🚀

