# 📱 MOBIELE ERROR DEBUG PLAN

## Probleem
Op mobiel bij "Aanmelden" in resultatenpagina:
1. **Rode error flash** - verschijnt kort
2. **Geen prijslabels** - maandbedrag, jaarbedrag, besparing ontbreken
3. **Verkeerde berekening** - bij uitklappen details

Op desktop werkt dit allemaal WEL correct.

## Toegevoegde Logging

Ik heb uitgebreide debug logging toegevoegd aan `ContractDetailsCard.tsx`:

### 1. Component Mount
```typescript
debugLogger.info('ContractDetailsCard - Component mounted', {
  hasContract, contractId, contractNaam,
  maandbedrag, jaarbedrag, besparing, hasBreakdown
})
```

### 2. Calculated Values
```typescript
debugLogger.info('ContractDetailsCard - Calculated values', {
  besparing, rating, reviews, contractType
})
```

### 3. Contract Details
```typescript
debugLogger.info('ContractDetailsCard - Contract details', {
  contractType, hasDetails, hasDetailsVast, hasDetailsDynamisch,
  opslag_elektriciteit, opslag_elektriciteit_normaal, opslag_gas
})
```

### 4. Breakdown Check
```typescript
debugLogger.info('ContractDetailsCard - Breakdown check', {
  showDetails, hasBreakdown, hasContractBreakdown,
  loadingBreakdown, hasVerbruik
})
```

### 5. API Request
```typescript
debugLogger.info('ContractDetailsCard - API request payload', payload)
debugLogger.info('ContractDetailsCard - API response', { ok, status, statusText })
```

### 6. Rendering Price Badges
```typescript
debugLogger.info('ContractDetailsCard - Rendering price badges', {
  maandbedrag, maandbedragGreaterThanZero,
  jaarbedrag, jaarbedragGreaterThanZero,
  besparing, besparingGreaterThanZero
})
```

## Hoe Testen

1. Open website op je iPhone
2. Ga naar resultatenpagina  
3. Klik "Aanmelden" op een contract
4. Open `pakketadvies.nl/admin/debug-logs` op desktop
5. Bekijk logs met filter "ContractDetailsCard"

## Waarschijnlijke Oorzaken

### Rode Error Flash
- Mogelijk API error (bereken-contract endpoint)
- Missing contract data (maandbedrag/jaarbedrag undefined)
- JSX parsing error op mobiel

### Geen Prijslabels
- `contract.maandbedrag` is 0, undefined, of null
- `contract.jaarbedrag` is 0, undefined, of null  
- `besparing` berekening faalt (contract.besparing * 12)
- Conditional rendering `> 0` slaat niet aan

### Verkeerde Berekening
- Breakdown wordt opnieuw gefetcht ipv existing breakdown gebruiken
- Andere BTW berekening op mobiel
- API geeft verkeerde data terug op mobiel

## Next Steps

Nadat je de logs hebt:
1. Zoek naar ERROR logs
2. Check welke waardes `undefined`, `null`, of `0` zijn
3. Check of API request/response succesvol is
4. Vergelijk met desktop logs (waar het WEL werkt)

Stuur me screenshots van de logs en ik kan het probleem identificeren!
