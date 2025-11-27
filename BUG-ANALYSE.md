# 🔍 Bug Analyse: Oude aanvraagstraat wordt getoond

## Probleem
Wanneer een gebruiker een zakelijk contract probeert aan te vragen, ziet hij eerst een oude versie van het formulier (bijlage 1) met:
- "Bedrijf opzetten" sectie
- "Contactpersoon" veld (in plaats van voornaam/achternaam)
- Oude layout en structuur

Na teruggaan naar homepage en opnieuw proberen, ziet hij de juiste versie (bijlage 2) met:
- "Bedrijf opzoeken" sectie
- Moderne velden (aanhef, voornaam, voorletters, etc.)
- Nieuwe layout

## Root Cause Analyse

### 1. **Oude Route Bestaat Nog**
Er bestaat nog een oude route: `/contract/afsluiten/page.tsx`
- Deze bevat een compleet ander (oud) formulier
- Heeft "Contactpersoon" veld
- Heeft "Bedrijf opzetten" sectie
- Gebruikt oude state management

### 2. **Nieuwe Route**
De nieuwe route is: `/calculator?stap=2&contract={id}`
- Gebruikt `BedrijfsgegevensForm` component
- Heeft moderne velden
- Gebruikt nieuwe state management

### 3. **Mogelijke Oorzaken**

#### A. Race Condition in Contract Loading
In `BedrijfsgegevensForm.tsx` regel 144-145:
```typescript
const contractId = searchParams?.get('contract')
const contract = selectedContract || (contractId && resultaten?.find(c => c.id === contractId)) || null
```

**Probleem**: 
- `selectedContract` kan nog niet gezet zijn (race condition)
- `resultaten` kan nog niet geladen zijn in de store
- Als `contract` null is, kan `bepaalContractType` verkeerd gedrag vertonen

#### B. Caching Issue
- Browser cache kan oude versie tonen
- Next.js cache kan oude component renderen
- Service worker cache (PWA) kan oude versie serveren

#### C. State Initialisatie
- Zustand store kan oude state bevatten
- `resultaten` array kan leeg zijn bij eerste render
- `selectedContract` kan niet correct worden gezet

#### D. Routing Conflict
- Mogelijk wordt er ergens nog naar `/contract/afsluiten` genavigeerd
- Of er is een redirect die verkeerd gaat
- Of er is een fallback die de oude route toont

## Waarschijnlijke Oorzaak

**Meest waarschijnlijk**: **Race Condition + State Initialisatie**

1. Gebruiker klikt "Aanvragen" op contract card
2. `setSelectedContract(contract)` wordt aangeroepen
3. `router.push('/calculator?stap=2&contract=...')` wordt aangeroepen
4. **PROBLEEM**: De navigatie gebeurt VOORDAT de store update is doorgevoerd
5. `BedrijfsgegevensForm` rendert met `contract = null` (omdat `selectedContract` nog niet gezet is EN `resultaten` nog niet geladen is)
6. Component rendert mogelijk een fallback of oude versie
7. Bij tweede keer is de state al correct geïnitialiseerd, dus werkt het wel

## Oplossingsrichtingen

1. **Fix State Initialisatie**: Zorg dat `selectedContract` synchroon wordt gezet VOORDAT navigatie
2. **Fix Contract Loading**: Wacht op contract data VOORDAT formulier rendert
3. **Verwijder Oude Route**: Verwijder `/contract/afsluiten` route als deze niet meer gebruikt wordt
4. **Add Loading State**: Toon loading state totdat contract data beschikbaar is
5. **Fix Race Condition**: Gebruik `useEffect` om contract te laden na mount

## Te Checken

- [ ] Wordt `/contract/afsluiten` nog ergens gebruikt?
- [ ] Is er een redirect van oude naar nieuwe route?
- [ ] Wordt `selectedContract` correct gezet in ContractCard?
- [ ] Wordt `resultaten` correct geladen in de store?
- [ ] Is er een fallback render in BedrijfsgegevensForm die oude versie toont?

