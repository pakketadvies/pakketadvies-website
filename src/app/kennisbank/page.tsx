'use client'

import { Card, CardContent, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Lightning,
  ChartLine,
  BookOpen,
  Lightbulb,
  HandCoins,
  Leaf,
  FileText,
  Clock,
  CheckCircle,
  CaretDown,
  CaretUp,
  ArrowRight,
  Calendar,
  ClockClockwise
} from '@phosphor-icons/react'

const categories = [
  { id: 'all', name: 'Alle', icon: Lightning },
  { id: 'Markt', name: 'Markt', icon: ChartLine },
  { id: 'Uitleg', name: 'Uitleg', icon: BookOpen },
  { id: 'Advies', name: 'Advies', icon: Lightbulb },
  { id: 'Tips', name: 'Tips', icon: HandCoins },
  { id: 'Duurzaamheid', name: 'Duurzaamheid', icon: Leaf },
  { id: 'Subsidies', name: 'Subsidies', icon: FileText }
]

const articles = [
  {
    title: 'Energieprijzen - Inzicht in de markt',
    excerpt: 'Bekijk actuele en historische marktprijzen voor elektriciteit en gas. Interactieve grafieken en gedetailleerde prijstabellen.',
    category: 'Markt',
    date: '30 november 2025',
    readTime: '3 min',
    href: '/kennisbank/energieprijzen',
    featured: true,
  },
  {
    title: 'Grootverbruik vs. Kleinverbruik: wat is het verschil?',
    excerpt: 'Ontdek wanneer u een grootverbruiker bent en wat dit betekent voor uw energiecontract.',
    category: 'Uitleg',
    date: '15 januari 2025',
    readTime: '5 min',
    href: '/kennisbank/grootverbruik-kleinverbruik',
  },
  {
    title: 'Vast of dynamisch energiecontract: wat past bij uw bedrijf?',
    excerpt: 'Ontdek de verschillen tussen vaste en dynamische energiecontracten en welke het beste bij uw bedrijf past.',
    category: 'Advies',
    date: '15 november 2025',
    readTime: '5 min',
  },
  {
    title: 'Zo bespaart u energie in uw kantoorpand',
    excerpt: 'Praktische tips om het energieverbruik in uw kantoor te verlagen en geld te besparen.',
    category: 'Tips',
    date: '10 november 2025',
    readTime: '7 min',
  },
  {
    title: 'Groene energie voor bedrijven: alles wat u moet weten',
    excerpt: 'Van windenergie tot zonnepanelen: een complete gids over duurzame energie voor zakelijk gebruik.',
    category: 'Duurzaamheid',
    date: '5 november 2025',
    readTime: '6 min',
  },
  {
    title: 'De energiemarkt in 2025: trends en ontwikkelingen',
    excerpt: 'Een overzicht van de belangrijkste trends op de zakelijke energiemarkt dit jaar.',
    category: 'Markt',
    date: '1 november 2025',
    readTime: '8 min',
  },
  {
    title: 'Hoe leest u uw energienota?',
    excerpt: 'Stap voor stap uitleg over wat er op uw zakelijke energienota staat en waar u op moet letten.',
    category: 'Uitleg',
    date: '28 oktober 2025',
    readTime: '4 min',
  },
  {
    title: 'Subsidies voor verduurzaming van uw bedrijf',
    excerpt: 'Overzicht van beschikbare subsidies en regelingen voor zakelijke verduurzaming.',
    category: 'Subsidies',
    date: '20 oktober 2025',
    readTime: '6 min',
  },
]

const faqItems = [
  {
    vraag: 'Wat is het verschil tussen grootverbruik en kleinverbruik?',
    antwoord: 'Het verschil tussen grootverbruik en kleinverbruik wordt bepaald door je aansluitwaarden. Bij elektriciteit ben je grootverbruiker als je aansluiting groter is dan 3x80A (bijvoorbeeld 3x100A). Bij gas ben je grootverbruiker als je aansluiting groter is dan G25 (bijvoorbeeld G40 of G65). Grootverbruikers ontvangen maandelijks een factuur voor het daadwerkelijke verbruik en krijgen aparte facturen voor energielevering en netbeheerkosten. Kleinverbruikers betalen een voorschotbedrag en ontvangen aan het einde van het jaar een jaarafrekening. De netbeheerkosten zijn voor grootverbruikers vaak hoger, maar je kunt ook profiteren van scherpere tarieven door volume.'
  },
  {
    vraag: 'Wat is het verschil tussen een vast en dynamisch energiecontract?',
    antwoord: 'Bij een vast contract betaal je een vaste prijs per kWh/m³ voor de hele looptijd (bijvoorbeeld 1, 2, 3 of 5 jaar). Je hebt volledige prijszekerheid: ongeacht marktschommelingen betaal je altijd hetzelfde tarief. Dit is ideaal als je zekerheid wilt en verwacht dat prijzen gaan stijgen. Bij een dynamisch contract volgt de prijs de actuele marktprijzen per uur. Je betaalt wat de energie op dat moment kost op de groothandelsmarkt, plus een transparante opslag. Dit kan voordeliger zijn als prijzen dalen, maar je hebt minder zekerheid. Dynamische contracten zijn ideaal voor bedrijven die flexibel kunnen zijn met hun verbruik (bijvoorbeeld door te profiteren van daluren).'
  },
  {
    vraag: 'Hoe lees ik mijn energienota?',
    antwoord: 'Je energienota bestaat uit verschillende onderdelen: 1) Leverancierskosten: de kosten voor de daadwerkelijke energie (elektriciteit in kWh, gas in m³) plus vastrecht. 2) Energiebelasting: een overheidsheffing die verschilt per schijf (bij elektriciteit: 0-10.000 kWh, 10.000-50.000 kWh, >50.000 kWh). 3) ODE (Opslag Duurzame Energie): een heffing voor duurzame energieprojecten. 4) Netbeheerkosten: kosten voor het transport van energie via het netwerk (vastrecht + transportkosten). 5) BTW: 21% over alle bovenstaande kosten (behalve vermindering energiebelasting). 6) Vermindering energiebelasting: een korting die wordt afgetrokken. Op je nota zie je vaak een overzicht met alle componenten en het totaalbedrag.'
  },
  {
    vraag: 'Wat zijn netbeheerkosten en waarom betaal ik die?',
    antwoord: 'Netbeheerkosten zijn de kosten voor het transport van energie via het elektriciteits- en gasnetwerk naar jouw bedrijf. Deze kosten worden niet door je energieleverancier bepaald, maar door de netbeheerder (zoals Enexis, Liander, Stedin). De netbeheerder is verantwoordelijk voor het onderhoud en beheer van het netwerk. De kosten bestaan uit: 1) Vastrecht: een vast bedrag per jaar voor de aansluiting (afhankelijk van je aansluitwaarde). 2) Transportkosten: variabele kosten per kWh/m³. 3) Meetkosten: kosten voor de meter en het uitlezen ervan. Grootverbruikers ontvangen een aparte factuur van de netbeheerder, kleinverbruikers krijgen deze kosten op de factuur van de leverancier.'
  },
  {
    vraag: 'Wat is energiebelasting en ODE?',
    antwoord: 'Energiebelasting is een overheidsheffing die je betaalt over je energieverbruik. Voor elektriciteit betaal je verschillende tarieven per schijf: schijf 1 (0-10.000 kWh) heeft het hoogste tarief, schijf 2 (10.000-50.000 kWh) een lager tarief, en schijf 3 (>50.000 kWh) het laagste tarief. Voor gas zijn er twee schijven: schijf 1 (0-5.000 m³) en schijf 2 (>5.000 m³). ODE (Opslag Duurzame Energie) is een extra heffing die wordt gebruikt om duurzame energieprojecten te financieren. Deze heffing wordt per kWh (elektriciteit) en per m³ (gas) berekend. Beide heffingen worden jaarlijks door de overheid vastgesteld en kunnen wijzigen. Als kleinverbruiker kun je ook recht hebben op vermindering energiebelasting, wat een korting is op je energierekening.'
  },
  {
    vraag: 'Wat is saldering en hoe werkt dat?',
    antwoord: 'Saldering is een regeling voor bedrijven met zonnepanelen die meer stroom opwekken dan ze verbruiken. Het overschot wordt teruggeleverd aan het net. Bij saldering wordt je verbruik verrekend met je teruglevering: als je 10.000 kWh verbruikt en 8.000 kWh teruglevert, betaal je alleen over 2.000 kWh. Tot 2025 geldt saldering volledig voor kleinverbruikers. Vanaf 2025 wordt saldering afgebouwd: je krijgt dan een lagere vergoeding voor teruggeleverde stroom. Grootverbruikers hebben geen saldering, maar krijgen een terugleververgoeding per kWh. Het is belangrijk om te weten dat saldering alleen geldt voor elektriciteit, niet voor gas.'
  },
  {
    vraag: 'Wat is een EAN-code en waarom heb ik die nodig?',
    antwoord: 'Een EAN-code (European Article Number) is een uniek 18-cijferig nummer dat je energieaansluiting identificeert. Elke aansluiting heeft twee EAN-codes: één voor elektriciteit en één voor gas. De EAN-code is nodig om: 1) Je aansluiting te identificeren bij een overstap naar een nieuwe leverancier. 2) Je verbruiksgegevens op te halen. 3) Je contract te koppelen aan je aansluiting. Je vindt je EAN-codes op je energienota, in je meterkast (op een sticker), of via je netbeheerder. Bij een overstap heb je beide EAN-codes nodig. Zonder EAN-codes kan een leverancier je niet aansluiten.'
  },
  {
    vraag: 'Hoe werkt een energiecontract precies?',
    antwoord: 'Een energiecontract heeft een vaste looptijd (bijvoorbeeld 1, 2, 3 of 5 jaar). Gedurende deze looptijd betaal je het afgesproken tarief. Aan het einde van de looptijd wordt je contract automatisch verlengd voor onbepaalde tijd, tenzij je opzegt. Je hebt een opzegtermijn (meestal 1 maand voor het einde van de looptijd). Als je niet opzegt, blijf je hetzelfde contract houden, maar vaak tegen andere (meestal hogere) tarieven. Tussentijds opzeggen is meestal niet mogelijk zonder boete, tenzij je een contract met maandelijkse opzegtermijn hebt (bijvoorbeeld bij dynamische contracten). Het is belangrijk om je einddatum in de gaten te houden en tijdig te verlengen of over te stappen.'
  },
  {
    vraag: 'Wat zijn aansluitwaarden en waarom zijn ze belangrijk?',
    antwoord: 'Aansluitwaarden bepalen hoeveel energie je maximaal kunt afnemen en zijn cruciaal voor je netbeheerkosten. Voor elektriciteit zijn dit waarden zoals 1x25A (kleinverbruik, 1-fase), 3x25A (grootverbruik, 3-fase), 3x80A (grootverbruik, industrie), etc. Hoe hoger de waarde, hoe meer vermogen je kunt afnemen, maar ook hoe hoger je netbeheerkosten. Voor gas zijn dit waarden zoals G4 (max 6 m³/uur, kleinverbruik), G6 (max 10 m³/uur, standaard zakelijk), G25 (max 40 m³/uur, industrie), etc. Je aansluitwaarde staat op je meterkast en bepaalt of je kleinverbruiker of grootverbruiker bent. Dit heeft invloed op je facturering, netbeheerkosten en welke contracten beschikbaar zijn.'
  },
  {
    vraag: 'Hoe bespaar ik energie in mijn bedrijf?',
    antwoord: 'Er zijn verschillende manieren om energie te besparen: 1) LED-verlichting: vervang oude verlichting door LED, dit kan 50-70% besparing opleveren. 2) Slimme thermostaten: automatische temperatuurregeling kan 10-15% besparen op verwarming. 3) Isolatie: goede isolatie van je pand bespaart op verwarming en koeling. 4) Zonnepanelen: wek je eigen stroom op en profiteer van saldering. 5) Energiezuinige apparatuur: vervang oude machines en apparaten door energiezuinige varianten. 6) Verbruikspatroon: verschuif verbruik naar daluren (bij dynamische contracten). 7) Monitoring: houd je verbruik in de gaten met slimme meters en dashboards. Veel maatregelen hebben een terugverdientijd van 2-5 jaar en kunnen je energiekosten aanzienlijk verlagen.'
  }
]

export default function KennisbankPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory)

  const categoryIcons: { [key: string]: any } = {
    'Markt': ChartLine,
    'Uitleg': BookOpen,
    'Advies': Lightbulb,
    'Tips': HandCoins,
    'Duurzaamheid': Leaf,
    'Subsidies': FileText
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/office-team.jpg"
            alt="Professional office team"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
              <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Kennisbank</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Alles wat je moet weten over{' '}
              <span className="text-brand-teal-500">zakelijke energie</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Praktische artikelen, uitleg en tips om het perfecte energiecontract te vinden en te beheren.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <BookOpen weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Artikelen</div>
                  <div className="font-semibold text-white">8+ artikelen</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Actuele informatie</div>
                  <div className="font-semibold text-white">Altijd up-to-date</div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Lightbulb weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Praktische tips</div>
                  <div className="font-semibold text-white">Direct toepasbaar</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom transition */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-20 md:h-24 lg:h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,70 Q360,40 720,70 T1440,70 L1440,120 L0,120 Z" fill="white"/>
            <path 
              d="M0,70 Q360,40 720,70 T1440,70" 
              stroke="url(#energyGradient)" 
              strokeWidth="2" 
              fill="none"
              opacity="0.4"
            />
            <defs>
              <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00AF9B" stopOpacity="0" />
                <stop offset="20%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="50%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="80%" stopColor="#00AF9B" stopOpacity="1" />
                <stop offset="100%" stopColor="#00AF9B" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Categorieën Filter */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="container-custom max-w-7xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-brand-teal-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon weight={isActive ? "fill" : "duotone"} className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-8">
            Artikelen
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
            {filteredArticles.map((article, index) => {
              const isFeatured = (article as any).featured
              const CategoryIcon = categoryIcons[article.category] || FileText
              
              return (
                <Card 
                  key={index} 
                  className={`hover-lift ${
                    isFeatured ? 'lg:col-span-3 md:col-span-2 border-2 border-brand-teal-200 bg-gradient-to-br from-white to-brand-teal-50' : ''
                  }`}
                >
                  <CardContent className="pt-8">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-teal-500/10 flex items-center justify-center">
                          <CategoryIcon weight="duotone" className="w-4 h-4 text-brand-teal-600" />
                        </div>
                        <Badge variant="info" className="bg-brand-teal-500/10 text-brand-teal-700 border-brand-teal-200">
                          {article.category}
                        </Badge>
                      </div>
                      {isFeatured && (
                        <Badge variant="info" className="bg-brand-teal-500 text-white">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <CardTitle className={`mb-3 ${isFeatured ? 'text-2xl' : 'line-clamp-2'}`}>
                      {article.title}
                    </CardTitle>
                    <p className={`text-gray-600 text-sm mb-4 ${isFeatured ? '' : 'line-clamp-3'}`}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar weight="duotone" className="w-4 h-4" />
                        <span>{article.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock weight="duotone" className="w-4 h-4" />
                        <span>{article.readTime} leestijd</span>
                      </div>
                    </div>
                    <Link
                      href={article.href || '#'}
                      className="text-brand-teal-500 hover:text-brand-teal-600 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                    >
                      {isFeatured ? 'Bekijk energieprijzen' : 'Lees meer'}
                      <ArrowRight weight="bold" className="w-4 h-4" />
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Visuele Sectie met Foto */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6">
                Waarom een kennisbank?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed mb-6">
                <p>
                  Goed geïnformeerd zijn over energie helpt je om betere beslissingen te nemen. Onze kennisbank bevat praktische artikelen, uitleg en tips die je direct kunt toepassen.
                </p>
                <p>
                  Van het begrijpen van je energienota tot het kiezen van het juiste contract: we maken complexe onderwerpen begrijpelijk en praktisch.
                </p>
              </div>
              
              <ul className="space-y-3">
                {[
                  'Praktische tips die je direct kunt toepassen',
                  'Uitleg van complexe energiebegrippen',
                  'Actuele informatie over de energiemarkt',
                  'Hulp bij het maken van de juiste keuzes'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-teal-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle weight="fill" className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/how-it-works-docs.jpg"
                alt="Energy knowledge and documents"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je wilt weten over energiecontracten en energierekeningen
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-0">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                  >
                    <h3 className="font-display text-lg font-bold text-brand-navy-500 pr-4">
                      {item.vraag}
                    </h3>
                    <div className="flex-shrink-0">
                      {openFaqIndex === index ? (
                        <CaretUp weight="bold" className="w-6 h-6 text-brand-teal-500" />
                      ) : (
                        <CaretDown weight="bold" className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      <p className="text-gray-600 leading-relaxed pt-4">
                        {item.antwoord}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sectie */}
      <section className="py-16 md:py-24 bg-brand-navy-500 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Professional business"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar om te besparen op je energiekosten?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start vandaag nog met onze gratis besparingscheck en ontdek hoeveel je kunt besparen met een beter energiecontract.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/calculator">
                <Button size="lg" variant="primary" className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white">
                  Bereken je besparing
                  <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Neem contact op
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
                <span>Gratis en vrijblijvend</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
                <span>Binnen 24 uur reactie</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-400" />
                <span>7.500+ tevreden klanten</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
