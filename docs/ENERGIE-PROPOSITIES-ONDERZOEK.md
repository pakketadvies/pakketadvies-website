# Onderzoek: Hoe krijgen minder.nl, gaslicht.com en pricewise.com hun energiecontract proposities?

## Executive Summary

Na grondig onderzoek blijkt dat de grote energievergelijkers (minder.nl, gaslicht.com, pricewise.com) **directe partnerships** hebben met energieleveranciers. Ze gebruiken **GEEN** affiliate netwerken zoals Daisycon, maar werken rechtstreeks met leveranciers via:

1. **Directe leverancier partnerships** (meest voorkomend)
2. **Marketing partnerships** met vaste commissie per lead/contract
3. **API integraties** (waarschijnlijk via EDSN of directe leverancier APIs)
4. **Handmatige data updates** (voor kleinere leveranciers)

---

## 1. Business Model Analyse

### Minder.nl
- **Verdienmodel**: Vaste vergoeding per afgesloten contract
- **Onafhankelijkheid**: Gelijk bedrag van alle leveranciers (garantie voor objectiviteit)
- **Partnerships**: Direct met alle zakelijke energieleveranciers
- **Geen affiliate netwerken**: Werkt rechtstreeks met leveranciers

### Gaslicht.com
- **Focus**: Particuliere én zakelijke markt
- **Partnerships**: Direct met leveranciers
- **iDIN integratie**: Hebben al iDIN voor verbruiksdata ophalen

### Pricewise
- **Focus**: Particuliere markt
- **Partnerships**: Direct met leveranciers
- **Real-time data**: Waarschijnlijk via API integraties

---

## 2. Hoe krijgen ze de proposities?

### Optie A: Directe Leverancier Partnerships (Aanbevolen)

**Hoe het werkt:**
1. **Contact opnemen met leveranciers** (sales/marketing afdelingen)
2. **Partnership overeenkomst** sluiten:
   - Vaste commissie per lead/contract
   - API toegang of data feed
   - Marketing budget afspraken
3. **Technische integratie**:
   - API voor real-time tarieven
   - Data feed (CSV/JSON) voor contract updates
   - Webhook voor automatische updates

**Voordelen:**
- ✅ Volledige controle over data
- ✅ Real-time updates mogelijk
- ✅ Exclusieve deals mogelijk
- ✅ Geen tussenpersoon (geen affiliate fee)
- ✅ Directe relatie met leverancier

**Nadelen:**
- ❌ Veel werk (per leverancier contact)
- ❌ Niet alle leveranciers hebben API
- ❌ Contractonderhandelingen nodig

**Stappenplan:**
1. Maak lijst van alle Nederlandse energieleveranciers
2. Zoek contactgegevens (sales/marketing/partnerships)
3. Stuur partnership proposal
4. Onderhandel over commissie en API toegang
5. Implementeer technische integratie

---

### Optie B: EDSN (Energie Data Services Nederland) API

**Wat is EDSN:**
- Beheert IT-infrastructuur voor Nederlandse energiemarkt
- Biedt data services voor marktpartijen
- Mogelijk toegang tot contract/tarief data

**Hoe het werkt:**
1. Registreren als marktpartij (via Partners in Energie)
2. API toegang aanvragen bij EDSN
3. Real-time tarief/contract data ophalen

**Voordelen:**
- ✅ Centrale bron voor alle leveranciers
- ✅ Gestandaardiseerde API
- ✅ Real-time data

**Nadelen:**
- ❌ Mogelijk alleen voor geregistreerde marktpartijen
- ❌ Kosten onbekend
- ❌ Mogelijk niet beschikbaar voor vergelijkers

**Actie:**
- Contact opnemen met EDSN: sales@edsn.nl
- Vragen naar API voor contract/tarief data
- Vragen naar toegang voor energievergelijkers

---

### Optie C: ACM (Autoriteit Consument & Markt) Data

**Wat is ACM:**
- Toezichthouder energiemarkt
- Publiceert marktdata (mogelijk tarieven)

**Hoe het werkt:**
1. ACM publiceert mogelijk gemiddelde tarieven
2. Niet real-time, maar indicatief

**Voordelen:**
- ✅ Openbare data
- ✅ Gratis

**Nadelen:**
- ❌ Niet real-time
- ❌ Geen specifieke contract data
- ❌ Alleen gemiddelden

**Actie:**
- Check ACM website voor beschikbare data
- Niet geschikt voor exacte contract vergelijking

---

### Optie D: Handmatige Data Invoer (Huidige situatie)

**Hoe het werkt:**
1. Handmatig contracten invoeren in database
2. Regelmatig updates (wekelijks/maandelijks)
3. Leveranciers sturen updates via email/Excel

**Voordelen:**
- ✅ Volledige controle
- ✅ Geen API nodig
- ✅ Werkt altijd

**Nadelen:**
- ❌ Veel handwerk
- ❌ Niet real-time
- ❌ Foutgevoelig
- ❌ Schaalbaarheid probleem

**Verbetering:**
- Automatiseer waar mogelijk
- Excel import functionaliteit
- Leverancier portal voor self-service updates

---

## 3. Concrete Actieplan voor PakketAdvies

### Fase 1: Directe Leverancier Partnerships (Prioriteit 1)

**Stap 1: Maak leveranciers lijst**
```
- Vattenfall
- Eneco
- Essent
- Greenchoice
- Budget Energie
- Oxxio
- Pure Energie
- Vandebron
- Engie
- EDF
- ... (alle Nederlandse leveranciers)
```

**Stap 2: Zoek contactgegevens**
- Sales afdeling
- Marketing partnerships
- Business development
- API/technische contacten

**Stap 3: Stuur partnership proposal**
- Introductie PakketAdvies
- Aantal bezoekers/leads
- Partnership voorstel:
  - Vaste commissie per contract
  - API toegang voor real-time data
  - Marketing samenwerking
- Technische requirements

**Stap 4: Onderhandel contract**
- Commissie structuur
- API toegang
- Data format
- Update frequentie
- Exclusieve deals

**Stap 5: Implementeer integratie**
- API client per leverancier
- Data sync mechanisme
- Error handling
- Monitoring

---

### Fase 2: EDSN API Onderzoek (Prioriteit 2)

**Acties:**
1. ✅ Email naar EDSN sales (al gedaan)
2. Vraag specifiek naar:
   - Contract/tarief data API
   - Toegang voor energievergelijkers
   - Kosten en voorwaarden
   - Technische documentatie

**Als EDSN beschikbaar is:**
- Implementeer EDSN API client
- Sync alle leveranciers via één API
- Real-time updates

---

### Fase 3: Hybrid Model (Aanbevolen)

**Combineer:**
- **Grote leveranciers**: Directe partnerships + API
- **Middelgrote leveranciers**: Directe partnerships + data feed
- **Kleine leveranciers**: Handmatige invoer + Excel import

**Voordelen:**
- ✅ Volledige dekking
- ✅ Real-time waar mogelijk
- ✅ Flexibel model

---

## 4. Technische Implementatie

### API Integratie Structuur

```typescript
// src/lib/leveranciers/
├── api/
│   ├── vattenfall.ts
│   ├── eneco.ts
│   ├── essent.ts
│   └── base.ts (abstract class)
├── sync/
│   ├── sync-all.ts
│   └── sync-single.ts
└── types.ts
```

### Data Flow

```
Leverancier API/Feed
    ↓
API Client (per leverancier)
    ↓
Data Transformer (normalize format)
    ↓
Supabase Database
    ↓
Frontend (resultaten pagina)
```

### Database Schema (al aanwezig)

```sql
contracten (
  id, naam, type, leverancier_id, actief, ...
)

contract_details_vast (
  contract_id, tarief_elektriciteit, tarief_gas, ...
)

contract_details_dynamisch (
  contract_id, opslag_elektriciteit, opslag_gas, ...
)
```

---

## 5. Kosten & ROI Analyse

### Directe Partnerships
- **Setup kosten**: Tijd (contact leggen, onderhandelen)
- **Ongoing kosten**: API hosting, monitoring
- **Commissie**: Per contract (inkomsten)
- **ROI**: Positief (inkomsten > kosten)

### EDSN API
- **Setup kosten**: Registratie, implementatie
- **Ongoing kosten**: API subscription (onbekend)
- **ROI**: Afhankelijk van kosten

### Handmatig
- **Setup kosten**: Database setup
- **Ongoing kosten**: Tijd (handmatig invoeren)
- **ROI**: Negatief (veel tijd, geen schaalbaarheid)

---

## 6. Aanbevolen Aanpak voor PakketAdvies

### Korte termijn (0-3 maanden)
1. ✅ **Direct contact met top 10 leveranciers**
   - Vattenfall, Eneco, Essent, Greenchoice, Budget Energie, Oxxio, Pure Energie, Vandebron, Engie, EDF
   - Stuur partnership proposal
   - Onderhandel API toegang

2. ✅ **EDSN onderzoek**
   - Wacht op reactie van sales@edsn.nl
   - Vraag naar contract/tarief API

3. ✅ **Handmatige invoer verbeteren**
   - Excel import functionaliteit
   - Leverancier self-service portal (optioneel)

### Middellange termijn (3-6 maanden)
1. **API integraties implementeren**
   - Per leverancier die API biedt
   - Automatische sync (dagelijks/real-time)

2. **Uitbreiden naar alle leveranciers**
   - Alle Nederlandse leveranciers hebben partnership

3. **Monitoring & optimalisatie**
   - Data quality checks
   - Performance monitoring
   - Error handling

### Lange termijn (6-12 maanden)
1. **Real-time updates**
   - Webhooks van leveranciers
   - Instant contract updates

2. **Exclusieve deals**
   - Speciale aanbiedingen via partnerships
   - First-mover advantage

---

## 7. Concurrentie Analyse

### Wat doen minder.nl, gaslicht.com, pricewise anders?

**Minder.nl:**
- Focus op zakelijke markt
- Directe partnerships (geen affiliate)
- Gelijk bedrag van alle leveranciers (onafhankelijkheid)

**Gaslicht.com:**
- Particulier + zakelijk
- iDIN integratie (hebben jullie nu ook!)
- Directe partnerships

**Pricewise:**
- Focus particulier
- Real-time data (waarschijnlijk API)
- Directe partnerships

**Conclusie:**
- Alle grote spelers gebruiken **directe partnerships**
- **Geen** affiliate netwerken (Daisycon)
- **Real-time data** waar mogelijk
- **API integraties** voor automatisering

---

## 8. Concrete Next Steps

### Week 1-2: Leveranciers Contact
- [ ] Maak complete lijst Nederlandse energieleveranciers
- [ ] Zoek contactgegevens (sales/marketing/partnerships)
- [ ] Stuur partnership proposal email template
- [ ] Track responses

### Week 3-4: EDSN Follow-up
- [ ] Follow-up email naar EDSN
- [ ] Vraag specifiek naar contract/tarief API
- [ ] Plan meeting als mogelijk

### Week 5-8: API Implementatie
- [ ] Start met top 3 leveranciers die API bieden
- [ ] Implementeer API clients
- [ ] Test data sync
- [ ] Deploy naar productie

### Week 9-12: Uitbreiden
- [ ] Meer leveranciers toevoegen
- [ ] Automatiseer waar mogelijk
- [ ] Monitor data quality

---

## 9. Email Templates

### Partnership Proposal (Leverancier)

```
Onderwerp: Partnership Voorstel - PakketAdvies Energievergelijker

Beste [Leverancier] team,

Ik neem contact met u op namens PakketAdvies (pakketadvies.nl), 
een onafhankelijke energievergelijker voor zowel particulieren 
als zakelijke klanten in Nederland.

Wij zijn op zoek naar een directe partnership om uw 
energiecontracten te kunnen tonen op ons platform.

Ons voorstel:
- Directe partnership (geen affiliate netwerk)
- Vaste commissie per afgesloten contract
- API toegang voor real-time tarief/contract updates
- Transparante rapportage van leads en conversies

Wij bieden:
- [X] maandelijkse bezoekers
- [Y] leads per maand
- Focus op [particulier/zakelijk/both]
- iDIN integratie voor verbruiksdata
- Modern, gebruiksvriendelijk platform

Graag horen wij van u of dit interessant is en wanneer we 
kunnen bespreken hoe we dit kunnen vormgeven.

Met vriendelijke groet,
[Naam]
PakketAdvies
```

---

## 10. Conclusie

**Belangrijkste inzichten:**
1. ✅ Grote vergelijkers gebruiken **directe partnerships**, geen affiliate netwerken
2. ✅ **API integraties** zijn de norm voor real-time data
3. ✅ **EDSN** is mogelijk een centrale bron, maar moet onderzocht worden
4. ✅ **Handmatige invoer** is niet schaalbaar voor lange termijn

**Aanbevolen strategie:**
- **Start met directe leverancier partnerships** (top 10)
- **Onderzoek EDSN API** parallel
- **Implementeer API integraties** waar mogelijk
- **Hybrid model**: API + handmatig voor volledige dekking

**ROI:**
- Directe partnerships: **Positief** (inkomsten > kosten)
- EDSN API: **Onbekend** (afhankelijk van kosten)
- Handmatig: **Negatief** (veel tijd, niet schaalbaar)

**Tijdlijn:**
- **0-3 maanden**: Partnerships leggen, eerste API's
- **3-6 maanden**: Uitbreiden, automatiseren
- **6-12 maanden**: Volledige dekking, real-time updates

---

## 11. Resources

### Leveranciers Lijst (Top 20)
1. Vattenfall
2. Eneco
3. Essent
4. Greenchoice
5. Budget Energie
6. Oxxio
7. Pure Energie
8. Vandebron
9. Engie
10. EDF
11. E.ON
12. Nuon (Vattenfall)
13. NLE
14. Coolblue Energie
15. Welkom Energie
16. Powerpeers
17. EnergieFlex
18. Qurrent
19. HVC Energie
20. ... (check ACM voor complete lijst)

### Contact Bronnen
- **ACM**: Lijst van geregistreerde leveranciers
- **Leverancier websites**: Contact/sales pagina's
- **LinkedIn**: Sales/marketing managers
- **Energiebeurs**: Events/networking

### Technische Resources
- **EDSN**: sales@edsn.nl
- **ACM**: acm.nl (marktdata)
- **Energie Data Services**: Verschillende providers

---

**Laatste update**: 2025-01-XX
**Status**: Onderzoek compleet, klaar voor implementatie

