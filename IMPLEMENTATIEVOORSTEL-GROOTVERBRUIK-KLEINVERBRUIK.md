# Implementatievoorstel: Grootverbruik/Kleinverbruik Classificatie

## 📋 Overzicht

Dit voorstel beschrijft de implementatie van grootverbruik/kleinverbruik classificatie voor maatwerk contracten, inclusief:
1. Database wijzigingen
2. Backend (admin) aanpassingen
3. Frontend (calculator) filtering
4. Informatie pagina

---

## 🎯 Doelstellingen

1. **Backend**: Admins kunnen bij maatwerk contracten aangeven of het voor kleinverbruik, grootverbruik of beide is
2. **Frontend**: Maatwerk contracten worden gefilterd op basis van de aansluitwaarden van de gebruiker
3. **Informatie**: Gebruikers kunnen informatie vinden over het verschil tussen grootverbruik en kleinverbruik

---

## 📊 Huidige Situatie

### ✅ Wat al werkt:
- Aansluitwaarden systeem met `is_kleinverbruik` flag in database
- Calculator forms hebben aansluitwaarde selectie
- Maatwerk contracten worden gefilterd op `min_verbruik`
- Database heeft `aansluitwaarden_elektriciteit` en `aansluitwaarden_gas` tabellen

### ❌ Wat nog ontbreekt:
- `verbruik_type` veld in `contracten_details_maatwerk` tabel
- Filtering op grootverbruik/kleinverbruik voor maatwerk contracten
- Informatie pagina over grootverbruik/kleinverbruik
- Logica om te bepalen of gebruiker grootverbruik heeft

---

## 🗄️ Database Wijzigingen

### 1. Migratie: Voeg `verbruik_type` toe aan `contracten_details_maatwerk`

```sql
-- Migration: Add verbruik_type to contracten_details_maatwerk
-- Date: 2025-01-XX
-- Description: Allows maatwerk contracts to be filtered by kleinverbruik/grootverbruik

ALTER TABLE contracten_details_maatwerk 
ADD COLUMN verbruik_type TEXT DEFAULT 'beide' 
CHECK (verbruik_type IN ('kleinverbruik', 'grootverbruik', 'beide'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contracten_details_maatwerk_verbruik_type 
ON contracten_details_maatwerk(verbruik_type);

-- Add comment
COMMENT ON COLUMN contracten_details_maatwerk.verbruik_type IS 
'Bepaalt voor welk verbruikstype dit maatwerk contract zichtbaar is: kleinverbruik (≤3x80A/≤G25), grootverbruik (>3x80A/>G25), of beide';
```

**Waarden:**
- `'kleinverbruik'`: Alleen zichtbaar voor gebruikers met ≤ 3x80A en/of ≤ G25
- `'grootverbruik'`: Alleen zichtbaar voor gebruikers met > 3x80A en/of > G25
- `'beide'`: Altijd zichtbaar (default)

---

## 🔧 Backend (Admin) Wijzigingen

### 1. TypeScript Types (`src/types/admin.ts`)

```typescript
export interface ContractDetailsMaatwerk {
  // ... bestaande velden ...
  
  // NIEUW: Verbruik type filtering
  verbruik_type: 'kleinverbruik' | 'grootverbruik' | 'beide' // Default: 'beide'
}
```

### 2. MaatwerkContractForm (`src/components/admin/MaatwerkContractForm.tsx`)

**Toevoegen aan schema:**
```typescript
const maatwerkContractSchema = z.object({
  // ... bestaande velden ...
  
  // NIEUW: Verbruik type
  verbruik_type: z.enum(['kleinverbruik', 'grootverbruik', 'beide']),
})
```

**Toevoegen aan defaultValues:**
```typescript
defaultValues: {
  // ... bestaande velden ...
  verbruik_type: contract?.details_maatwerk?.verbruik_type || 'beide',
}
```

**Toevoegen aan form UI (na `target_audience` veld):**
```tsx
{/* Verbruik Type */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Verbruik Type <span className="text-red-500">*</span>
  </label>
  <select
    {...register('verbruik_type')}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500"
  >
    <option value="beide">Beide (kleinverbruik en grootverbruik)</option>
    <option value="kleinverbruik">Alleen kleinverbruik (≤3x80A / ≤G25)</option>
    <option value="grootverbruik">Alleen grootverbruik (>3x80A / >G25)</option>
  </select>
  <p className="text-xs text-gray-500">
    Bepaalt voor welk verbruikstype dit contract zichtbaar is op basis van aansluitwaarden
  </p>
  {errors.verbruik_type && (
    <p className="text-sm text-red-500">{errors.verbruik_type.message}</p>
  )}
</div>
```

**Toevoegen aan submit handler:**
```typescript
const detailsData: ContractDetailsMaatwerkFormData = {
  // ... bestaande velden ...
  verbruik_type: data.verbruik_type,
}
```

---

## 🎨 Frontend (Calculator) Wijzigingen

### 1. Helper Functie: Bepaal Grootverbruik Status

**Nieuwe file: `src/lib/verbruik-type.ts`**

```typescript
/**
 * Bepaalt of een gebruiker grootverbruik heeft op basis van aansluitwaarden
 * 
 * Regels:
 * - Elektriciteit: > 3x80A = grootverbruik
 * - Gas: > G25 = grootverbruik
 * - Als EITHER elektriciteit OF gas grootverbruik is, dan is de gebruiker grootverbruiker
 */
export function isGrootverbruik(
  aansluitwaardeElektriciteit?: string,
  aansluitwaardeGas?: string
): boolean {
  // Elektriciteit: > 3x80A is grootverbruik
  const isGrootverbruikElektriciteit = aansluitwaardeElektriciteit 
    ? isGrootverbruikElektriciteitAansluitwaarde(aansluitwaardeElektriciteit)
    : false
  
  // Gas: > G25 is grootverbruik
  const isGrootverbruikGas = aansluitwaardeGas
    ? isGrootverbruikGasAansluitwaarde(aansluitwaardeGas)
    : false
  
  // Als EITHER grootverbruik is, dan is de gebruiker grootverbruiker
  return isGrootverbruikElektriciteit || isGrootverbruikGas
}

/**
 * Check of elektriciteit aansluitwaarde grootverbruik is
 * > 3x80A = grootverbruik
 */
function isGrootverbruikElektriciteitAansluitwaarde(aansluitwaarde: string): boolean {
  // Alle waarden ≤ 3x80A zijn kleinverbruik
  const kleinverbruikWaarden = [
    '1x25A', '1x35A', '1x40A',
    '3x25A', '3x35A', '3x40A', '3x50A', '3x63A', '3x80A'
  ]
  
  return !kleinverbruikWaarden.includes(aansluitwaarde)
}

/**
 * Check of gas aansluitwaarde grootverbruik is
 * > G25 = grootverbruik
 */
function isGrootverbruikGasAansluitwaarde(aansluitwaarde: string): boolean {
  // Alle waarden ≤ G25 zijn kleinverbruik
  const kleinverbruikWaarden = [
    'G4', 'G6', 'G6_LAAG', 'G6_MIDDEN', 'G6_HOOG',
    'G10', 'G16', 'G25'
  ]
  
  return !kleinverbruikWaarden.includes(aansluitwaarde)
}
```

### 2. Resultaten Pagina Filtering (`src/app/calculator/resultaten/page.tsx`)

**Importeren:**
```typescript
import { isGrootverbruik } from '@/lib/verbruik-type'
```

**In `transformContractToOptie` functie (na min_verbruik filtering):**
```typescript
// NIEUW: Filter op verbruik_type voor maatwerk contracten
if (contract.type === 'maatwerk' && contract.details_maatwerk) {
  const maatwerkDetails = contract.details_maatwerk
  const verbruikType = maatwerkDetails.verbruik_type || 'beide'
  
  // Als verbruik_type is ingesteld (niet 'beide'), filter op grootverbruik status
  if (verbruikType !== 'beide') {
    const gebruikerIsGrootverbruik = isGrootverbruik(
      verbruikData.aansluitwaardeElektriciteit,
      verbruikData.aansluitwaardeGas
    )
    
    // Contract is alleen zichtbaar als verbruik_type matcht met gebruiker status
    if (verbruikType === 'kleinverbruik' && gebruikerIsGrootverbruik) {
      return null // Contract niet zichtbaar, gebruiker is grootverbruiker
    }
    if (verbruikType === 'grootverbruik' && !gebruikerIsGrootverbruik) {
      return null // Contract niet zichtbaar, gebruiker is kleinverbruiker
    }
  }
}
```

**Plaatsing:** Deze check moet NA de `min_verbruik` filtering komen, maar VOOR de contract transformatie.

---

## 📄 Informatie Pagina

### Optie 1: Nieuwe Kennisbank Artikel (Aanbevolen)

**File: `src/app/kennisbank/grootverbruik-kleinverbruik/page.tsx`**

```tsx
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

export default function GrootverbruikKleinverbruikPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-navy-500 mb-8">
            Wanneer bent u een grootverbruiker?
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Grootverbruik */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-brand-navy-500 mb-4">
                  Grootverbruik
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Criterium:</strong> Uw elektriciteitsaansluiting is groter dan 3x 80 Ampère 
                    en/of uw gasaansluiting is groter dan G25 (meer dan 40 m³ per uur).
                  </li>
                  <li>
                    <strong>Facturering:</strong> U ontvangt maandelijks een factuur voor de daadwerkelijk 
                    verbruikte hoeveelheid elektriciteit en gas.
                  </li>
                  <li>
                    <strong>Contract Type:</strong> U heeft een energiecontract volgens het netbeheerdersmodel, 
                    waarbij u aparte facturen krijgt voor energielevering en netbeheerkosten.
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Kleinverbruik */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-brand-navy-500 mb-4">
                  Kleinverbruik
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li>
                    <strong>Criterium:</strong> U heeft een elektriciteitsaansluiting van maximaal 3 x 80 Ampère 
                    en/of een gasaansluiting van maximaal G25 (maximaal 25 m³ per uur).
                  </li>
                  <li>
                    <strong>Facturering:</strong> U betaalt maandelijks uw energierekening op basis van een 
                    voorschotbedrag en ontvangt u aan het einde van het jaar een jaarafrekening.
                  </li>
                  <li>
                    <strong>Contract Type:</strong> U heeft een energiecontract volgens het leveranciersmodel, 
                    waarbij u een totaalfactuur krijgt voor zowel energielevering als netbeheerkosten.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Extra informatie */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-brand-navy-500 mb-4">
                Meer informatie
              </h2>
              <p className="text-gray-700 mb-4">
                <Link href="/kennisbank" className="text-brand-teal-600 hover:underline">
                  ← Terug naar kennisbank
                </Link>
              </p>
              <p className="text-gray-700">
                <Link href="/calculator" className="text-brand-teal-600 hover:underline font-semibold">
                  Bereken uw besparing →
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

**Toevoegen aan kennisbank overzicht:**
```tsx
// In src/app/kennisbank/page.tsx
{
  title: 'Grootverbruik vs. Kleinverbruik: wat is het verschil?',
  excerpt: 'Ontdek wanneer u een grootverbruiker bent en wat dit betekent voor uw energiecontract.',
  category: 'Uitleg',
  date: '15 januari 2025',
  readTime: '5 min',
  href: '/kennisbank/grootverbruik-kleinverbruik',
}
```

### Optie 2: Toevoegen aan Calculator Form (Tooltip/Info Box)

**In `VerbruikForm.tsx` en `QuickCalculator.tsx` bij aansluitwaarde sectie:**

```tsx
<div className="flex items-center gap-2 mb-2">
  <label className="block text-sm font-semibold text-brand-navy-500">
    Aansluitwaarde Elektriciteit
  </label>
  <Link 
    href="/kennisbank/grootverbruik-kleinverbruik"
    className="text-brand-teal-600 hover:underline text-xs"
    target="_blank"
  >
    Wat is grootverbruik?
  </Link>
</div>
```

---

## 🔄 Implementatie Volgorde

1. ✅ **Database migratie** - Voeg `verbruik_type` veld toe
2. ✅ **TypeScript types** - Update `ContractDetailsMaatwerk` interface
3. ✅ **Backend form** - Voeg dropdown toe aan `MaatwerkContractForm`
4. ✅ **Helper functie** - Maak `isGrootverbruik` functie
5. ✅ **Frontend filtering** - Filter maatwerk contracten in resultaten pagina
6. ✅ **Informatie pagina** - Maak kennisbank artikel
7. ✅ **Testing** - Test alle scenario's

---

## ✅ Test Scenario's

### Test 1: Kleinverbruik Contract
- **Setup**: Maatwerk contract met `verbruik_type = 'kleinverbruik'`
- **Gebruiker**: Aansluitwaarde 3x80A / G25
- **Verwacht**: Contract is zichtbaar ✅

### Test 2: Kleinverbruik Contract (Grootverbruiker)
- **Setup**: Maatwerk contract met `verbruik_type = 'kleinverbruik'`
- **Gebruiker**: Aansluitwaarde > 3x80A of > G25
- **Verwacht**: Contract is NIET zichtbaar ✅

### Test 3: Grootverbruik Contract
- **Setup**: Maatwerk contract met `verbruik_type = 'grootverbruik'`
- **Gebruiker**: Aansluitwaarde > 3x80A of > G25
- **Verwacht**: Contract is zichtbaar ✅

### Test 4: Grootverbruik Contract (Kleinverbruiker)
- **Setup**: Maatwerk contract met `verbruik_type = 'grootverbruik'`
- **Gebruiker**: Aansluitwaarde 3x80A / G25
- **Verwacht**: Contract is NIET zichtbaar ✅

### Test 5: Beide Contract
- **Setup**: Maatwerk contract met `verbruik_type = 'beide'`
- **Gebruiker**: Elke aansluitwaarde
- **Verwacht**: Contract is altijd zichtbaar ✅

---

## 📝 Notities

- **Default waarde**: `'beide'` - bestaande contracten blijven zichtbaar
- **Backwards compatible**: Oude contracten zonder `verbruik_type` worden behandeld als `'beide'`
- **Performance**: Index op `verbruik_type` voor snelle filtering
- **UX**: Informatie pagina helpt gebruikers begrijpen wanneer ze grootverbruiker zijn

---

## 🎯 Samenvatting

Dit implementatievoorstel voegt grootverbruik/kleinverbruik classificatie toe aan maatwerk contracten:

1. **Database**: `verbruik_type` veld met waarden: `'kleinverbruik'`, `'grootverbruik'`, `'beide'`
2. **Backend**: Dropdown in admin form om verbruik_type te selecteren
3. **Frontend**: Automatische filtering op basis van aansluitwaarden
4. **Informatie**: Kennisbank artikel met uitleg

De implementatie is backwards compatible en heeft minimale impact op bestaande functionaliteit.

