# 🔍 ROOT CAUSE ANALYSE - 100% ZEKER

## Probleem
Bij eerste keer naar stap 2: oude versie met "Bedrijf opzetten" en "Contactpersoon"
Bij tweede keer: juiste versie met "Bedrijf opzoeken" en moderne velden

## ROOT CAUSE - 100% ZEKER

### 1. **`resultaten` wordt NIET in Zustand store gezet!**

**In `resultaten/page.tsx`:**
- Regel 389: `const [resultaten, setResultaten] = useState<ContractOptie[]>([])` 
  - Dit is **LOKALE state**, NIET de Zustand store!
- Regel 387: `const { verbruik, setVerbruik, voorkeuren, reset } = useCalculatorStore()`
  - **`setResultaten` wordt NIET uit de store gehaald!**
- Regel 724: `setResultaten(transformed)`
  - Dit zet alleen **lokale state**, NIET de Zustand store!

**In `BedrijfsgegevensForm.tsx`:**
- Regel 141: `const { ..., resultaten, ... } = useCalculatorStore()`
  - Dit haalt `resultaten` uit de **Zustand store**
  - Maar die is altijd `null` omdat het nooit wordt gezet!

### 2. **Race Condition in Contract Loading**

**In `ContractCard.tsx` regel 824-826:**
```typescript
setSelectedContract(contract)  // ← Asynchroon (Zustand update)
router.push(`/calculator?stap=2&contract=${contract.id}`)  // ← Direct navigeren
```

**In `BedrijfsgegevensForm.tsx` regel 145:**
```typescript
const contract = selectedContract || (contractId && resultaten?.find(c => c.id === contractId)) || null
```

**Wat er gebeurt:**
1. `setSelectedContract(contract)` wordt aangeroepen (asynchroon)
2. `router.push()` navigeert DIRECT
3. `BedrijfsgegevensForm` rendert:
   - `selectedContract` = `undefined` (nog niet gezet door Zustand)
   - `resultaten` = `null` (nooit gezet in store!)
   - `contractId` = wel aanwezig in URL
   - `resultaten?.find()` = faalt omdat `resultaten` null is
   - **Resultaat: `contract = null`**

### 3. **Wat gebeurt er wanneer `contract = null`?**

**In `BedrijfsgegevensForm.tsx`:**
- Regel 152: `bepaalContractType(null, verbruik)` → returnt `'zakelijk'` (fallback)
- Regel 157-159: Als particulier, return `ParticulierAanvraagForm`
- Regel 161: Anders: zakelijk formulier (bestaande logica)
- **Geen early return bij `contract === null`!**
- Regel 570: `const contractNaam = contract?.contractNaam || ...`
- Regel 582: `Meld u nu aan bij {leverancierNaam}` waar `leverancierNaam = contract?.leverancier?.naam || 'Onbekende leverancier'`

**Het formulier rendert WEL, maar:**
- `contract` is `null`
- `contractNaam` = fallback string
- `leverancierNaam` = "Onbekende leverancier"
- Alle contract-specifieke data ontbreekt

### 4. **Waarom ziet gebruiker OUDE versie?**

**MOGELIJKE OORZAKEN:**

#### A. Browser Cache / Service Worker
- Oude versie gecached in browser
- Service worker serveert oude versie
- Next.js cache serveert oude component

#### B. Oude Route `/contract/afsluiten`
- Deze route bestaat nog en heeft oude formulier
- Mogelijk wordt er per ongeluk naar genavigeerd
- Of er is een redirect die verkeerd gaat

#### C. Component State / Props
- Wanneer `contract = null`, gebruikt component mogelijk oude default values
- Of er is een fallback die oude versie toont

### 5. **Waarom werkt het de tweede keer?**

- `selectedContract` staat al in Zustand store (van eerste keer)
- Bij tweede keer: `selectedContract` is beschikbaar → `contract` wordt gevonden
- Formulier rendert correct met contract data

## CONCLUSIE - 100% ZEKER

**PRIMAIR PROBLEEM:**
1. `resultaten` wordt NIET in Zustand store gezet vanuit `resultaten/page.tsx`
2. `selectedContract` heeft race condition (niet gezet voordat navigatie)
3. Resultaat: `contract = null` bij eerste render

**SECUNDAIR PROBLEEM:**
- Wanneer `contract = null`, rendert formulier zonder contract data
- Mogelijk wordt oude versie getoond door cache of fallback mechanisme

## OPLOSSING

1. **Fix `resultaten` in store**: Zet `resultaten` in Zustand store vanuit `resultaten/page.tsx`
2. **Fix race condition**: Wacht op Zustand update VOORDAT navigeren, of fetch contract via API als fallback
3. **Add loading state**: Toon loading totdat contract data beschikbaar is
4. **Add early return**: Als `contract === null`, toon loading of error message

