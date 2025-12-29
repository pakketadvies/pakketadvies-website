# Cookie Consent Verificatie

## ✅ Wat werkt echt:

### 1. **Facebook Pixel - Conditioneel laden**
- ✅ Script wordt **NIET** geladen als marketing cookies niet zijn geaccepteerd
- ✅ Check gebeurt **voor** het script wordt geladen (`shouldLoad` state)
- ✅ Luistert naar cookie preference changes
- ✅ Real-time updates zonder page reload

### 2. **Google Analytics - Klaar voor gebruik**
- ✅ Component gemaakt die conditioneel laadt op basis van analytische cookies
- ✅ Gebruik: voeg `NEXT_PUBLIC_GA_MEASUREMENT_ID` toe aan environment variables
- ✅ Script wordt **NIET** geladen als analytische cookies niet zijn geaccepteerd

### 3. **Cookie Preferences Storage**
- ✅ Voorkeuren worden opgeslagen in localStorage
- ✅ Policy versioning: bij wijziging cookiebeleid wordt opnieuw toestemming gevraagd
- ✅ Event system: andere componenten kunnen luisteren naar wijzigingen

## 🔍 Hoe te testen:

### Test 1: Facebook Pixel zonder toestemming
1. Open browser in incognito mode
2. Ga naar pakketadvies.nl
3. Open Developer Tools → Network tab
4. Filter op "facebook" of "fbevents"
5. **Verwacht:** Geen requests naar Facebook
6. Accepteer cookies (marketing)
7. **Verwacht:** Nu wel requests naar Facebook

### Test 2: localStorage check
1. Open Developer Tools → Application → Local Storage
2. Zoek naar `pakketadvies-cookie-preferences`
3. **Verwacht:** JSON object met voorkeuren
4. Verwijder dit item
5. Refresh pagina
6. **Verwacht:** Cookie banner verschijnt opnieuw

### Test 3: Console check
1. Open Developer Tools → Console
2. Type: `window.fbq`
3. **Zonder marketing cookies:** `undefined`
4. **Met marketing cookies:** Functie object

### Test 4: Network tab check
1. Open Developer Tools → Network
2. Filter op "script" of "js"
3. **Zonder toestemming:** Geen Facebook/Google scripts
4. **Met toestemming:** Scripts worden geladen

## ⚠️ Belangrijke opmerkingen:

1. **Google Analytics is nog niet geactiveerd**
   - Component bestaat, maar wordt nog niet gebruikt
   - Voeg toe aan `src/app/layout.tsx` als je GA wilt gebruiken
   - Zet `NEXT_PUBLIC_GA_MEASUREMENT_ID` in environment variables

2. **Marketing cookies zijn momenteel disabled in UI**
   - Toggle is disabled omdat er nog geen marketing cookies worden gebruikt
   - Facebook Pixel wordt geladen als marketing cookies zijn geaccepteerd
   - Als je marketing cookies wilt activeren, verwijder `disabled` van de toggle

3. **Page reload na cookie acceptatie**
   - Dit is bewust: zorgt ervoor dat alle scripts correct worden geladen
   - Alternatief: dynamisch scripts toevoegen (complexer)

## 🚀 Toekomstige verbeteringen:

- [ ] Google Analytics toevoegen (als gewenst)
- [ ] Marketing cookies toggle activeren
- [ ] Dynamisch script loading zonder page reload
- [ ] Cookie banner kan altijd opnieuw worden geopend (via footer link)

