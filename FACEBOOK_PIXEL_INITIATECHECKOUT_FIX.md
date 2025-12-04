# 🔧 Facebook Pixel InitiateCheckout Event Fix

## 🔍 Probleem

Het InitiateCheckout event werd niet getracked wanneer iemand op "Aanvragen" klikte op de resultaten pagina.

## ✅ Oplossing

### Verbeteringen aangebracht:

1. **Betere Pixel Loading Detection**
   - Functie die wacht tot de Pixel geladen is (max 2 seconden)
   - Retry mechanisme als de Pixel nog niet beschikbaar is

2. **Betere Error Handling**
   - Duidelijke console logs om te zien wat er gebeurt
   - Error messages als de Pixel niet beschikbaar is

3. **Asynchrone Tracking**
   - Als de Pixel nog niet geladen is, wordt het event later getracked
   - Geen verlies van events door timing issues

## 🧪 Testen

### Stap-voor-stap:

1. **Open browser console** (F12)
   - Je zult nu duidelijke logs zien wanneer events worden getracked

2. **Ga naar resultaten pagina**:
   - Navigeer naar: `https://pakketadvies.nl/calculator/resultaten`

3. **Klik op "Aanvragen"**:
   - Bij een contract
   - Check de browser console voor logs zoals:
     - `[Facebook Pixel] ✅ Event tracked: InitiateCheckout {...}`

4. **Check Pixel Helper**:
   - Klik op de Pixel Helper extensie
   - Je zou nu het InitiateCheckout event moeten zien

5. **Check Events Manager**:
   - Ga naar Events Manager → Test Events tab
   - Je zou het InitiateCheckout event moeten zien

## 📊 Wat wordt getracked?

Het InitiateCheckout event bevat:
- `content_name`: Leverancier naam (bijv. "Frank Energie")
- `content_category`: "Energiecontract"
- `value`: Totale jaarprijs (bijv. 1964)
- `currency`: "EUR"
- `contract_id`: Contract ID
- `contract_type`: "vast" / "dynamisch" / "maatwerk"

## ✅ Status

- ✅ Tracking code verbeterd
- ✅ Retry logic toegevoegd
- ✅ Betere logging toegevoegd
- ⏳ Deployment in progress

**Test na deployment met browser console open om logs te zien!**

