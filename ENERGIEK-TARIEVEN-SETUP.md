# 🔧 Energiek.nl Tarieven Setup

## ✅ Goed Nieuws!

Het systeem gebruikt **al automatisch het 30-dagen gemiddelde** voor dynamische contracten! 

**Hoe het werkt:**
1. ✅ **Basisprijs**: Gemiddelde inkooptarief laatste 30 dagen (elektriciteit/gas) - **automatisch opgehaald**
2. ✅ **Opslag**: Bovenop de basisprijs (moet worden geconfigureerd)
3. ✅ **Vastrecht**: Vaste maandelijkse kosten (moet worden geconfigureerd)

**Berekening:**
```
Totale prijs = (30-dagen gemiddelde marktprijs + opslag) × verbruik + vastrecht
```

## 📋 Wat Moet Worden Geconfigureerd

De **opslagen en vastrechten** moeten worden geconfigureerd. Deze worden niet automatisch opgehaald omdat GridHub API geen pricing endpoint heeft.

### Stap 1: Vraag Energiek.nl om Exacte Tarieven

Vraag Chrisje Meulendijks (Energiek.nl) om de exacte tarieven:

**Voor Particulier Dynamisch Contract:**
- Opslag elektriciteit: €X.XX per kWh (bovenop 30-dagen gemiddelde marktprijs)
- Opslag gas: €X.XX per m³ (bovenop 30-dagen gemiddelde marktprijs)
- Vastrecht stroom: €X.XX per maand
- Vastrecht gas: €X.XX per maand

**Voor Zakelijk Dynamisch Contract:**
- Opslag elektriciteit: €X.XX per kWh (bovenop 30-dagen gemiddelde marktprijs)
- Opslag gas: €X.XX per m³ (bovenop 30-dagen gemiddelde marktprijs)
- Vastrecht stroom: €X.XX per maand
- Vastrecht gas: €X.XX per maand

### Stap 2: Configureer in Admin Panel

1. Ga naar `/admin/contracten`
2. Zoek "Dynamisch Energiecontract" (particulier) of "Dynamisch Zakelijk Energiecontract"
3. Klik op "Bewerken"
4. Vul de exacte tarieven in:
   - **Opslag elektriciteit**: €/kWh bovenop 30-dagen gemiddelde
   - **Opslag gas**: €/m³ bovenop 30-dagen gemiddelde
   - **Vastrecht stroom**: €/maand
   - **Vastrecht gas**: €/maand
5. Sla op

## 📧 Email Template voor Energiek.nl

```
Beste Chrisje,

We hebben de GridHub API integratie succesvol geïmplementeerd. 

Ons systeem gebruikt automatisch het 30-dagen gemiddelde inkooptarief als basisprijs 
voor dynamische contracten. Daar komt dan jullie opslag bovenop.

Voor de dynamische contracten hebben we de exacte tarieven nodig:

**Particulier Dynamisch Contract:**
- Opslag elektriciteit: €X.XX per kWh (bovenop 30-dagen gemiddelde EPEX Day-Ahead marktprijs)
- Opslag gas: €X.XX per m³ (bovenop 30-dagen gemiddelde marktprijs)
- Vastrecht stroom: €X.XX per maand
- Vastrecht gas: €X.XX per maand

**Zakelijk Dynamisch Contract:**
- Opslag elektriciteit: €X.XX per kWh (bovenop 30-dagen gemiddelde EPEX Day-Ahead marktprijs)
- Opslag gas: €X.XX per m³ (bovenop 30-dagen gemiddelde marktprijs)
- Vastrecht stroom: €X.XX per maand
- Vastrecht gas: €X.XX per maand

Kunnen jullie deze tarieven bevestigen zodat we ze kunnen configureren in ons systeem?

Met vriendelijke groet,
[Naam]
```

## 🔍 Verificatie

Na het configureren van de tarieven:

1. Check `/admin/contracten` - tarieven moeten zichtbaar zijn
2. Test een vergelijking op de website
3. Controleer of de berekende prijzen kloppen:
   - Basisprijs = 30-dagen gemiddelde (automatisch)
   - Totale prijs = Basisprijs + Opslag (geconfigureerd)

## ⚠️ Belangrijk

- ✅ **30-dagen gemiddelde wordt automatisch berekend** (dagelijks via cron job)
- ⚠️ **Opslagen en vastrechten moeten handmatig worden geconfigureerd**
- ⚠️ GridHub API heeft geen endpoint om deze op te halen
- ✅ Tarieven kunnen worden aangepast in `/admin/contracten` zonder code changes

## 📊 Hoe de Berekening Werkt

```typescript
// 1. Haal 30-dagen gemiddelde op (automatisch)
const gemiddelde30Dagen = await get30DayAverageElectricityPrices() // Bijv. €0.08/kWh

// 2. Tel opslag erbij op (geconfigureerd in admin)
const totaalTarief = gemiddelde30Dagen + opslagElektriciteit // Bijv. €0.08 + €0.05 = €0.13/kWh

// 3. Bereken kosten
const kosten = verbruik * totaalTarief + vastrecht
```

Dit gebeurt automatisch voor alle dynamische contracten, inclusief Energiek.nl!
