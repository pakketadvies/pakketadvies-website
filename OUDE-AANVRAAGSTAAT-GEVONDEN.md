# 🔍 OUDE AANVRAAGSTAAT GEVONDEN

## Locatie
**`src/app/contract/afsluiten/page.tsx`**

## Wat is dit?
Dit is een **oude, deprecated versie** van het contract aanvraagformulier die nog in de codebase staat.

## Kenmerken van de oude versie:

### 1. **"Bedrijfsgegevens" sectie** (niet "Bedrijf opzoeken")
- Regel 341: `<h2>Bedrijfsgegevens</h2>`
- Heeft alleen KvK lookup, geen moderne bedrijfsnaam search

### 2. **"Contactpersoon" veld** (niet gesplitst in voornaam/achternaam)
- Regel 76: `contactpersoon: ''` in formData
- Regel 555-561: Input veld voor "Contactpersoon" (één veld)
- **NIEUWE VERSIE** heeft: `voornaam`, `voorletters`, `tussenvoegsel`, `achternaam`, `aanhef`

### 3. **"Type bedrijf" selector**
- Regel 79: `typeBedrijf: 'kantoor'`
- Regel 504-537: Grid met type bedrijf buttons (Kantoor, Retail, Horeca, etc.)
- **NIEUWE VERSIE** heeft dit niet meer als verplicht veld

### 4. **Simpele formulier structuur**
- Geen moderne velden zoals:
  - `aanhef` (Dhr./Mevr.)
  - `geboortedatum`
  - `herhaalEmail`
  - `iban`
  - `heeftVerblijfsfunctie`
  - `gaatVerhuizen`
  - `wanneerOverstappen`
  - etc.

### 5. **Mock contract data**
- Regel 13-37: `generateMockContract()` functie
- Gebruikt hardcoded mock data, niet echte contracten

## Waarom werd dit getoond?

**MOGELIJKE OORZAKEN:**
1. **Oude link/cache**: Er was mogelijk een oude link naar `/contract/afsluiten` die nog ergens in de code of cache zat
2. **Next.js routing**: Next.js serveerde mogelijk deze oude route per ongeluk
3. **Browser cache**: Oude versie gecached in browser
4. **Service Worker**: PWA service worker serveerde oude versie

## Is deze route nog in gebruik?

**NEE** - Geen links gevonden naar deze route:
- Geen `href="/contract/afsluiten"` in codebase
- Geen `router.push('/contract/afsluiten')` in codebase
- Geen `Link` componenten die hiernaartoe wijzen

## Huidige actieve route:

**`/calculator?stap=2&contract={id}`** 
- Gebruikt `BedrijfsgegevensForm.tsx` component
- Moderne versie met alle nieuwe velden
- Dynamisch contract loading
- Particulier/Zakelijk formulier switching

## Aanbeveling:

**OPTIE 1: Verwijder de oude route**
```bash
rm -rf src/app/contract/afsluiten
```

**OPTIE 2: Redirect naar nieuwe route**
```typescript
// src/app/contract/afsluiten/page.tsx
import { redirect } from 'next/navigation'

export default function ContractAfsluitenPage() {
  redirect('/calculator?stap=2')
}
```

**OPTIE 3: Deprecate met warning**
- Toon een warning dat dit een oude versie is
- Redirect naar nieuwe versie

## Conclusie:

De oude aanvraagstaat is **`src/app/contract/afsluiten/page.tsx`**. Deze wordt niet meer gebruikt, maar staat nog in de codebase. Dit verklaart waarom de gebruiker soms de oude versie zag (mogelijk via cache of oude link).

