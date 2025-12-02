'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Lightning,
  Clock,
  CheckCircle,
  Target,
  Eye,
  ShieldCheck,
  Users,
  ClockClockwise,
  ChartLineUp,
  HandCoins,
  FileText,
  Calculator,
  ChatCircleDots,
  ArrowRight,
  Storefront,
  Buildings,
  Factory,
  Plant,
  Briefcase,
  CaretDown,
  CaretUp,
  Star
} from '@phosphor-icons/react'
import { useState } from 'react'

const faqItems = [
  {
    vraag: 'Hoe lang bestaat PakketAdvies?',
    antwoord: 'PakketAdvies is in 2014 opgericht en heeft inmiddels meer dan 10 jaar ervaring in de energiemarkt. We zijn uitgegroeid tot een betrouwbare partner voor honderden bedrijven in Nederland.'
  },
  {
    vraag: 'Zijn jullie onafhankelijk?',
    antwoord: 'Ja, wij zijn 100% onafhankelijk. We werken niet voor leveranciers, maar uitsluitend voor jou. Ons advies is altijd objectief en in jouw belang. We verdienen alleen als jij een contract afsluit via ons.'
  },
  {
    vraag: 'Wat kost jullie dienstverlening?',
    antwoord: 'Ons advies is volledig gratis en vrijblijvend. Je betaalt alleen als je daadwerkelijk een energiecontract afsluit via ons. Er zijn geen verborgen kosten of verrassingen.'
  },
  {
    vraag: 'Voor welke bedrijven werken jullie?',
    antwoord: 'We werken voor alle zakelijke klanten: van kleine MKB\'ers tot grote bedrijven met meerdere locaties. We hebben ervaring in alle sectoren: horeca, retail, vastgoed, industrie, agrarisch en kantoren.'
  },
  {
    vraag: 'Hoe snel kan ik overstappen?',
    antwoord: 'Binnen 2 weken kunnen we je volledig laten overstappen naar een nieuw energiecontract. We regelen alles voor je: van opzeggen bij je huidige leverancier tot activeren bij de nieuwe leverancier.'
  },
  {
    vraag: 'Blijven jullie ook na de overstap beschikbaar?',
    antwoord: 'Ja, absoluut! Ook na je overstap blijven we je adviseren. We monitoren de markt en laten je weten wanneer er nieuwe kansen zijn om te besparen. Je hebt altijd contact met je vaste aanspreekpunt.'
  }
]

const testimonials = [
  {
    name: 'Jan van der Berg',
    company: 'Van der Berg Installatietechniek',
    role: 'Directeur',
    content: 'PakketAdvies heeft ons binnen 2 weken geholpen met overstappen naar een veel voordeliger contract. We besparen nu €8.000 per jaar!',
    rating: 5,
    savings: '€8.000'
  },
  {
    name: 'Linda Hermans',
    company: 'Hermans & Zn. Bakkerij',
    role: 'Eigenaar',
    content: 'Eindelijk iemand die echt meedenkt. Geen gedoe, gewoon een eerlijk advies en een contract dat perfect past bij onze situatie.',
    rating: 5,
    savings: '€3.500'
  }
]

const sectors = [
  {
    id: 'horeca',
    icon: Storefront,
    title: 'Horeca',
    description: 'Restaurants, hotels, cafés',
    href: '/sectoren/horeca',
    color: 'from-brand-teal-400 to-brand-teal-500'
  },
  {
    id: 'retail',
    icon: Storefront,
    title: 'Retail',
    description: 'Winkels en winkelketens',
    href: '/sectoren/retail',
    color: 'from-brand-navy-400 to-brand-navy-500'
  },
  {
    id: 'vastgoed',
    icon: Buildings,
    title: 'Vastgoed',
    description: 'Beleggers en beheerders',
    href: '/sectoren/vastgoed',
    color: 'from-brand-purple-400 to-brand-purple-500'
  },
  {
    id: 'industrie',
    icon: Factory,
    title: 'Industrie',
    description: 'Productie en maakindustrie',
    href: '/sectoren/industrie',
    color: 'from-brand-navy-500 to-brand-navy-600'
  },
  {
    id: 'agrarisch',
    icon: Plant,
    title: 'Agrarisch',
    description: 'Glastuinbouw en telers',
    href: '/sectoren/agrarisch',
    color: 'from-brand-teal-500 to-brand-teal-600'
  },
  {
    id: 'kantoren',
    icon: Briefcase,
    title: 'Kantoren',
    description: 'Zakelijke dienstverlening',
    href: '/sectoren/kantoren',
    color: 'from-brand-teal-500 to-brand-navy-500'
  }
]

export default function OverOnsPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

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
              <span className="text-sm font-semibold text-brand-teal-200">Over PakketAdvies</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              De energiebemiddelaar die{' '}
              <span className="text-brand-teal-500">écht voor je werkt</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Met meer dan 10 jaar ervaring helpen we MKB'ers en grootzakelijke bedrijven bij het vinden van het perfecte energiecontract. Onafhankelijk, transparant en altijd in jouw belang.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Clock weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Reactietijd</div>
                  <div className="font-semibold text-white">Binnen 24 uur</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Tevreden klanten</div>
                  <div className="font-semibold text-white">7.500+</div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Star weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Ervaring</div>
                  <div className="font-semibold text-white">10+ jaar</div>
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

      {/* Missie & Visie Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Missie */}
            <Card className="hover-lift">
              <CardContent className="pt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                  <Target weight="duotone" className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Onze missie
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Onze missie is simpel: elk bedrijf in Nederland verdient het beste energiecontract. Een contract dat perfect past bij hun verbruik, duurzaamheidsdoelen en budget.
                </p>
              </CardContent>
            </Card>

            {/* Visie */}
            <Card className="hover-lift">
              <CardContent className="pt-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                  <Eye weight="duotone" className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-navy-500 mb-4">
                  Onze visie
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Wij geloven in een energiemarkt waar transparantie, onafhankelijkheid en persoonlijke service de norm zijn. Waar bedrijven niet meer hoeven te puzzelen met complexe tarieven en verborgen kosten.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waarden Sectie */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy-500 mb-4">
              Waarom PakketAdvies?
            </h2>
            <p className="text-lg text-gray-600">
              Wat ons onderscheidt van andere energiebemiddelaars
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: '100% Onafhankelijk',
                description: 'Wij werken niet voor leveranciers, maar uitsluitend voor jou. Ons advies is altijd objectief en in jouw belang.'
              },
              {
                icon: Users,
                title: 'Persoonlijk Contact',
                description: 'Geen bots of call centers. Je hebt één vast aanspreekpunt die jou en je bedrijf kent.'
              },
              {
                icon: ClockClockwise,
                title: 'Altijd Actueel',
                description: 'We blijven je proactief adviseren over nieuwe kansen en marktontwikkelingen. Ook na je overstap.'
              },
              {
                icon: ChartLineUp,
                title: 'Transparant & Eerlijk',
                description: 'Geen verborgen kosten of verrassingen. Alles is helder en duidelijk, van het begin tot het einde.'
              },
              {
                icon: CheckCircle,
                title: 'Volledig Ontzorgd',
                description: 'Van vergelijken tot overstappen en daarna: wij regelen alles. Jij hoeft nergens meer aan te denken.'
              },
              {
                icon: Lightning,
                title: 'Expertise & Ervaring',
                description: 'Meer dan 10 jaar ervaring in de energiemarkt. We kennen alle ins en outs en helpen je de beste keuze te maken.'
              }
            ].map((waarde, index) => {
              const Icon = waarde.icon
              return (
                <Card key={index} className="hover-lift">
                  <CardContent className="pt-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-teal-500 shadow-lg mb-6">
                      <Icon weight="duotone" className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                      {waarde.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {waarde.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Statistieken Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Onze cijfers
            </h2>
            <p className="text-lg text-gray-600">
              Resultaten die spreken
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Users,
                number: '7.500+',
                title: 'Tevreden Klanten',
                description: 'Van kleine MKB\'ers tot grote bedrijven. We helpen bedrijven in alle sectoren.',
                gradient: 'from-brand-teal-400 to-brand-teal-500'
              },
              {
                icon: HandCoins,
                number: '€2M+',
                title: 'Totaal Bespaard',
                description: 'Gemiddeld 30-40% besparing per klant. Samen hebben we miljoenen bespaard.',
                gradient: 'from-brand-teal-500 to-brand-teal-600'
              },
              {
                icon: Clock,
                number: '10+',
                title: 'Jaar Ervaring',
                description: 'Sinds 2014 helpen we bedrijven met energie. We kennen de markt door en door.',
                gradient: 'from-brand-teal-400 to-brand-teal-500'
              },
              {
                icon: FileText,
                number: '500+',
                title: 'Contracten Per Jaar',
                description: 'Elk jaar helpen we honderden bedrijven met hun energiecontract.',
                gradient: 'from-brand-teal-500 to-brand-teal-600'
              }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="hover-lift overflow-hidden">
                  <div className={`bg-gradient-to-br ${stat.gradient} p-8 text-white`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Icon weight="duotone" className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-4xl md:text-5xl font-bold mb-1">{stat.number}</div>
                        <div className="text-lg font-semibold opacity-90">{stat.title}</div>
                      </div>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Proces Sectie */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
              <span className="text-sm font-semibold text-brand-navy-600">
                Hoe we werken
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy-500 mb-4">
              Simpel en snel
            </h2>
            <p className="text-lg text-gray-600">
              In 4 stappen helpen we je verder. Geen gedoe, alleen resultaat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                number: '01',
                icon: Calculator,
                title: 'Gratis Analyse',
                description: 'We analyseren je huidige verbruik en contract. Volledig gratis en vrijblijvend.'
              },
              {
                number: '02',
                icon: ChatCircleDots,
                title: 'Persoonlijk Advies',
                description: 'Een specialist neemt contact op en bespreekt je situatie. We zoeken het perfecte contract voor jou.'
              },
              {
                number: '03',
                icon: CheckCircle,
                title: 'Wij Regelen Alles',
                description: 'Van opzeggen tot activeren: wij regelen de hele overstap. Jij hoeft nergens aan te denken.'
              },
              {
                number: '04',
                icon: ClockClockwise,
                title: 'Blijvend Contact',
                description: 'Ook na je overstap blijven we je adviseren. Nieuwe kansen? We laten het je weten.'
              }
            ].map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line (desktop only) */}
                  {index < 3 && index % 2 === 0 && (
                    <div className="hidden md:block absolute left-full top-1/2 w-8 h-0.5 bg-gradient-to-r from-brand-teal-500/30 to-transparent" />
                  )}
                  
                  <Card className="hover-lift h-full">
                    <CardContent className="pt-8">
                      {/* Number badge */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-brand-navy-500 rounded-2xl flex items-center justify-center shadow-xl">
                        <span className="font-display text-2xl font-bold text-white">
                          {step.number}
                        </span>
                      </div>
                      
                      {/* Icon */}
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal-500 shadow-lg mb-6">
                        <Icon weight="duotone" className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Content */}
                      <h3 className="font-display text-xl md:text-2xl font-bold text-brand-navy-500 mb-4">
                        {step.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
              <Star weight="duotone" className="w-5 h-5 text-brand-teal-600" />
              <span className="text-sm font-semibold text-brand-navy-600">
                4.9/5 gemiddelde beoordeling
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Wat onze klanten zeggen
            </h2>
            <p className="text-lg text-gray-600">
              Sluit je aan bij honderden tevreden bedrijven die al besparen met PakketAdvies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="pt-8">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} weight="fill" className="w-5 h-5 text-brand-teal-500" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    <div className="w-12 h-12 bg-brand-navy-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users weight="duotone" className="w-6 h-6 text-brand-teal-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-brand-navy-500">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-xs text-gray-500">{testimonial.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-brand-teal-600">Besparing</div>
                      <div className="text-lg font-bold text-brand-navy-500">{testimonial.savings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Verhaal Sectie */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-6">
                Wie zijn wij?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  PakketAdvies is ontstaan uit frustratie. Frustratie over de complexiteit van de energiemarkt, verborgen kosten en het gebrek aan transparantie. Wij geloven dat energie inkopen simpel en eerlijk moet zijn.
                </p>
                <p>
                  Daarom zijn we in 2014 gestart met één doel: bedrijven helpen om het beste energiecontract te vinden. Onafhankelijk, transparant en altijd in het belang van de klant.
                </p>
                <p>
                  Vandaag de dag helpen we honderden bedrijven per jaar. Van kleine MKB'ers tot grote bedrijven met meerdere locaties. Onze aanpak blijft hetzelfde: persoonlijk, transparant en resultaatgericht.
                </p>
              </div>
            </div>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/office-team.jpg"
                alt="PakketAdvies team"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sectoren Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Sectoren waar we actief zijn
            </h2>
            <p className="text-lg text-gray-600">
              We hebben ervaring in alle branches en kennen de specifieke energie-uitdagingen van jouw sector
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => {
              const Icon = sector.icon
              return (
                <Link key={sector.id} href={sector.href}>
                  <Card className="hover-lift h-full">
                    <CardContent className="pt-8">
                      <div className={`bg-gradient-to-br ${sector.color} p-6 rounded-2xl mb-6`}>
                        <Icon weight="duotone" className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                        {sector.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {sector.description}
                      </p>
                      <div className="flex items-center gap-2 text-brand-teal-600 font-semibold text-sm">
                        <span>Meer informatie</span>
                        <ArrowRight weight="bold" className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Sectie */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je wilt weten over PakketAdvies
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index
              return (
                <Card key={index} className="hover-lift">
                  <CardContent className="pt-6">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <h3 className="font-bold text-lg pr-8 text-brand-navy-500">
                        {item.vraag}
                      </h3>
                      {isOpen ? (
                        <CaretUp weight="bold" className="w-6 h-6 flex-shrink-0 text-brand-teal-500" />
                      ) : (
                        <CaretDown weight="bold" className="w-6 h-6 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-gray-600 leading-relaxed">
                          {item.antwoord}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
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
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Maak kennis met PakketAdvies
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Ontdek wat we voor jouw bedrijf kunnen betekenen. Gratis en vrijblijvend.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator">
                <Button size="lg" variant="secondary" className="bg-white text-brand-navy-500 hover:bg-gray-50">
                  <span className="flex items-center gap-2">
                    <Lightning weight="duotone" className="w-6 h-6" />
                    Start gratis berekening
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <span className="flex items-center gap-2">
                    Neem contact op
                    <ArrowRight weight="bold" className="w-5 h-5" />
                  </span>
                </Button>
              </Link>
            </div>
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm text-gray-300">Gratis en vrijblijvend</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm text-gray-300">100% onafhankelijk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm text-gray-300">Persoonlijk advies</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
