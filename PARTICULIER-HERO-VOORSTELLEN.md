# 📱 Particuliere Homepage Hero - 3 Voorstellen

## 🎯 Problemen Huidige Design
- ❌ Te veel ruimte tussen menubar en tekst (`pt-32` = 128px!)
- ❌ Headline te groot (`text-4xl` op mobile)
- ❌ Tekst is te lang en niet uitnodigend
- ❌ Formulier voelt los van de headline
- ❌ Geen duidelijke call-to-action focus

---

## ✨ VOORSTEL 1: Compact & Direct (Aanbevolen)

### Concept
**"Direct to the point"** - Minimale tekst, formulier direct zichtbaar, focus op actie.

### Mobile Layout
```
┌─────────────────────────┐
│ [Menu Bar]              │
├─────────────────────────┤
│                         │
│  Bespaar op je          │  ← Compacte headline (text-2xl)
│  energierekening        │
│                         │
│  ┌───────────────────┐  │
│  │ Check je voordeel │  │  ← Formulier direct zichtbaar
│  │ [Form fields]     │  │
│  │ [Start vergelijken]│  │
│  └───────────────────┘  │
│                         │
│  ✓ 2.500+ reviews       │  ← Compacte trust indicators
│  ✓ 100% transparant     │
└─────────────────────────┘
```

### Implementatie Details
- **Padding top**: `pt-20` (80px) in plaats van `pt-32` (128px)
- **Headline**: `text-2xl md:text-4xl` (kleiner op mobile)
- **Tekst**: "Bespaar op je energierekening" (kort, direct, benefit-focused)
- **Subtekst**: Verwijderd op mobile (alleen op desktop)
- **Formulier**: Direct onder headline, geen extra spacing
- **Trust indicators**: Compact onder formulier (2 regels)

### Voordelen
✅ Minimale scroll nodig  
✅ Formulier direct zichtbaar  
✅ Duidelijke focus op actie  
✅ Minder tekst = minder afleiding  
✅ Sneller tot conversie  

---

## ✨ VOORSTEL 2: Benefit-Focused

### Concept
**"Show the value first"** - Grote benefit claim, formulier als middel om dat te bereiken.

### Mobile Layout
```
┌─────────────────────────┐
│ [Menu Bar]              │
├─────────────────────────┤
│                         │
│  Bespaar tot            │  ← Grote benefit claim
│  €500 per jaar          │     (text-3xl, teal accent)
│                         │
│  Vergelijk gratis en    │  ← Korte subtekst
│  vind je beste deal     │
│                         │
│  ┌───────────────────┐  │
│  │ Check je voordeel │  │
│  │ [Form fields]     │  │
│  │ [Start vergelijken]│  │
│  └───────────────────┘  │
│                         │
│  ⚡ In 2 minuten klaar  │  ← Extra motivatie
└─────────────────────────┘
```

### Implementatie Details
- **Padding top**: `pt-20` (80px)
- **Headline**: "Bespaar tot €500 per jaar" (benefit claim)
- **Teal accent**: "€500" in teal kleur voor aandacht
- **Subtekst**: "Vergelijk gratis en vind je beste deal" (kort, duidelijk)
- **Formulier**: Direct onder subtekst
- **Extra motivatie**: "⚡ In 2 minuten klaar" onder formulier

### Voordelen
✅ Duidelijke value proposition  
✅ Concrete besparing (€500) triggert interesse  
✅ "Gratis" benadrukt (geen kosten)  
✅ Tijdsindicatie (2 minuten) verlaagt drempel  
✅ Visueel aantrekkelijk met teal accent  

---

## ✨ VOORSTEL 3: Question-Based (Conversie-Optimal)

### Concept
**"Curiosity gap"** - Vraag die nieuwsgierigheid wekt, formulier als antwoord.

### Mobile Layout
```
┌─────────────────────────┐
│ [Menu Bar]              │
├─────────────────────────┤
│                         │
│  Hoeveel kun jij        │  ← Nieuwsgierigheid wekkende vraag
│  besparen?              │     (text-2xl, teal "jij")
│                         │
│  Ontdek het in          │  ← Direct antwoord
│  2 minuten              │
│                         │
│  ┌───────────────────┐  │
│  │ Check je voordeel │  │
│  │ [Form fields]     │  │
│  │ [Start vergelijken]│  │
│  └───────────────────┘  │
│                         │
│  ✓ Gratis vergelijken   │  ← Trust + motivatie
│  ✓ Geen verplichtingen  │
└─────────────────────────┘
```

### Implementatie Details
- **Padding top**: `pt-20` (80px)
- **Headline**: "Hoeveel kun jij besparen?" (vraag triggert actie)
- **Teal accent**: "jij" in teal voor personalisatie
- **Subtekst**: "Ontdek het in 2 minuten" (direct antwoord + tijdsindicatie)
- **Formulier**: Direct onder subtekst
- **Trust indicators**: "Gratis" + "Geen verplichtingen" (verlaagt drempel)

### Voordelen
✅ Vraag triggert nieuwsgierigheid  
✅ Personalisatie ("jij") verhoogt betrokkenheid  
✅ Tijdsindicatie verlaagt drempel  
✅ "Gratis" + "Geen verplichtingen" = lage commitment  
✅ Psychologisch sterk (curiosity gap)  

---

## 📊 Vergelijking

| Aspect | Voorstel 1 | Voorstel 2 | Voorstel 3 |
|--------|------------|------------|------------|
| **Padding top** | pt-20 (80px) | pt-20 (80px) | pt-20 (80px) |
| **Headline size** | text-2xl | text-3xl | text-2xl |
| **Focus** | Direct actie | Benefit claim | Nieuwsgierigheid |
| **Complexiteit** | Laag | Middel | Laag |
| **Conversie potentie** | Hoog | Zeer hoog | Zeer hoog |
| **Visuele impact** | Medium | Hoog | Hoog |

---

## 🎨 Design Details (Algemeen)

### Kleuren
- **Navy background**: Behouden (vertrouwen, professionaliteit)
- **Teal accents**: Voor belangrijke woorden/cijfers
- **White formulier**: Hoog contrast, duidelijk zichtbaar

### Typography
- **Headline**: Display font, bold
- **Subtekst**: Body font, medium weight
- **Formulier titel**: Semibold

### Spacing
- **Padding top**: `pt-20` (80px) - veel minder dan huidige `pt-32` (128px)
- **Gap tussen headline en formulier**: `mt-6` (24px)
- **Trust indicators**: `mt-4` (16px) onder formulier

### Animations
- Subtle fade-in voor formulier (gebruik nieuwe animaties)
- Hover effect op CTA button

---

## 💡 Aanbeveling

**Voorstel 2 (Benefit-Focused)** heeft de hoogste conversie potentie omdat:
1. ✅ Concrete besparing (€500) triggert interesse
2. ✅ "Gratis" verlaagt drempel
3. ✅ Tijdsindicatie (2 minuten) maakt het laagdrempelig
4. ✅ Visueel aantrekkelijk met teal accent
5. ✅ Duidelijke value proposition

**Alternatief: Voorstel 3** als je meer focus wilt op nieuwsgierigheid en personalisatie.

**Voorstel 1** is het meest conservatief en veilig, maar minder opvallend.

---

## 🚀 Implementatie

Welk voorstel wil je? Ik implementeer het direct met:
- Correcte spacing
- Responsive design (mobile-first)
- Nieuwe animaties
- Optimale conversie focus

