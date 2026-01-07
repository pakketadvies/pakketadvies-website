# Email aan Energiek.nl - CapTar codes probleem

**Onderwerp:** Vraag over CapTar codes voor GridHub API integratie

---

Beste Chrisje,

Ik hoop dat het goed met je gaat. Ik schrijf je omdat we tegen een probleem aanlopen met de GridHub API integratie voor alleen-elektriciteit aanvragen.

## Huidige situatie

We proberen aanvragen met alleen elektriciteit (geen gas) door te sturen naar GridHub, maar krijgen steeds een 500 error terug. We hebben verschillende variaties getest:

### Test 1: capacityCodeGas weglaten
- **Resultaat:** 422 error - "Het requested connections.agreed advance payment amount gas veld is verplicht"
- **Conclusie:** Het veld is verplicht, ook als `hasGas: false`

### Test 2: capacityCodeGas: "20102" (originele code voor G6)
- **Resultaat:** 422 error - "Capaciteitscode requestedConnections.capacityCodeGas is ongeldig"
- **Conclusie:** Deze code wordt niet geaccepteerd door GridHub

### Test 3: capacityCodeGas: "10211" (elektriciteit code)
- **Resultaat:** 422 error - "Capaciteitscode requestedConnections.capacityCodeGas is ongeldig"
- **Conclusie:** GridHub gebruikt niet dezelfde CapTar codes voor elektriciteit en gas

### Test 4: capacityCodeGas weglaten (volgens jullie advies)
- **Situatie:** Jullie gaven aan dat andere prijsvergelijkers de CapTar code niet meesturen
- **Resultaat:** 500 error - "Interne fout. Service ID: [ID]"
- **Payload:** 
  - `hasGas: false`
  - `agreedAdvancePaymentAmountGas: 0` (verplicht veld)
  - `capacityCodeGas`: weggelaten
- **Conclusie:** Dit lijkt een GridHub server-side bug te zijn

### Test 5: hasGas: true maken met minimale gas data
- **Resultaat:** 422 error - "Capaciteitscode requestedConnections.capacityCodeGas is ongeldig"
- **Conclusie:** Als `hasGas: true` is, MOET je een `capacityCodeGas` meesturen, maar we weten niet welke code correct is

## Wat we hebben geprobeerd

1. ✅ `capacityCodeGas` weglaten (zoals jullie adviseerden)
2. ✅ `capacityCodeGas: "20102"` (originele G6 code)
3. ✅ `capacityCodeGas: "10211"` (elektriciteit code)
4. ✅ `agreedAdvancePaymentAmountGas: 0` (verplicht veld)
5. ✅ `hasGas: false` (zoals het hoort)
6. ✅ `hasGas: true` met minimale gas data (workaround)

## Huidige status

**Payload die we nu sturen (volgens jullie advies):**
```json
{
  "requestedConnections": {
    "hasElectricity": true,
    "hasGas": false,
    "capacityCodeElectricity": "10211",
    "agreedAdvancePaymentAmountElectricity": 16,
    "agreedAdvancePaymentAmountGas": 0,
    // capacityCodeGas wordt WEGGELATEN (zoals jullie adviseerden)
  }
}
```

**Error die we krijgen:**
```
GridHub API error: 500 - {"message":"Interne fout. Service ID: [ID]"}
```

## Vragen

1. **CapTar codes voor gas:** Kunnen jullie ons de correcte CapTar code mapping geven voor gas? We hebben geprobeerd met "20102" en "10211", maar beide worden afgewezen.

2. **Alleen-elektriciteit aanvragen:** Hoe doen andere prijsvergelijkers dit? Krijgen zij ook 500 errors, of werkt het bij hen wel?

3. **Workaround:** Is er een tijdelijke workaround mogelijk tot dit is opgelost? Bijvoorbeeld:
   - Een specifieke CapTar code die we kunnen gebruiken voor alleen-elektriciteit aanvragen?
   - Een andere manier om de payload te structureren?

4. **GridHub bug:** Lijkt dit een bug aan GridHub kant te zijn? De payload is correct volgens jullie advies, maar GridHub geeft een 500 error.

## Wat we nu kunnen doen

We staan open voor:
- ✅ Een test call met jullie om te zien wat er precies misgaat
- ✅ Het ontvangen van een voorbeeld payload van een werkende alleen-elektriciteit aanvraag
- ✅ Het ontvangen van de officiële CapTar code mapping documentatie
- ✅ Een tijdelijke workaround tot het probleem is opgelost

Kunnen jullie ons hierbij helpen? We willen graag dat alleen-elektriciteit aanvragen ook werken via jullie GridHub integratie.

Alvast bedankt voor jullie hulp!

Met vriendelijke groet,
Rick Schlimback
PakketAdvies B.V.

---

**Service IDs uit errors (voor referentie):**
- `1304edc037ea44c5b65daf806021f88c`
- `8d435712311e4c5eb0ed845346c03ab0`
- `d245722c63e04682b9fdeab44d910a25`

