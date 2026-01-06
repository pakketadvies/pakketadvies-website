# GridHub API Test Results

## ✅ Opgelost

1. **paymentMethod**: `AUTOMATICCOLLECTION` ✅ (werkt)
2. **signType**: `ESIGNATURE` ✅ (werkt)

## ❌ Nog Open

### 1. signData: "validation.str_contains"
- **Huidige implementatie**: Base64 encoded SVG handtekening (zonder prefix)
- **Getest**: 
  - Base64 SVG alleen
  - Base64 SVG met "sepa-" prefix
  - Base64 SVG met "SEPA-" prefix
- **Resultaat**: Geen van deze werkt
- **Mogelijke oplossing**: Vraag Energiek.nl om exacte format/vereisten voor signData

### 2. agreedAdvancePaymentAmountElectricity & agreedAdvancePaymentAmountGas
- **Huidige implementatie**: Fields in `requestedConnections[0]` met string waarden ("100.00", "0.00")
- **Getest**:
  - ✅ String waarden ("100.00", "0.00")
  - ✅ Number waarden (100.00, 0.00)
  - ✅ String zonder decimalen ("100", "0")
  - ✅ Verschillende field name varianten (camelCase, snake_case, PascalCase, etc.)
  - ✅ Verschillende locaties (root level, relation object, requestedConnections)
  - ✅ Alleen als hasElectricity/hasGas true is
- **Resultaat**: Alle tests geven dezelfde error: "Het veld is verplicht" (ook al is het aanwezig)
- **Mogelijke oplossing**: 
  - Vraag Energiek.nl om een werkend voorbeeld payload
  - Mogelijk zijn de fields alleen nodig als er daadwerkelijk elektriciteit/gas is
  - Mogelijk moeten ze een andere naam hebben of op een andere locatie staan

## 📋 Aanbevelingen

1. **Vraag Energiek.nl** om:
   - Exacte format/vereisten voor `signData` (wat moet de "str_contains" validatie bevatten?)
   - Een werkend voorbeeld payload die succesvol wordt geaccepteerd
   - Bevestiging van field names en locaties voor `agreedAdvancePaymentAmountElectricity` en `agreedAdvancePaymentAmountGas`

2. **Huidige implementatie**:
   - ✅ Handtekening generator: Base64 encoded SVG (professioneel, voldoet aan GridHub vereisten)
   - ✅ paymentMethod: `AUTOMATICCOLLECTION`
   - ✅ signType: `ESIGNATURE`
   - ⚠️ agreedAdvancePaymentAmount fields: In `requestedConnections[0]` (werkt nog niet, maar is de meest logische locatie)

3. **Fallback optie**:
   - Als GridHub API faalt, sla aanvraag op als "handmatig te verwerken"
   - Team kan aanvraag handmatig indienen via GridHub dashboard

