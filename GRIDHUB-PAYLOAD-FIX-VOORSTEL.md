# GridHub Payload Fix Voorstel

## 🔍 Geanalyseerde Problemen

Uit de test resultaten blijkt dat de volgende validatiefouten optreden:

### 1. **signTimestamp Format**
- **Huidig**: ISO string (`2026-01-06T14:16:07.000Z`)
- **Vereist**: `Y-m-d H:i:s` format (`2026-01-06 14:16:07`)
- **Fix**: Format converteren naar `Y-m-d H:i:s`

### 2. **originalCreateTimestamp**
- **Huidig**: Staat in `requestedConnection` object
- **Vereist**: Moet op root level staan
- **Fix**: Verplaatsen naar root level en format converteren

### 3. **agreedAdvancePaymentAmount Fields**
- **Huidig**: Ontbreken volledig
- **Vereist**: 
  - `requestedConnections[].agreedAdvancePaymentAmountElectricity` (string)
  - `requestedConnections[].agreedAdvancePaymentAmountGas` (string)
  - `agreedAdvancePaymentAmount` op root level (string)
- **Fix**: Toevoegen met berekende waarden

### 4. **signType & signSource Enum Waarden**
- **Huidig**: `'DIGITAL'` en `'DIRECT_DEBIT_MANDATE'`
- **Status**: Test script vond deze niet, maar API geeft aan dat ze ongeldig zijn
- **Fix**: Testen met alternatieve waarden of GridHub documentatie raadplegen

### 5. **paymentMethod**
- **Huidig**: `'DIRECT_DEBIT'`
- **Status**: Test script zegt VALID, maar API geeft ongeldig aan
- **Fix**: Mogelijk moet dit op een andere plek staan of andere waarde hebben

## 📋 Voorgestelde Fixes

### Fix 1: DateTime Format Helper
```typescript
function formatGridHubDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
```

### Fix 2: Update mapper.ts

**Wijzigingen:**
1. Import `formatGridHubDateTime` helper
2. Fix `signTimestamp`: gebruik `formatGridHubDateTime(signTimestamp)` in plaats van `.toISOString()`
3. Verplaats `originalCreateTimestamp` van `requestedConnection` naar root level
4. Voeg `agreedAdvancePaymentAmountElectricity` en `agreedAdvancePaymentAmountGas` toe aan `requestedConnection`
5. Voeg `agreedAdvancePaymentAmount` toe aan root level
6. Bereken advance payment amounts op basis van `maandbedrag` uit aanvraag

**Berekening advance payment:**
- Split `maandbedrag` tussen elektriciteit en gas (50/50 of op basis van verbruik)
- Format als string met 2 decimalen (bijv. `"100.00"`)

### Fix 3: Test signType & signSource Waarden

**Mogelijke alternatieven:**
- `signType`: `'EMAIL'`, `'SMS'`, `'PAPER'`, `'ELEKTRONISCH'`
- `signSource`: `'MANDATE'`, `'SEPA_MANDATE'`, `'CONTRACT'`, `'FORM'`

**Aanpak:**
1. Test script uitvoeren om juiste waarden te vinden
2. Of: GridHub documentatie raadplegen
3. Of: Energiek.nl contacten voor exacte waarden

### Fix 4: IBAN Validatie

**Huidig**: IBAN wordt direct gebruikt
**Fix**: IBAN validatie toevoegen of formatteren (spaties verwijderen, uppercase)

## 🎯 Implementatie Plan

### Stap 1: Helper Functie Toevoegen
- Maak `formatGridHubDateTime` functie in `mapper.ts`

### Stap 2: Mapper Aanpassen
- Fix alle timestamp formats
- Voeg advance payment amounts toe
- Verplaats `originalCreateTimestamp`

### Stap 3: Testen
- Test met echte aanvraag data
- Verifieer alle validatiefouten zijn opgelost

### Stap 4: signType & signSource
- Als test script geen juiste waarden vindt:
  - Gebruik `'EMAIL'` en `'MANDATE'` als fallback
  - Of vraag Energiek.nl om exacte waarden

## ⚠️ Onzekerheden

1. **signType & signSource**: Exacte enum waarden zijn onbekend
2. **paymentMethod**: Test zegt VALID maar API zegt ongeldig - mogelijk structuur probleem
3. **signData**: Validatie fout "validation.str_contains" - mogelijk moet het bepaalde tekst bevatten

## ✅ Voorgestelde Oplossing

1. **Implementeer alle zekere fixes** (timestamp format, advance payment amounts)
2. **Test signType/signSource** met meest waarschijnlijke waarden
3. **Als nog steeds errors**: Log volledige response en pas aan op basis van exacte error messages

## 📝 Code Changes

Zie bijgevoegde code snippets in de implementatie.

