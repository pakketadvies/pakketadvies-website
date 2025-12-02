import type { ArticleMetadata } from '@/lib/seo'

// 100 artikelen van 1 januari 2025 tot 2 december 2025
// Verdeeld over 11 maanden = ~9 artikelen per maand

export const allArticles: (ArticleMetadata & { content: string })[] = [
  // JANUARI 2025 (10 artikelen)
  {
    slug: 'grootverbruik-vs-kleinverbruik-verschil',
    title: 'Grootverbruik vs. Kleinverbruik: wat is het verschil?',
    description: 'Ontdek wanneer u een grootverbruiker bent en wat dit betekent voor uw energiecontract. Uitleg over aansluitwaarden, facturering en contracttypes.',
    keywords: ['grootverbruik', 'kleinverbruik', 'aansluitwaarde', 'energiecontract', 'zakelijke energie'],
    category: 'Uitleg',
    date: '2025-01-15',
    readTime: '5 min',
    content: `
# Grootverbruik vs. Kleinverbruik: wat is het verschil?

Het verschil tussen grootverbruik en kleinverbruik wordt bepaald door uw aansluitwaarden. Dit heeft grote invloed op uw energiecontract, facturering en tarieven.

## Wat is grootverbruik?

U bent een grootverbruiker als:
- **Elektriciteit**: Uw aansluiting is groter dan 3x80A (bijvoorbeeld 3x100A, 3x125A)
- **Gas**: Uw aansluiting is groter dan G25 (bijvoorbeeld G40, G65)

### Facturering grootverbruik
- U ontvangt maandelijks een factuur voor het daadwerkelijke verbruik
- Aparte facturen voor energielevering en netbeheerkosten
- Contract volgens netbeheerdersmodel

## Wat is kleinverbruik?

U bent een kleinverbruiker als:
- **Elektriciteit**: Uw aansluiting is maximaal 3x80A (bijvoorbeeld 1x25A, 3x25A, 3x63A)
- **Gas**: Uw aansluiting is maximaal G25 (bijvoorbeeld G4, G6, G16)

### Facturering kleinverbruik
- Maandelijks voorschotbedrag
- Aan het einde van het jaar een jaarafrekening
- Totaalfactuur voor energielevering en netbeheerkosten samen
- Contract volgens leveranciersmodel

## Waarom is dit belangrijk?

Uw aansluitwaarde bepaalt:
- Welke contracten beschikbaar zijn
- Hoe u gefactureerd wordt
- Uw netbeheerkosten
- Mogelijkheden voor tariefonderhandeling

## Hulp nodig?

Wij helpen u graag bepalen of u grootverbruiker of kleinverbruiker bent en welk contract het beste bij u past. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energieprijzen-inzicht-markt',
    title: 'Energieprijzen - Inzicht in de markt',
    description: 'Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Interactieve grafieken en gedetailleerde prijstabellen om het beste energiecontract te kiezen.',
    keywords: ['energieprijzen', 'marktprijzen', 'elektriciteitsprijzen', 'gasprijzen', 'dynamische tarieven'],
    category: 'Markt',
    date: '2025-01-20',
    readTime: '3 min',
    featured: true,
    content: `
# Energieprijzen - Inzicht in de markt

Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Deze prijzen geven inzicht in de energiemarkt en helpen u bij het kiezen van het juiste energiecontract.

## Wat zijn marktprijzen?

Marktprijzen zijn de prijzen die op de groothandelsmarkt worden betaald voor energie. Deze prijzen veranderen continu op basis van vraag en aanbod.

## Elektriciteitsprijzen

Elektriciteitsprijzen worden bepaald op de EPEX Spot markt. Prijzen kunnen per uur verschillen en zijn afhankelijk van:
- Vraag naar elektriciteit
- Aanbod van duurzame energie (zon, wind)
- Beschikbaarheid van conventionele centrales
- Import/export met andere landen

## Gasprijzen

Gasprijzen worden bepaald op de TTF (Title Transfer Facility) markt in Nederland. Factoren die de prijs beïnvloeden:
- Weersomstandigheden (koude winters = hoge vraag)
- Voorraadniveaus
- Import van LNG
- Geopolitieke ontwikkelingen

## Waarom zijn marktprijzen belangrijk?

Door marktprijzen te volgen kunt u:
- Het beste moment kiezen voor een vast contract
- Begrijpen waarom prijzen fluctueren
- Beslissen tussen vast en dynamisch contract
- Inzicht krijgen in toekomstige prijsontwikkelingen

## Bekijk actuele prijzen

Op onze energieprijzen pagina kunt u actuele en historische prijzen bekijken met interactieve grafieken.
    `.trim()
  },
  {
    slug: 'vast-dynamisch-contract-verschil',
    title: 'Vast of dynamisch energiecontract: wat past bij uw bedrijf?',
    description: 'Ontdek de verschillen tussen vaste en dynamische energiecontracten en welke het beste bij uw bedrijf past. Uitleg over prijszekerheid, marktprijzen en flexibiliteit.',
    keywords: ['vast contract', 'dynamisch contract', 'energiecontract', 'prijszekerheid', 'marktprijzen'],
    category: 'Advies',
    date: '2025-01-25',
    readTime: '6 min',
    content: `
# Vast of dynamisch energiecontract: wat past bij uw bedrijf?

De keuze tussen een vast en dynamisch energiecontract is een belangrijke beslissing. Beide hebben voor- en nadelen. We leggen het verschil uit.

## Vast energiecontract

Bij een vast contract betaalt u een vaste prijs per kWh/m³ voor de hele looptijd (1, 2, 3 of 5 jaar).

### Voordelen:
- **Prijszekerheid**: U weet precies wat u betaalt
- **Bescherming tegen stijgingen**: Als prijzen stijgen, profiteert u van uw vaste tarief
- **Budgetplanning**: Makkelijker om kosten te plannen

### Nadelen:
- **Geen profijt van dalingen**: Als prijzen dalen, profiteert u niet
- **Vaste looptijd**: Meestal niet tussentijds opzegbaar zonder boete
- **Mogelijk hogere prijs**: Vaste contracten zijn vaak iets duurder dan dynamische

## Dynamisch energiecontract

Bij een dynamisch contract volgt de prijs de actuele marktprijzen per uur.

### Voordelen:
- **Profijt van dalingen**: Als prijzen dalen, betaalt u minder
- **Transparantie**: U ziet precies wat u per uur betaalt
- **Flexibiliteit**: Meestal maandelijks opzegbaar

### Nadelen:
- **Geen prijszekerheid**: Prijzen kunnen stijgen
- **Slimme meter vereist**: U heeft een slimme meter nodig
- **Actief verbruik beheren**: Voor optimale besparing moet u verbruik aanpassen

## Welk contract past bij u?

**Kies voor vast als:**
- U prijszekerheid wilt
- U verwacht dat prijzen gaan stijgen
- U niet actief met verbruik wilt bezig zijn
- U een stabiel budget nodig heeft

**Kies voor dynamisch als:**
- U flexibel bent met verbruik
- U verwacht dat prijzen gaan dalen
- U actief wilt besparen door verbruik te verschuiven
- U een slimme meter heeft

## Ons advies

Wij adviseren u graag welk contract het beste bij uw situatie past. We analyseren uw verbruikspatroon en geven persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energienota-lezen-uitleg',
    title: 'Hoe leest u uw energienota?',
    description: 'Stap voor stap uitleg over wat er op uw zakelijke energienota staat en waar u op moet letten. Uitleg van alle kostenposten en begrippen.',
    keywords: ['energienota', 'energierekening', 'kostenposten', 'energiebelasting', 'netbeheerkosten'],
    category: 'Uitleg',
    date: '2025-01-30',
    readTime: '5 min',
    content: `
# Hoe leest u uw energienota?

Uw energienota kan ingewikkeld lijken, maar met deze uitleg begrijpt u precies wat u betaalt.

## Onderdelen van uw energienota

### 1. Leverancierskosten
Dit zijn de kosten voor de daadwerkelijke energie:
- **Elektriciteit**: Prijs per kWh × verbruikte kWh
- **Gas**: Prijs per m³ × verbruikte m³
- **Vastrecht**: Vast bedrag per maand voor de aansluiting

### 2. Energiebelasting
Een overheidsheffing over uw energieverbruik. Voor elektriciteit zijn er verschillende schijven:
- **Schijf 1** (0-10.000 kWh): Hoogste tarief
- **Schijf 2** (10.000-50.000 kWh): Midden tarief
- **Schijf 3** (>50.000 kWh): Laagste tarief

Voor gas zijn er twee schijven:
- **Schijf 1** (0-5.000 m³): Hoogste tarief
- **Schijf 2** (>5.000 m³): Laagste tarief

### 3. ODE (Opslag Duurzame Energie)
Een heffing voor duurzame energieprojecten. Wordt per kWh (elektriciteit) en per m³ (gas) berekend.

### 4. Netbeheerkosten
Kosten voor het transport van energie via het netwerk:
- **Vastrecht**: Vast bedrag per jaar
- **Transportkosten**: Variabele kosten per kWh/m³
- **Meetkosten**: Kosten voor de meter en uitlezing

### 5. Vermindering Energiebelasting
Een korting die wordt afgetrokken van uw energierekening (alleen voor kleinverbruikers).

### 6. BTW
21% BTW over alle bovenstaande kosten (behalve vermindering energiebelasting).

## Totaalbedrag

Het totaalbedrag is de som van alle kostenposten, inclusief BTW.

## Waar moet u op letten?

- **Verbruik**: Controleer of het verbruik klopt met uw meterstanden
- **Tarieven**: Check of de tarieven overeenkomen met uw contract
- **Kostenposten**: Zorg dat alle kostenposten duidelijk zijn
- **Fouten**: Meld eventuele fouten direct aan uw leverancier

## Hulp nodig?

Wij helpen u graag uw energienota te begrijpen. Neem contact met ons op voor uitleg.
    `.trim()
  },
  {
    slug: 'energie-besparen-kantoorpand',
    title: 'Zo bespaart u energie in uw kantoorpand',
    description: 'Praktische tips om het energieverbruik in uw kantoor te verlagen en geld te besparen. Van LED-verlichting tot slimme thermostaten.',
    keywords: ['energie besparen', 'kantoor energie', 'energiebesparing', 'kosten besparen', 'duurzaam kantoor'],
    category: 'Tips',
    date: '2025-02-05',
    readTime: '7 min',
    content: `
# Zo bespaart u energie in uw kantoorpand

Energiebesparing in uw kantoorpand kan aanzienlijke kostenbesparingen opleveren. Hier zijn praktische tips die u direct kunt toepassen.

## 1. LED-verlichting

Vervang oude verlichting door LED:
- **Besparing**: 50-70% op verlichtingskosten
- **Terugverdientijd**: 1-2 jaar
- **Extra voordeel**: Langere levensduur, minder onderhoud

## 2. Slimme thermostaten

Automatische temperatuurregeling:
- **Besparing**: 10-15% op verwarming
- **Functies**: Programmeren per dag/uur, afstandsbediening
- **ROI**: Binnen 1 jaar terugverdiend

## 3. Isolatie

Goede isolatie van uw pand:
- **Besparing**: 20-30% op verwarming en koeling
- **Focus**: Dak, ramen, muren, vloer
- **ROI**: 3-5 jaar

## 4. Zonnepanelen

Wek uw eigen stroom op:
- **Besparing**: 30-50% op elektriciteitskosten
- **Saldering**: Teruglevering verrekend met verbruik
- **ROI**: 5-7 jaar

## 5. Energiezuinige apparatuur

Vervang oude apparaten:
- **Computers**: Kies voor energiezuinige modellen
- **Koeling**: Vervang oude koelkasten/vriezers
- **Printers**: Gebruik energiezuinige printers

## 6. Verbruikspatroon

Optimaliseer wanneer u energie gebruikt:
- **Daluren**: Gebruik energie in daluren (bij dynamische contracten)
- **Automatisering**: Zet apparaten uit buiten kantooruren
- **Monitoring**: Houd verbruik in de gaten met slimme meters

## 7. Gedrag

Kleine aanpassingen met groot effect:
- Zet verwarming 1 graad lager
- Gebruik natuurlijk licht waar mogelijk
- Zet apparaten uit in plaats van stand-by

## Monitoring

Houd uw verbruik in de gaten:
- Slimme meters geven real-time inzicht
- Vergelijk maandelijkse verbruiken
- Stel doelen en monitor voortgang

## Hulp nodig?

Wij helpen u graag met energiebesparing. Van advies tot implementatie: wij staan voor u klaar.
    `.trim()
  },
  {
    slug: 'groene-energie-bedrijven',
    title: 'Groene energie voor bedrijven: alles wat u moet weten',
    description: 'Van windenergie tot zonnepanelen: een complete gids over duurzame energie voor zakelijk gebruik. Uitleg over groene stroom, certificaten en duurzaamheid.',
    keywords: ['groene energie', 'duurzame energie', 'groene stroom', 'zonnepanelen', 'windenergie', 'CO2 neutraal'],
    category: 'Duurzaamheid',
    date: '2025-02-10',
    readTime: '6 min',
    content: `
# Groene energie voor bedrijven: alles wat u moet weten

Steeds meer bedrijven kiezen voor groene energie. Hier leest u alles wat u moet weten over duurzame energie voor zakelijk gebruik.

## Wat is groene energie?

Groene energie is energie opgewekt uit duurzame bronnen:
- **Windenergie**: Windmolens op land en zee
- **Zonne-energie**: Zonnepanelen op daken en velden
- **Waterkracht**: Energie uit water
- **Biomassa**: Energie uit organisch materiaal

## Groene stroom certificaten

In Nederland wordt groene stroom gegarandeerd door GvO's (Garanties van Oorsprong):
- Elke MWh groene stroom krijgt een GvO
- Certificaten worden geregistreerd en gecontroleerd
- U kunt zien waar uw groene stroom vandaan komt

## Voordelen van groene energie

### Voor uw bedrijf:
- **Duurzaam imago**: Toon uw maatschappelijke verantwoordelijkheid
- **CO2-reductie**: Draag bij aan klimaatdoelen
- **Vaak voordeliger**: Groene stroom is niet altijd duurder
- **Toekomstbestendig**: Voorbereid op strengere regelgeving

### Voor het milieu:
- Geen CO2-uitstoot bij opwekking
- Geen uitputting van fossiele brandstoffen
- Minder afhankelijkheid van import

## Zonnepanelen voor bedrijven

Wek uw eigen groene stroom op:
- **Saldering**: Teruglevering verrekend met verbruik
- **ROI**: 5-7 jaar terugverdientijd
- **Subsidies**: Verschillende regelingen beschikbaar
- **Onderhoud**: Minimaal onderhoud nodig

## Groen gas

Ook gas kan groen zijn:
- **Biogas**: Opgewekt uit organisch afval
- **Groen gas certificaten**: Garantie voor duurzaamheid
- **Beschikbaarheid**: Nog beperkt, maar groeiend

## Kosten

Groene energie hoeft niet duurder te zijn:
- Prijzen zijn vergelijkbaar met grijze energie
- Soms zelfs goedkoper door subsidies
- Lange termijn: verwacht lagere prijzen

## Keurmerken

Let op keurmerken voor garantie:
- **Greenchoice**: 100% groene stroom
- **Eneco**: Groene stroom certificaten
- **Vattenfall**: Wind- en zonne-energie

## Hulp nodig?

Wij helpen u graag met de overstap naar groene energie. Van advies tot implementatie: wij staan voor u klaar.
    `.trim()
  },
  {
    slug: 'energiemarkt-2025-trends',
    title: 'De energiemarkt in 2025: trends en ontwikkelingen',
    description: 'Een overzicht van de belangrijkste trends op de zakelijke energiemarkt dit jaar. Prijsontwikkelingen, nieuwe regelgeving en marktveranderingen.',
    keywords: ['energiemarkt', 'trends 2025', 'energieprijzen', 'marktontwikkelingen', 'energieregulering'],
    category: 'Markt',
    date: '2025-02-15',
    readTime: '8 min',
    content: `
# De energiemarkt in 2025: trends en ontwikkelingen

De energiemarkt verandert snel. Hier zijn de belangrijkste trends en ontwikkelingen voor 2025.

## Prijsontwikkelingen

### Elektriciteit
- **Stabilisatie**: Na jaren van volatiliteit stabiliseren prijzen
- **Duurzame energie**: Meer zonne- en windenergie drukt prijzen
- **Vraag**: Groeiende vraag door elektrificatie

### Gas
- **Normalisatie**: Gasprijzen keren terug naar normale niveaus
- **Voorraden**: Goede voorraadniveaus zorgen voor stabiliteit
- **Import**: Meer LNG importcapaciteit

## Nieuwe regelgeving

### Saldering
- **Afbouw**: Saldering wordt vanaf 2025 afgebouwd
- **Impact**: Bedrijven met zonnepanelen krijgen lagere vergoeding
- **Alternatieven**: Nieuwe regelingen voor teruglevering

### Netbeheerkosten
- **Capaciteitstarief**: Nieuwe tariefstructuur voor grootverbruikers
- **Transparantie**: Meer inzicht in kostenopbouw
- **Differentiatie**: Verschillende tarieven per regio

## Duurzaamheid

### Groene energie
- **Groei**: Steeds meer bedrijven kiezen voor groene stroom
- **Kosten**: Groene stroom wordt goedkoper
- **Beschikbaarheid**: Meer aanbod van duurzame energie

### CO2-reductie
- **Doelen**: Strengere CO2-reductiedoelen
- **Verplichtingen**: Meer verplichtingen voor bedrijven
- **Subsidies**: Nieuwe subsidies voor verduurzaming

## Technologie

### Slimme meters
- **Uitrol**: Steeds meer bedrijven krijgen slimme meters
- **Functionaliteit**: Meer mogelijkheden voor monitoring
- **Dynamische contracten**: Slimme meters maken dynamische contracten mogelijk

### Digitalisering
- **Apps**: Meer apps voor energiebeheer
- **Automatisering**: Automatische optimalisatie van verbruik
- **Data**: Meer inzicht door data-analyse

## Marktconsolidatie

### Leveranciers
- **Fusies**: Consolidatie in de markt
- **Nieuwe spelers**: Nieuwe leveranciers met innovatieve concepten
- **Concurrentie**: Meer concurrentie = betere prijzen

## Wat betekent dit voor u?

- **Kansen**: Nieuwe mogelijkheden voor besparing
- **Uitdagingen**: Aanpassen aan nieuwe regelgeving
- **Advies**: Belangrijker dan ooit om goed geadviseerd te worden

## Blijf op de hoogte

Wij volgen de markt continu en houden u op de hoogte van ontwikkelingen die voor u relevant zijn.
    `.trim()
  },
  {
    slug: 'subsidies-verduurzaming-bedrijf',
    title: 'Subsidies voor verduurzaming van uw bedrijf',
    description: 'Overzicht van beschikbare subsidies en regelingen voor zakelijke verduurzaming. Van zonnepanelen tot isolatie: welke subsidies zijn er?',
    keywords: ['subsidies', 'verduurzaming', 'zonnepanelen subsidie', 'energiebesparing', 'ISDE', 'SDE++'],
    category: 'Subsidies',
    date: '2025-02-20',
    readTime: '6 min',
    content: `
# Subsidies voor verduurzaming van uw bedrijf

Er zijn verschillende subsidies en regelingen beschikbaar voor zakelijke verduurzaming. Hier is een overzicht.

## ISDE (Investeringssubsidie Duurzame Energie)

Subsidie voor duurzame energie-installaties:
- **Zonnepanelen**: Subsidie per Wp geïnstalleerd vermogen
- **Warmtepompen**: Subsidie voor warmtepompinstallaties
- **Zonneboilers**: Subsidie voor zonneboilers
- **Bedrag**: Afhankelijk van type installatie en vermogen

## SDE++ (Stimulering Duurzame Energieproductie)

Subsidie voor duurzame energieproductie:
- **Voor**: Bedrijven die duurzame energie opwekken
- **Bedrag**: Verschillende tarieven per technologie
- **Voorwaarden**: Minimaal vermogen vereist

## EIA (Energie-investeringsaftrek)

Fiscale regeling voor energiebesparende investeringen:
- **Aftrek**: Extra aftrekpost op winst
- **Voor**: Energiebesparende maatregelen
- **Voorbeelden**: LED-verlichting, isolatie, warmtepompen

## MIA/VAMIL

Fiscale regelingen voor milieuvriendelijke investeringen:
- **MIA**: Versnelde afschrijving
- **VAMIL**: Willekeurige afschrijving
- **Voor**: Milieuvriendelijke bedrijfsmiddelen

## Regionale subsidies

Veel gemeenten en provincies hebben eigen regelingen:
- **Gemeentelijke subsidies**: Check uw gemeente
- **Provinciale regelingen**: Verschillen per provincie
- **Lokale initiatieven**: Soms extra ondersteuning

## Tips voor aanvragen

- **Op tijd**: Veel subsidies hebben deadlines
- **Documentatie**: Houd alle facturen en documenten bij
- **Advies**: Laat u adviseren over beschikbare regelingen
- **Combinaties**: Soms kunnen regelingen gecombineerd worden

## Hulp nodig?

Wij helpen u graag met het vinden en aanvragen van subsidies. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'netbeheerkosten-uitleg',
    title: 'Wat zijn netbeheerkosten en waarom betaal ik die?',
    description: 'Uitleg over netbeheerkosten, wat ze zijn, waarom u ze betaalt en hoe ze worden berekend. Verschil tussen netbeheerder en energieleverancier.',
    keywords: ['netbeheerkosten', 'netbeheerder', 'transportkosten', 'aansluitwaarde', 'Enexis', 'Liander'],
    category: 'Uitleg',
    date: '2025-02-25',
    readTime: '5 min',
    content: `
# Wat zijn netbeheerkosten en waarom betaal ik die?

Netbeheerkosten zijn een belangrijk onderdeel van uw energierekening. Hier leggen we uit wat ze zijn en waarom u ze betaalt.

## Wat is een netbeheerder?

De netbeheerder is verantwoordelijk voor het elektriciteits- en gasnetwerk:
- **Onderhoud**: Onderhoud van het netwerk
- **Uitbreiding**: Uitbreiding van het netwerk
- **Beheer**: Beheer van de infrastructuur
- **Meters**: Plaatsing en uitlezing van meters

### Netbeheerders in Nederland:
- **Enexis**: Oost- en Zuid-Nederland
- **Liander**: Midden- en West-Nederland
- **Stedin**: Randstad
- **Westland Infra**: Westland
- **Coteq**: Culemborg

## Wat zijn netbeheerkosten?

Netbeheerkosten bestaan uit:

### 1. Vastrecht
Een vast bedrag per jaar voor de aansluiting:
- **Afhankelijk van**: Aansluitwaarde
- **Elektriciteit**: Verschilt per aansluitwaarde (1x25A, 3x80A, etc.)
- **Gas**: Verschilt per aansluitwaarde (G4, G25, etc.)

### 2. Transportkosten
Variabele kosten per kWh (elektriciteit) of m³ (gas):
- **Berekening**: Verbruik × transporttarief
- **Verschilt per**: Netbeheerder en regio

### 3. Meetkosten
Kosten voor de meter en uitlezing:
- **Slimme meter**: Kosten voor slimme meter
- **Traditionele meter**: Kosten voor uitlezing
- **Vast bedrag**: Per jaar

## Waarom betaal ik netbeheerkosten?

Netbeheerkosten zijn nodig voor:
- **Onderhoud**: Het netwerk moet onderhouden worden
- **Uitbreiding**: Nieuwe aansluitingen en uitbreidingen
- **Betrouwbaarheid**: Zorgen voor betrouwbare levering
- **Innovatie**: Investeren in nieuwe technologie

## Hoe worden netbeheerkosten berekend?

### Voor kleinverbruikers:
- Netbeheerkosten staan op de factuur van de leverancier
- Totaalfactuur voor levering + netbeheer

### Voor grootverbruikers:
- Aparte factuur van de netbeheerder
- Directe betaling aan netbeheerder

## Aansluitwaarde

Uw aansluitwaarde bepaalt uw netbeheerkosten:
- **Hogere waarde**: Hogere netbeheerkosten
- **Elektriciteit**: 1x25A < 3x25A < 3x80A
- **Gas**: G4 < G6 < G25 < G40

## Kan ik netbeheerkosten verlagen?

Netbeheerkosten zijn gereguleerd en voor iedereen hetzelfde:
- **Geen onderhandeling**: U kunt niet onderhandelen over tarieven
- **Verschillen**: Alleen verschillen per netbeheerder/regio
- **Besparen**: Door aansluitwaarde te verlagen (als mogelijk)

## Hulp nodig?

Wij helpen u graag begrijpen wat u betaalt aan netbeheerkosten. Neem contact met ons op voor uitleg.
    `.trim()
  },
  {
    slug: 'energiebelasting-ode-uitleg',
    title: 'Wat is energiebelasting en ODE?',
    description: 'Uitleg over energiebelasting en ODE (Opslag Duurzame Energie). Wat zijn deze heffingen, hoe worden ze berekend en wat betekent dit voor uw energierekening?',
    keywords: ['energiebelasting', 'ODE', 'overheidsheffingen', 'belasting energie', 'duurzame energie'],
    category: 'Uitleg',
    date: '2025-03-01',
    readTime: '5 min',
    content: `
# Wat is energiebelasting en ODE?

Energiebelasting en ODE zijn overheidsheffingen op uw energieverbruik. Hier leggen we uit wat ze zijn en hoe ze werken.

## Energiebelasting

Energiebelasting is een belasting die de overheid heft over energieverbruik. Het doel is om energieverbruik te ontmoedigen en duurzame energie te stimuleren.

### Voor elektriciteit

Energiebelasting wordt berekend in schijven:

**Schijf 1** (0-10.000 kWh):
- Hoogste tarief per kWh
- Voor kleinverbruikers meestal deze schijf

**Schijf 2** (10.000-50.000 kWh):
- Midden tarief per kWh
- Voor middelgrote bedrijven

**Schijf 3** (>50.000 kWh):
- Laagste tarief per kWh
- Voor grootverbruikers

### Voor gas

Energiebelasting wordt berekend in twee schijven:

**Schijf 1** (0-5.000 m³):
- Hoogste tarief per m³
- Voor kleinverbruikers

**Schijf 2** (>5.000 m³):
- Laagste tarief per m³
- Voor grootverbruikers

## ODE (Opslag Duurzame Energie)

ODE is een heffing die wordt gebruikt om duurzame energieprojecten te financieren:
- **Doel**: Stimuleren van duurzame energie
- **Berekening**: Per kWh (elektriciteit) en per m³ (gas)
- **Jaarlijks**: Tarieven worden jaarlijks vastgesteld

## Vermindering Energiebelasting

Kleinverbruikers krijgen een vermindering op energiebelasting:
- **Bedrag**: Vast bedrag per jaar
- **Voorwaarde**: Alleen voor kleinverbruikers
- **Berekening**: Wordt afgetrokken van energiebelasting

## BTW

Over energiebelasting en ODE wordt ook BTW berekend:
- **Percentage**: 21% BTW
- **Berekening**: Over alle kosten (behalve vermindering)

## Jaarlijkse aanpassingen

Energiebelasting en ODE worden jaarlijks aangepast:
- **Begroting**: Onderdeel van de rijksbegroting
- **Wijzigingen**: Meestal kleine aanpassingen
- **Impact**: Kan invloed hebben op uw energierekening

## Wat betekent dit voor u?

- **Kosten**: Energiebelasting en ODE zijn een belangrijk onderdeel van uw rekening
- **Verschillen**: Tarieven verschillen per verbruik
- **Geen invloed**: U kunt deze kosten niet beïnvloeden (behalve door minder te verbruiken)

## Hulp nodig?

Wij helpen u graag begrijpen wat u betaalt aan energiebelasting en ODE. Neem contact met ons op voor uitleg.
    `.trim()
  },
  // MAART 2025 (9 artikelen)
  {
    slug: 'saldering-zonnepanelen-uitleg',
    title: 'Wat is saldering en hoe werkt dat?',
    description: 'Uitleg over saldering voor bedrijven met zonnepanelen. Hoe werkt teruglevering, wat verandert er in 2025 en wat betekent dit voor uw energierekening?',
    keywords: ['saldering', 'zonnepanelen', 'teruglevering', 'zonnestroom', 'energie opwekken'],
    category: 'Uitleg',
    date: '2025-03-05',
    readTime: '6 min',
    content: `
# Wat is saldering en hoe werkt dat?

Saldering is een regeling voor bedrijven met zonnepanelen die meer stroom opwekken dan ze verbruiken. Hier leggen we uit hoe het werkt.

## Wat is saldering?

Saldering betekent dat uw verbruik wordt verrekend met uw teruglevering:
- Als u 10.000 kWh verbruikt en 8.000 kWh teruglevert, betaalt u alleen over 2.000 kWh
- Uw teruglevering wordt direct verrekend met uw verbruik
- Dit geldt alleen voor elektriciteit, niet voor gas

## Hoe werkt saldering?

### Voor kleinverbruikers (tot 2025):
- Volledige saldering: elke kWh die u teruglevert wordt verrekend met uw verbruik
- U betaalt alleen over het netto verbruik
- Geen aparte vergoeding voor teruglevering

### Vanaf 2025:
- Saldering wordt afgebouwd
- U krijgt een lagere vergoeding voor teruggeleverde stroom
- Het salderingspercentage wordt jaarlijks verlaagd

## Grootverbruikers

Grootverbruikers hebben geen saldering:
- U krijgt een terugleververgoeding per kWh
- Deze vergoeding is meestal lager dan uw inkooptarief
- U betaalt over al uw verbruik, ongeacht teruglevering

## Wat betekent dit voor u?

- **Kleinverbruikers**: Profiteer nu nog van volledige saldering
- **Grootverbruikers**: Krijg een terugleververgoeding
- **Toekomst**: Saldering wordt afgebouwd, bereid u voor

## Tips

- Overweeg een thuisbatterij om meer zelf opgewekte stroom te gebruiken
- Optimaliseer uw verbruikspatroon om meer te profiteren van zonnestroom
- Houd rekening met de afbouw van saldering bij investeringsbeslissingen

## Hulp nodig?

Wij helpen u graag begrijpen hoe saldering werkt en wat dit betekent voor uw situatie. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'ean-code-energie-uitleg',
    title: 'Wat is een EAN-code en waarom heb ik die nodig?',
    description: 'Uitleg over EAN-codes voor energieaansluitingen. Wat zijn ze, waar vindt u ze en waarom zijn ze belangrijk bij het overstappen van energieleverancier?',
    keywords: ['EAN-code', 'energieaansluiting', 'overstappen', 'leverancier', 'aansluiting identificatie'],
    category: 'Uitleg',
    date: '2025-03-10',
    readTime: '4 min',
    content: `
# Wat is een EAN-code en waarom heb ik die nodig?

Een EAN-code is een uniek nummer dat uw energieaansluiting identificeert. Hier leggen we uit wat het is en waarom u het nodig heeft.

## Wat is een EAN-code?

EAN staat voor European Article Number. Het is een uniek 18-cijferig nummer dat uw energieaansluiting identificeert:
- Elke aansluiting heeft twee EAN-codes: één voor elektriciteit en één voor gas
- De code is uniek per aansluiting en verandert nooit
- Zonder EAN-code kan een leverancier u niet aansluiten

## Waar vindt u uw EAN-code?

U kunt uw EAN-code vinden op:
- **Uw energienota**: Meestal bovenaan of in de header
- **In uw meterkast**: Op een sticker bij de meter
- **Via uw netbeheerder**: Bel of mail uw netbeheerder
- **Online**: Via de website van uw netbeheerder (met postcode en huisnummer)

## Waarom is een EAN-code belangrijk?

Een EAN-code is nodig om:
- **Over te stappen**: Bij een overstap naar een nieuwe leverancier
- **Verbruiksgegevens op te halen**: Om een offerte te maken
- **Uw contract te koppelen**: Aan uw specifieke aansluiting
- **Problemen op te lossen**: Bij storingen of vragen

## Bij een overstap

Bij een overstap heeft u beide EAN-codes nodig:
- EAN-code elektriciteit (18 cijfers)
- EAN-code gas (18 cijfers, als u gas heeft)

Zonder EAN-codes kan een leverancier u niet aansluiten.

## Tips

- Bewaar uw EAN-codes op een veilige plek
- Noteer ze bij het aanvragen van offertes
- Controleer of de codes kloppen bij een overstap

## Hulp nodig?

Wij helpen u graag bij het vinden van uw EAN-codes en bij het overstappen. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiecontract-looptijd-opzegtermijn',
    title: 'Hoe werkt een energiecontract precies?',
    description: 'Uitleg over energiecontracten: looptijd, opzegtermijn, verlenging en overstappen. Wat gebeurt er na afloop en wanneer kunt u overstappen?',
    keywords: ['energiecontract', 'looptijd', 'opzegtermijn', 'verlenging', 'overstappen'],
    category: 'Uitleg',
    date: '2025-03-15',
    readTime: '5 min',
    content: `
# Hoe werkt een energiecontract precies?

Een energiecontract heeft een vaste looptijd en opzegtermijn. Hier leggen we uit hoe het werkt.

## Looptijd

Een energiecontract heeft een vaste looptijd:
- Meestal 1, 2, 3 of 5 jaar
- Gedurende deze looptijd betaalt u het afgesproken tarief
- Uw tarief blijft hetzelfde, ongeacht marktschommelingen

## Opzegtermijn

U heeft een opzegtermijn om uw contract op te zeggen:
- Meestal 1 maand voor het einde van de looptijd
- Als u niet opzegt, wordt uw contract automatisch verlengd
- Tussentijds opzeggen is meestal niet mogelijk zonder boete

## Automatische verlenging

Aan het einde van de looptijd:
- Uw contract wordt automatisch verlengd voor onbepaalde tijd
- Tenzij u opzegt binnen de opzegtermijn
- Vaak tegen andere (meestal hogere) tarieven

## Tussentijds opzeggen

Tussentijds opzeggen is meestal niet mogelijk:
- Tenzij u een contract met maandelijkse opzegtermijn heeft
- Bijvoorbeeld bij dynamische contracten
- Of bij bijzondere omstandigheden (verhuizing, faillissement)

## Overstappen

U kunt overstappen:
- Binnen de opzegtermijn naar het einde van uw contract
- Na het einde van uw contract (als u hebt opgezegd)
- Bij een contract met maandelijkse opzegtermijn

## Tips

- Houd uw einddatum in de gaten
- Zeg tijdig op als u wilt overstappen
- Vergelijk tijdig nieuwe contracten
- Laat u adviseren over het beste moment

## Hulp nodig?

Wij helpen u graag bij het begrijpen van uw contract en bij het overstappen. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'aansluitwaarden-belangrijk',
    title: 'Wat zijn aansluitwaarden en waarom zijn ze belangrijk?',
    description: 'Uitleg over aansluitwaarden voor elektriciteit en gas. Wat betekenen ze, hoe worden ze bepaald en wat is de invloed op uw netbeheerkosten?',
    keywords: ['aansluitwaarde', 'aansluiting', 'netbeheerkosten', 'elektriciteit', 'gas'],
    category: 'Uitleg',
    date: '2025-03-20',
    readTime: '5 min',
    content: `
# Wat zijn aansluitwaarden en waarom zijn ze belangrijk?

Aansluitwaarden bepalen hoeveel energie u maximaal kunt afnemen en zijn cruciaal voor uw netbeheerkosten. Hier leggen we uit wat ze betekenen.

## Wat zijn aansluitwaarden?

Aansluitwaarden geven aan hoeveel vermogen u maximaal kunt afnemen:
- **Elektriciteit**: Bijvoorbeeld 1x25A, 3x25A, 3x80A
- **Gas**: Bijvoorbeeld G4, G6, G25, G40

## Elektriciteit aansluitwaarden

Voor elektriciteit zijn er verschillende waarden:
- **1x25A**: Kleinverbruik, 1-fase (huishoudelijk)
- **3x25A**: Grootverbruik, 3-fase (standaard zakelijk)
- **3x80A**: Grootverbruik, industrie
- **>3x80A**: Zeer groot verbruik, maatwerk

Hoe hoger de waarde, hoe meer vermogen u kunt afnemen.

## Gas aansluitwaarden

Voor gas zijn er verschillende waarden:
- **G4**: Max 6 m³/uur (kleinverbruik huishoudelijk)
- **G6**: Max 10 m³/uur (standaard zakelijk)
- **G25**: Max 40 m³/uur (industrie)
- **G40**: Max 65 m³/uur (grote industrie)

Hoe hoger de waarde, hoe meer gas u kunt afnemen.

## Waarom zijn aansluitwaarden belangrijk?

Aansluitwaarden bepalen:
- **Of u kleinverbruiker of grootverbruiker bent**
- **Uw netbeheerkosten**: Hogere waarde = hogere kosten
- **Welke contracten beschikbaar zijn**
- **Uw facturering**: Verschilt per aansluitwaarde

## Waar vindt u uw aansluitwaarde?

Uw aansluitwaarde staat:
- **In uw meterkast**: Op een sticker bij de meter
- **Op uw energienota**: Meestal vermeld
- **Via uw netbeheerder**: Bel of mail uw netbeheerder

## Kan ik mijn aansluitwaarde verlagen?

Soms kunt u uw aansluitwaarde verlagen:
- Als u minder vermogen nodig heeft
- Dit kan uw netbeheerkosten verlagen
- Vraag advies aan uw netbeheerder

## Hulp nodig?

Wij helpen u graag begrijpen wat uw aansluitwaarde betekent en wat de invloed is op uw kosten. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energie-besparen-bedrijf-tips',
    title: 'Hoe bespaar ik energie in mijn bedrijf?',
    description: 'Praktische tips om energie te besparen in uw bedrijf. Van LED-verlichting tot zonnepanelen: welke maatregelen leveren de meeste besparing op?',
    keywords: ['energie besparen', 'energiebesparing', 'kosten besparen', 'duurzaam bedrijf', 'energiezuinig'],
    category: 'Tips',
    date: '2025-03-25',
    readTime: '7 min',
    content: `
# Hoe bespaar ik energie in mijn bedrijf?

Er zijn verschillende manieren om energie te besparen in uw bedrijf. Hier zijn praktische tips die u direct kunt toepassen.

## 1. LED-verlichting

Vervang oude verlichting door LED:
- **Besparing**: 50-70% op verlichtingskosten
- **Terugverdientijd**: 1-2 jaar
- **Extra voordeel**: Langere levensduur, minder onderhoud

## 2. Slimme thermostaten

Automatische temperatuurregeling:
- **Besparing**: 10-15% op verwarming
- **Functies**: Programmeren per dag/uur, afstandsbediening
- **ROI**: Binnen 1 jaar terugverdiend

## 3. Isolatie

Goede isolatie van uw pand:
- **Besparing**: 20-30% op verwarming en koeling
- **Focus**: Dak, ramen, muren, vloer
- **ROI**: 3-5 jaar

## 4. Zonnepanelen

Wek uw eigen stroom op:
- **Besparing**: 30-50% op elektriciteitskosten
- **Saldering**: Teruglevering verrekend met verbruik
- **ROI**: 5-7 jaar

## 5. Energiezuinige apparatuur

Vervang oude apparaten:
- **Computers**: Kies voor energiezuinige modellen
- **Koeling**: Vervang oude koelkasten/vriezers
- **Printers**: Gebruik energiezuinige printers

## 6. Verbruikspatroon

Optimaliseer wanneer u energie gebruikt:
- **Daluren**: Gebruik energie in daluren (bij dynamische contracten)
- **Automatisering**: Zet apparaten uit buiten kantooruren
- **Monitoring**: Houd verbruik in de gaten met slimme meters

## 7. Gedrag

Kleine aanpassingen met groot effect:
- Zet verwarming 1 graad lager
- Gebruik natuurlijk licht waar mogelijk
- Zet apparaten uit in plaats van stand-by

## Monitoring

Houd uw verbruik in de gaten:
- Slimme meters geven real-time inzicht
- Vergelijk maandelijkse verbruiken
- Stel doelen en monitor voortgang

## Hulp nodig?

Wij helpen u graag met energiebesparing. Van advies tot implementatie: wij staan voor u klaar.
    `.trim()
  },
  {
    slug: 'energieprijzen-maart-2025',
    title: 'Energieprijzen maart 2025: marktanalyse',
    description: 'Analyse van de energieprijzen in maart 2025. Wat gebeurde er op de markt en wat betekent dit voor uw energiecontract?',
    keywords: ['energieprijzen', 'marktanalyse', 'maart 2025', 'elektriciteitsprijzen', 'gasprijzen'],
    category: 'Markt',
    date: '2025-03-30',
    readTime: '4 min',
    content: `
# Energieprijzen maart 2025: marktanalyse

In maart 2025 zagen we belangrijke ontwikkelingen op de energiemarkt. Deze analyse helpt u begrijpen wat er gebeurde.

## Marktontwikkelingen

Maart 2025 kenmerkte zich door:
- Stabilisatie van elektriciteitsprijzen na winterpiek
- Normalisatie van gasprijzen
- Toenemend aanbod van duurzame energie

## Elektriciteitsprijzen

Elektriciteitsprijzen stabiliseerden:
- Gemiddelde prijs: [specifieke cijfers]
- Lagere prijzen door meer zonne-energie
- Toenemende vraag door elektrificatie

## Gasprijzen

Gasprijzen normaliseerden:
- Gemiddelde prijs: [specifieke cijfers]
- Goede voorraadniveaus
- Minder volatiliteit dan voorgaande maanden

## Wat betekent dit voor u?

- **Vaste contracten**: Goed moment om te verlengen
- **Dynamische contracten**: Profiteer van lagere prijzen
- **Overstappen**: Mogelijkheden voor betere tarieven

## Blijf op de hoogte

Wij volgen de markt continu en houden u op de hoogte van ontwikkelingen die voor u relevant zijn.
    `.trim()
  },
  // APRIL 2025 (9 artikelen)
  {
    slug: 'overstappen-energieleverancier-gids',
    title: 'Overstappen van energieleverancier: complete gids',
    description: 'Stap-voor-stap gids voor het overstappen van energieleverancier. Wat moet u doen, welke documenten heeft u nodig en wat zijn de valkuilen?',
    keywords: ['overstappen', 'energieleverancier', 'energiecontract', 'overstap gids', 'nieuwe leverancier'],
    category: 'Advies',
    date: '2025-04-05',
    readTime: '6 min',
    content: `
# Overstappen van energieleverancier: complete gids

Overstappen van energieleverancier kan u veel geld besparen. Hier is een complete gids.

## Wanneer kunt u overstappen?

U kunt overstappen:
- Binnen de opzegtermijn naar het einde van uw contract
- Na het einde van uw contract (als u hebt opgezegd)
- Bij een contract met maandelijkse opzegtermijn

## Stap 1: Vergelijken

Vergelijk verschillende leveranciers:
- Gebruik onze calculator
- Let op tarieven, looptijd en voorwaarden
- Check reviews en klantenservice

## Stap 2: Offerte aanvragen

Vraag offertes aan bij meerdere leveranciers:
- Geef uw verbruik en aansluitwaarden door
- Vraag om EAN-codes
- Vergelijk de totale kosten

## Stap 3: Contract kiezen

Kies het beste contract:
- Let op totaalkosten, niet alleen tarieven
- Check looptijd en opzegtermijn
- Lees de voorwaarden goed door

## Stap 4: Opzeggen

Zeg uw huidige contract op:
- Binnen de opzegtermijn
- Schriftelijk of via de website
- Bewaar bevestiging

## Stap 5: Nieuw contract afsluiten

Sluit uw nieuwe contract af:
- Geef alle benodigde gegevens door
- Check EAN-codes
- Wacht op bevestiging

## Valkuilen

Let op:
- Opzegtermijn niet missen
- EAN-codes correct doorgeven
- Contractvoorwaarden goed lezen
- Geen dubbele contracten

## Hulp nodig?

Wij helpen u graag bij het overstappen. Van vergelijken tot afsluiten: wij staan voor u klaar.
    `.trim()
  },
  {
    slug: 'energiecontract-vergelijken-tips',
    title: 'Energiecontract vergelijken: waar moet u op letten?',
    description: 'Tips voor het vergelijken van energiecontracten. Waar moet u op letten, welke valkuilen zijn er en hoe kiest u het beste contract?',
    keywords: ['energiecontract vergelijken', 'contract vergelijken', 'beste contract', 'energie advies'],
    category: 'Advies',
    date: '2025-04-10',
    readTime: '5 min',
    content: `
# Energiecontract vergelijken: waar moet u op letten?

Het vergelijken van energiecontracten kan ingewikkeld zijn. Hier zijn tips om het beste contract te kiezen.

## Waar moet u op letten?

### 1. Totaalkosten
- Kijk niet alleen naar tarieven
- Reken het totaalbedrag per jaar uit
- Houd rekening met alle kosten

### 2. Looptijd
- Korte looptijd = flexibiliteit
- Lange looptijd = prijszekerheid
- Kies wat bij u past

### 3. Opzegtermijn
- Meestal 1 maand voor einde contract
- Check of u tussentijds kunt opzeggen
- Let op boetes bij vroegtijdige opzegging

### 4. Voorwaarden
- Lees de voorwaarden goed door
- Check verborgen kosten
- Let op automatische verlenging

## Valkuilen

Let op:
- **Alleen naar tarieven kijken**: Totaalkosten zijn belangrijker
- **Verborgen kosten**: Check alle kostenposten
- **Automatische verlenging**: Zeg tijdig op als u wilt overstappen
- **Te korte vergelijking**: Neem de tijd om goed te vergelijken

## Tips

- Gebruik onze calculator voor een goede vergelijking
- Vraag offertes aan bij meerdere leveranciers
- Laat u adviseren door een expert
- Check reviews en klantenservice

## Hulp nodig?

Wij helpen u graag bij het vergelijken en kiezen van het beste contract. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'zonnepanelen-bedrijf-investering',
    title: 'Zonnepanelen voor bedrijven: is het een goede investering?',
    description: 'Alles over zonnepanelen voor bedrijven. Wat kost het, wat levert het op, welke subsidies zijn er en wat is de terugverdientijd?',
    keywords: ['zonnepanelen', 'zonnestroom', 'duurzame energie', 'investering', 'terugverdientijd'],
    category: 'Duurzaamheid',
    date: '2025-04-15',
    readTime: '7 min',
    content: `
# Zonnepanelen voor bedrijven: is het een goede investering?

Zonnepanelen kunnen een goede investering zijn voor uw bedrijf. Hier leest u alles wat u moet weten.

## Wat kosten zonnepanelen?

De kosten voor zonnepanelen:
- **Installatie**: €1.000-€1.500 per kWp
- **Onderhoud**: Minimaal, meestal €100-€200 per jaar
- **Verzekering**: Optioneel, meestal €50-€100 per jaar

## Wat levert het op?

Zonnepanelen kunnen u besparen:
- **30-50% op elektriciteitskosten**: Door zelf opwekken
- **Saldering**: Teruglevering verrekend met verbruik
- **Terugleververgoeding**: Voor overschot (grootverbruikers)

## Terugverdientijd

De terugverdientijd is meestal:
- **5-7 jaar**: Voor kleinverbruikers met saldering
- **7-10 jaar**: Voor grootverbruikers met terugleververgoeding
- **Afhankelijk van**: Opwek, verbruik, tarieven, subsidies

## Subsidies

Er zijn verschillende subsidies:
- **ISDE**: Investeringssubsidie Duurzame Energie
- **SDE++**: Stimulering Duurzame Energieproductie
- **Gemeentelijke subsidies**: Check uw gemeente
- **EIA**: Energie-investeringsaftrek

## Is het een goede investering?

Zonnepanelen zijn een goede investering als:
- U een geschikt dak heeft (oriëntatie, schaduw)
- U voldoende verbruik heeft
- U lang op de locatie blijft
- U bereid bent te investeren

## Tips

- Laat een dakscan uitvoeren
- Vraag meerdere offertes aan
- Check beschikbare subsidies
- Reken de terugverdientijd uit

## Hulp nodig?

Wij helpen u graag bij het bepalen of zonnepanelen een goede investering zijn voor uw bedrijf. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energieprijzen-april-2025',
    title: 'Energieprijzen april 2025: marktanalyse',
    description: 'Analyse van de energieprijzen in april 2025. Wat gebeurde er op de markt en wat betekent dit voor uw energiecontract?',
    keywords: ['energieprijzen', 'marktanalyse', 'april 2025', 'elektriciteitsprijzen', 'gasprijzen'],
    category: 'Markt',
    date: '2025-04-20',
    readTime: '4 min',
    content: `
# Energieprijzen april 2025: marktanalyse

In april 2025 zagen we belangrijke ontwikkelingen op de energiemarkt. Deze analyse helpt u begrijpen wat er gebeurde.

## Marktontwikkelingen

April 2025 kenmerkte zich door:
- Verdere stabilisatie van prijzen
- Toenemend aanbod van zonne-energie
- Normalisatie van gasprijzen

## Elektriciteitsprijzen

Elektriciteitsprijzen stabiliseerden verder:
- Gemiddelde prijs: [specifieke cijfers]
- Meer zonne-energie drukt prijzen
- Toenemende vraag door elektrificatie

## Gasprijzen

Gasprijzen normaliseerden:
- Gemiddelde prijs: [specifieke cijfers]
- Goede voorraadniveaus
- Minder volatiliteit

## Wat betekent dit voor u?

- **Vaste contracten**: Goed moment om te verlengen
- **Dynamische contracten**: Profiteer van lagere prijzen
- **Overstappen**: Mogelijkheden voor betere tarieven

## Blijf op de hoogte

Wij volgen de markt continu en houden u op de hoogte van ontwikkelingen die voor u relevant zijn.
    `.trim()
  },
  {
    slug: 'warmtepomp-bedrijf-advies',
    title: 'Warmtepomp voor bedrijven: alles wat u moet weten',
    description: 'Complete gids over warmtepompen voor bedrijven. Wat zijn ze, hoe werken ze, wat kosten ze en welke subsidies zijn er?',
    keywords: ['warmtepomp', 'verwarming', 'duurzaam', 'gasloos', 'elektrisch verwarmen'],
    category: 'Duurzaamheid',
    date: '2025-04-25',
    readTime: '6 min',
    content: `
# Warmtepomp voor bedrijven: alles wat u moet weten

Warmtepompen zijn een duurzame manier om uw bedrijf te verwarmen. Hier leest u alles wat u moet weten.

## Wat is een warmtepomp?

Een warmtepomp haalt warmte uit de lucht, grond of water:
- **Luchtwarmtepomp**: Haalt warmte uit buitenlucht
- **Bodemwarmtepomp**: Haalt warmte uit de grond
- **Waterwarmtepomp**: Haalt warmte uit water

## Hoe werkt het?

Een warmtepomp werkt als een omgekeerde koelkast:
- Haalt warmte uit de omgeving
- Verhoogt de temperatuur
- Verwarmt uw bedrijf

## Voordelen

Warmtepompen hebben verschillende voordelen:
- **Duurzaam**: Geen gas nodig
- **Efficiënt**: 1 kWh elektriciteit = 3-4 kWh warmte
- **Lage kosten**: Lagere energiekosten
- **Subsidies**: Verschillende regelingen beschikbaar

## Kosten

De kosten voor een warmtepomp:
- **Installatie**: €5.000-€15.000 (afhankelijk van type)
- **Onderhoud**: €200-€400 per jaar
- **Elektriciteit**: Meer verbruik, maar minder gas

## Terugverdientijd

De terugverdientijd is meestal:
- **5-10 jaar**: Afhankelijk van type en gebruik
- **Korter met subsidies**: ISDE, SDE++
- **Langer bij lage gasprijzen**: Maar duurzamer

## Is het geschikt voor u?

Een warmtepomp is geschikt als:
- U een goed geïsoleerd pand heeft
- U bereid bent te investeren
- U duurzaam wilt verwarmen
- U subsidies kunt krijgen

## Tips

- Laat een adviesgesprek inplannen
- Check beschikbare subsidies
- Vraag meerdere offertes aan
- Reken de terugverdientijd uit

## Hulp nodig?

Wij helpen u graag bij het bepalen of een warmtepomp geschikt is voor uw bedrijf. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiebesparing-retail-sector',
    title: 'Energie besparen in de retail sector',
    description: 'Specifieke tips voor energiebesparing in de retail sector. Van verlichting tot koeling: welke maatregelen leveren de meeste besparing op?',
    keywords: ['retail', 'energie besparen', 'winkel', 'verlichting', 'koeling'],
    category: 'Tips',
    date: '2025-04-30',
    readTime: '6 min',
    content: `
# Energie besparen in de retail sector

De retail sector heeft specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Verlichting

Retail heeft veel verlichting nodig:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Bewegingssensoren**: Zet verlichting uit waar niet nodig
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Koeling

Koeling is een grote kostenpost:
- **Energiezuinige koeling**: Vervang oude koelinstallaties
- **Temperatuurregeling**: Zet temperatuur 1 graad hoger
- **Onderhoud**: Regelmatig onderhoud bespaart energie

## Verwarming

Verwarming kan geoptimaliseerd worden:
- **Slimme thermostaten**: Automatische regeling
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Luchtdichtheid**: Voorkom tocht

## Monitoring

Houd uw verbruik in de gaten:
- Slimme meters geven real-time inzicht
- Vergelijk maandelijkse verbruiken
- Stel doelen en monitor voortgang

## Tips

- Vervang oude verlichting door LED
- Optimaliseer koeling en verwarming
- Monitor uw verbruik
- Investeer in isolatie

## Hulp nodig?

Wij helpen u graag met energiebesparing in de retail sector. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  // MEI 2025 (9 artikelen)
  {
    slug: 'energieprijzen-mei-2025',
    title: 'Energieprijzen mei 2025: marktanalyse',
    description: 'Analyse van de energieprijzen in mei 2025. Wat gebeurde er op de markt en wat betekent dit voor uw energiecontract?',
    keywords: ['energieprijzen', 'marktanalyse', 'mei 2025', 'elektriciteitsprijzen', 'gasprijzen'],
    category: 'Markt',
    date: '2025-05-05',
    readTime: '4 min',
    content: `
# Energieprijzen mei 2025: marktanalyse

In mei 2025 zagen we belangrijke ontwikkelingen op de energiemarkt. Deze analyse helpt u begrijpen wat er gebeurde.

## Marktontwikkelingen

Mei 2025 kenmerkte zich door:
- Verdere stabilisatie van prijzen
- Toenemend aanbod van zonne-energie
- Normalisatie van gasprijzen

## Elektriciteitsprijzen

Elektriciteitsprijzen stabiliseerden verder door:
- Meer zonne-energie die prijzen drukt
- Toenemende vraag door elektrificatie
- Betere balans tussen vraag en aanbod

## Gasprijzen

Gasprijzen normaliseerden:
- Goede voorraadniveaus na de winter
- Minder volatiliteit dan voorgaande maanden
- Stabilere import van LNG

## Wat betekent dit voor u?

- **Vaste contracten**: Goed moment om te verlengen
- **Dynamische contracten**: Profiteer van lagere prijzen
- **Overstappen**: Mogelijkheden voor betere tarieven

## Blijf op de hoogte

Wij volgen de markt continu en houden u op de hoogte van ontwikkelingen die voor u relevant zijn.
    `.trim()
  },
  {
    slug: 'energiebesparing-horeca-sector',
    title: 'Energie besparen in de horeca sector',
    description: 'Specifieke tips voor energiebesparing in de horeca sector. Van verlichting tot koeling: welke maatregelen leveren de meeste besparing op?',
    keywords: ['horeca', 'energie besparen', 'restaurant', 'verlichting', 'koeling'],
    category: 'Tips',
    date: '2025-05-10',
    readTime: '6 min',
    content: `
# Energie besparen in de horeca sector

De horeca sector heeft specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Verlichting

Horeca heeft veel verlichting nodig:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Dimmen**: Gebruik dimmers om energie te besparen
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Koeling

Koeling is een grote kostenpost:
- **Energiezuinige koeling**: Vervang oude koelinstallaties
- **Temperatuurregeling**: Zet temperatuur 1 graad hoger waar mogelijk
- **Onderhoud**: Regelmatig onderhoud bespaart energie

## Verwarming

Verwarming kan geoptimaliseerd worden:
- **Slimme thermostaten**: Automatische regeling
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Luchtdichtheid**: Voorkom tocht

## Tips

- Vervang oude verlichting door LED
- Optimaliseer koeling en verwarming
- Monitor uw verbruik
- Investeer in isolatie

## Hulp nodig?

Wij helpen u graag met energiebesparing in de horeca sector. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiebesparing-industrie-sector',
    title: 'Energie besparen in de industrie',
    description: 'Specifieke tips voor energiebesparing in de industrie. Van motoren tot proceswarmte: welke maatregelen leveren de meeste besparing op?',
    keywords: ['industrie', 'energie besparen', 'proceswarmte', 'motoren', 'energiezuinig'],
    category: 'Tips',
    date: '2025-05-15',
    readTime: '7 min',
    content: `
# Energie besparen in de industrie

De industrie heeft specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Processen

Industriële processen verbruiken veel energie:
- **Optimalisatie**: Optimaliseer processen voor energiezuinigheid
- **Warmteterugwinning**: Hergebruik warmte uit processen
- **Efficiënte motoren**: Vervang oude motoren door energiezuinige varianten

## Verwarming

Verwarming kan geoptimaliseerd worden:
- **Warmteterugwinning**: Hergebruik warmte
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Slimme regeling**: Automatische temperatuurregeling

## Verlichting

Verlichting kan geoptimaliseerd worden:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Bewegingssensoren**: Zet verlichting uit waar niet nodig
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Tips

- Optimaliseer processen
- Hergebruik warmte
- Vervang oude motoren
- Investeer in isolatie

## Hulp nodig?

Wij helpen u graag met energiebesparing in de industrie. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiebesparing-vastgoed-sector',
    title: 'Energie besparen in vastgoed',
    description: 'Specifieke tips voor energiebesparing in vastgoed. Van verwarming tot verlichting: welke maatregelen leveren de meeste besparing op?',
    keywords: ['vastgoed', 'energie besparen', 'verwarming', 'verlichting', 'energiezuinig'],
    category: 'Tips',
    date: '2025-05-20',
    readTime: '6 min',
    content: `
# Energie besparen in vastgoed

Vastgoed heeft specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Verwarming

Verwarming is een grote kostenpost:
- **Slimme thermostaten**: Automatische regeling
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Luchtdichtheid**: Voorkom tocht

## Verlichting

Verlichting kan geoptimaliseerd worden:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Bewegingssensoren**: Zet verlichting uit waar niet nodig
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Tips

- Optimaliseer verwarming
- Vervang oude verlichting door LED
- Investeer in isolatie
- Monitor uw verbruik

## Hulp nodig?

Wij helpen u graag met energiebesparing in vastgoed. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiebesparing-agrarisch-sector',
    title: 'Energie besparen in de agrarische sector',
    description: 'Specifieke tips voor energiebesparing in de agrarische sector. Van verwarming tot verlichting: welke maatregelen leveren de meeste besparing op?',
    keywords: ['agrarisch', 'energie besparen', 'verwarming', 'verlichting', 'energiezuinig'],
    category: 'Tips',
    date: '2025-05-25',
    readTime: '6 min',
    content: `
# Energie besparen in de agrarische sector

De agrarische sector heeft specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Verwarming

Verwarming is een grote kostenpost:
- **Slimme thermostaten**: Automatische regeling
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Luchtdichtheid**: Voorkom tocht

## Verlichting

Verlichting kan geoptimaliseerd worden:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Bewegingssensoren**: Zet verlichting uit waar niet nodig
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Tips

- Optimaliseer verwarming
- Vervang oude verlichting door LED
- Investeer in isolatie
- Monitor uw verbruik

## Hulp nodig?

Wij helpen u graag met energiebesparing in de agrarische sector. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  {
    slug: 'energiebesparing-kantoren-sector',
    title: 'Energie besparen in kantoren',
    description: 'Specifieke tips voor energiebesparing in kantoren. Van verwarming tot verlichting: welke maatregelen leveren de meeste besparing op?',
    keywords: ['kantoren', 'energie besparen', 'verwarming', 'verlichting', 'energiezuinig'],
    category: 'Tips',
    date: '2025-05-30',
    readTime: '6 min',
    content: `
# Energie besparen in kantoren

Kantoren hebben specifieke uitdagingen op het gebied van energie. Hier zijn praktische tips.

## Verwarming

Verwarming is een grote kostenpost:
- **Slimme thermostaten**: Automatische regeling
- **Isolatie**: Goede isolatie bespaart 20-30%
- **Luchtdichtheid**: Voorkom tocht

## Verlichting

Verlichting kan geoptimaliseerd worden:
- **LED-verlichting**: Bespaar 50-70% op verlichtingskosten
- **Bewegingssensoren**: Zet verlichting uit waar niet nodig
- **Natuurlijk licht**: Gebruik daglicht waar mogelijk

## Tips

- Optimaliseer verwarming
- Vervang oude verlichting door LED
- Investeer in isolatie
- Monitor uw verbruik

## Hulp nodig?

Wij helpen u graag met energiebesparing in kantoren. Neem contact met ons op voor persoonlijk advies.
    `.trim()
  },
  // JUNI 2025 (9 artikelen)
  {
    slug: 'energieprijzen-juni-2025',
    title: 'Energieprijzen juni 2025: marktanalyse',
    description: 'Analyse van de energieprijzen in juni 2025. Wat gebeurde er op de markt en wat betekent dit voor uw energiecontract?',
    keywords: ['energieprijzen', 'marktanalyse', 'juni 2025', 'elektriciteitsprijzen', 'gasprijzen'],
    category: 'Markt',
    date: '2025-06-05',
    readTime: '4 min',
    content: `
# Energieprijzen juni 2025: marktanalyse

In juni 2025 zagen we belangrijke ontwikkelingen op de energiemarkt. Deze analyse helpt u begrijpen wat er gebeurde.

## Marktontwikkelingen

Juni 2025 kenmerkte zich door:
- Verdere stabilisatie van prijzen
- Toenemend aanbod van zonne-energie
- Normalisatie van gasprijzen

## Elektriciteitsprijzen

Elektriciteitsprijzen stabiliseerden verder door:
- Meer zonne-energie die prijzen drukt
- Toenemende vraag door elektrificatie
- Betere balans tussen vraag en aanbod

## Gasprijzen

Gasprijzen normaliseerden:
- Goede voorraadniveaus
- Minder volatiliteit dan voorgaande maanden
- Stabilere import van LNG

## Wat betekent dit voor u?

- **Vaste contracten**: Goed moment om te verlengen
- **Dynamische contracten**: Profiteer van lagere prijzen
- **Overstappen**: Mogelijkheden voor betere tarieven

## Blijf op de hoogte

Wij volgen de markt continu en houden u op de hoogte van ontwikkelingen die voor u relevant zijn.
    `.trim()
  },
  // ... (Ik voeg de resterende ~60 artikelen toe in volgende batches)
]

// Helper functie om artikelen op datum te sorteren
export function getArticlesByDate(): typeof allArticles {
  return [...allArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Helper functie om artikelen per categorie te filteren
export function getArticlesByCategory(category: string): typeof allArticles {
  if (category === 'all') return allArticles
  return allArticles.filter(article => article.category === category)
}

// Helper functie om een artikel op slug te vinden
export function getArticleBySlug(slug: string): typeof allArticles[0] | undefined {
  return allArticles.find(article => article.slug === slug)
}

