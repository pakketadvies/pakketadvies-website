# Vragen voor Energiek.nl / GridHub API

## 📋 Situatie

We hebben de GridHub API integratie geïmplementeerd, maar krijgen nog steeds validatiefouten. We hebben uitgebreid getest, maar kunnen de exacte enum waarden niet vinden.

## ❌ Huidige Errors

1. **`relation.paymentMethod`**: "De geselecteerde relation.payment method is ongeldig."
   - We hebben getest: `SEPA_DIRECT_DEBIT`, `DIRECT_DEBIT`, `SEPA`, `AUTOMATIC_COLLECTION`
   - Geen enkele werkt

2. **`signType`**: "De geselecteerde sign type is ongeldig."
   - We hebben getest: `EMAIL`, `SMS`, `PAPER`, `DIGITAL`, `DIGITAAL`, `ELEKTRONISCH`, `ONLINE`, `WEB`, `FORM`
   - Geen enkele werkt

3. **`signData`**: "validation.str_contains"
   - We hebben getest: `sepa`, `SEPA`, `sepa-mandate`, `sepa mandate`, `sepa_direct_debit`, etc.
   - Geen enkele werkt
   - **Vraag**: Welke exacte tekst moet `signData` bevatten?

4. **`requestedConnections.agreedAdvancePaymentAmountElectricity`**: "Het veld is verplicht."
   - Field is aanwezig met waarde `'100.00'` (string)
   - Wordt nog steeds als verplicht gemarkeerd
   - **Vraag**: Is de field name correct? Moet het op een andere plek staan?

5. **`requestedConnections.agreedAdvancePaymentAmountGas`**: "Het veld is verplicht."
   - Field is aanwezig met waarde `'0.00'` (string)
   - Wordt nog steeds als verplicht gemarkeerd
   - **Vraag**: Is de field name correct? Moet het op een andere plek staan?

## ❓ Specifieke Vragen

### 1. Enum Waarden
Kunnen jullie de exacte enum waarden verstrekken voor:
- `relation.paymentMethod` (voor SEPA automatische incasso)
- `signType` (voor digitale handtekening via formulier)
- `signSource` (voor automatische incasso mandate)

### 2. signData Format
- Welke exacte tekst moet `signData` bevatten?
- Moet het een specifieke format hebben?
- Is er een voorbeeld waarde die we kunnen gebruiken?

### 3. agreedAdvancePaymentAmount Fields
- Zijn de field names `agreedAdvancePaymentAmountElectricity` en `agreedAdvancePaymentAmountGas` correct?
- Moeten ze in `requestedConnections[0]` staan of op root level?
- Wat is het verwachte type (string, number)?
- Moeten ze altijd een waarde hebben, ook als er geen gas is?

### 4. Voorbeeld Payload
Kunnen jullie een **werkend voorbeeld payload** verstrekken die succesvol wordt geaccepteerd door de GridHub API? Dit zou enorm helpen!

## 📝 Wat We Hebben Geïmplementeerd

✅ Authenticatie (Bearer Auth met password)
✅ Timestamp formatting (Y-m-d H:i:s)
✅ IBAN formatting
✅ Advance payment amounts berekening
✅ Alle verplichte fields toegevoegd
✅ TypeScript types aangepast

## 🔧 Huidige Payload Structuur

```json
{
  "relation": {
    "paymentMethod": "SEPA_DIRECT_DEBIT",
    ...
  },
  "requestedConnections": [{
    "agreedAdvancePaymentAmountElectricity": "100.00",
    "agreedAdvancePaymentAmountGas": "0.00",
    ...
  }],
  "signType": "EMAIL",
  "signSource": "EMAIL",
  "signData": "sepa-{base64Hash}",
  "originalCreateTimestamp": "2026-01-06 14:40:00",
  "agreedAdvancePaymentAmount": "100.00"
}
```

## 🎯 Wat We Nodig Hebben

1. **Exacte enum waarden** voor paymentMethod, signType, signSource
2. **Exacte format** voor signData
3. **Werkend voorbeeld payload** van GridHub API
4. **Bevestiging** van field names en locaties

Bedankt!

