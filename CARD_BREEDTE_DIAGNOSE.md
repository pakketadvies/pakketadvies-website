# 🔍 CARD BREEDTE PROBLEEM - GRONDIGE DIAGNOSE

## Probleem Beschrijving
**Mobiel**: Contract cards lopen uit het beeld (te breed)
**Desktop**: Contract cards lopen te ver naar rechts, niet aligned met blauwe banner en menu

## Huidige Structuur Analyse

### 1. Container Hierarchy
```
<div className="container-custom max-w-7xl">    ← padding: 16px mobiel, 32px desktop
  <div className={audience === 'consumer' ? 'pt-24 md:pt-28' : ''}>
    
    <!-- BLAUWE BANNER -->
    <div className="mb-5 rounded-2xl bg-brand-navy-500 px-5 py-4">
      ↑ Heeft px-5 (20px) extra padding
      ↑ Effectieve breedte: calc(100vw - 32px - 40px) mobiel
    </div>
    
    <!-- GRID MET SIDEBAR + RESULTS -->
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      
      <!-- SIDEBAR (340px desktop) -->
      <aside className="space-y-4">
        <div className="bg-gradient-to-br ... rounded-2xl p-4">
          ↑ "Help mij kiezen" card
          ↑ Heeft p-4 padding
        </div>
      </aside>
      
      <!-- RESULTS LIST -->
      <section className="space-y-4">
        ↑ GEEN padding!
        ↑ Cards hebben eigen padding via Card component
        
        <ConsumerContractRowCard />
          ↑ Card className="... border ..."
          ↑ CardContent className="p-4 md:p-4"
      </section>
      
    </div>
  </div>
</div>
```

### 2. CSS Classes Analyse

#### `container-custom` (globals.css)
```css
.container-custom {
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;      /* 16px mobiel */
  padding-right: 1rem;     /* 16px mobiel */
}

@media (min-width: 640px) {
  .container-custom {
    padding-left: 1.5rem;   /* 24px tablet */
    padding-right: 1.5rem;  /* 24px tablet */
  }
}

@media (min-width: 1024px) {
  .container-custom {
    padding-left: 2rem;     /* 32px desktop */
    padding-right: 2rem;    /* 32px desktop */
  }
}
```

## ROOT CAUSE

### Mobiel
1. **container-custom**: 16px padding left + 16px right = **32px totaal**
2. **Blauwe banner**: px-5 (20px) padding left + right = **40px extra**
   - Banner breedte: `calc(100vw - 32px - 40px)`
3. **Results list** (`<section>`): **GEEN padding**
   - Cards breedte: `calc(100vw - 32px)` 
   
**PROBLEEM**: Cards zijn **40px breder** dan banner!

### Desktop
1. **Grid**: `lg:grid-cols-[340px_1fr]`
   - Sidebar: vaste 340px
   - Main: `1fr` = alle resterende ruimte
   - Gap: 24px (gap-6)
2. **Main column heeft GEEN max-width constraint**
   - Main column breedte: `calc(container - 32px - 340px - 24px)`
   - Maar cards kunnen nog breder worden dan verwacht
3. **Blauwe banner heeft px-5 padding**
   - Banner is smaller dan container door px-5
   
**PROBLEEM**: Main column en cards zijn niet consistent in breedte met banner!

## OPLOSSING

### Optie A: Consistente Padding (RECOMMENDED)
Zorg dat ALLE content DEZELFDE padding heeft als de blauwe banner.

```tsx
// ResultatenFlow.tsx
<div className="grid gap-6 lg:grid-cols-[340px_1fr]">
  <aside className="px-5 space-y-4">  {/* ← VOEG px-5 TOE */}
    {/* Help mij kiezen card */}
  </aside>
  
  <section className="px-5 space-y-4">  {/* ← VOEG px-5 TOE */}
    {/* Contract cards */}
  </section>
</div>
```

**Result**:
- Banner: `px-5` ✓
- Sidebar: `px-5` ✓  
- Cards: `px-5` ✓
- Alles aligned!

### Optie B: Verwijder Banner Padding
Verwijder de px-5 van de blauwe banner en laat alles direct in container zitten.

```tsx
// Was:
<div className="mb-5 rounded-2xl bg-brand-navy-500 px-5 py-4">

// Wordt:
<div className="mb-5 rounded-2xl bg-brand-navy-500 py-4">
```

**Result**:
- Banner: geen px-5, zelfde breedte als container ✓
- Sidebar & Cards: geen px-5, zelfde breedte als container ✓
- Alles aligned!

**NADEEL**: Banner content loopt tot de rand (minder witruimte).

### Optie C: Wrapper met Consistente Padding
Wrap ALLE content (banner + grid) in een div met consistente padding.

```tsx
<div className="px-5">  {/* ← NIEUWE WRAPPER */}
  <div className="mb-5 rounded-2xl bg-brand-navy-500 py-4">
    {/* Banner zonder px-5 */}
  </div>
  
  <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
    {/* Grid zonder px-5 */}
  </div>
</div>
```

**Result**:
- Alle content heeft 20px padding vanaf container edge
- Alles aligned!
- Clean en simpel

## MIJN AANBEVELING

**Optie A** is de beste keuze:
1. ✅ Minimale wijzigingen
2. ✅ Consistent met bestaande design (banner heeft al px-5)
3. ✅ Duidelijk en overzichtelijk
4. ✅ Werkt op mobiel EN desktop

## IMPLEMENTATIE STAPPEN

1. Open `src/components/calculator/ResultatenFlow.tsx`
2. Zoek de grid sectie (regel ~836)
3. Voeg `px-5` toe aan `<aside>` en `<section>`
4. Test op mobiel en desktop
5. Verify alignment met banner

## WAAROM DIT 100% WERKT

- Alle elementen krijgen EXACT dezelfde padding (20px)
- container-custom zorgt voor outer padding (16px mobiel, 32px desktop)
- px-5 zorgt voor inner padding (20px consistent)
- Totale effectieve breedte is voor ALLES gelijk
- Geen complexe calc() of CSS hacks nodig
- Responsive-proof: werkt op alle schermbreedtes

