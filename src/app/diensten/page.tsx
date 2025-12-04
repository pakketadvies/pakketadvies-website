'use client'

import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Lightning,
  ChartLineUp,
  MagnifyingGlass,
  ArrowsClockwise,
  FileText,
  Leaf,
  Clock,
  CheckCircle,
  ShieldCheck,
  Users,
  ClockClockwise,
  HandCoins,
  ChartLine,
  CaretDown,
  CaretUp,
  ArrowRight,
  BatteryHigh
} from '@phosphor-icons/react'

const diensten = [
  {
    id: 1,
    title: 'Energiecontract Advies',
    description: 'We analyseren je verbruik en vergelijken alle beschikbare energieleveranciers. Je krijgt persoonlijk advies op maat voor het perfecte contract.',
    icon: ChartLineUp,
    features: [
      'Vergelijking van alle leveranciers',
      'Persoonlijk advies op maat',
      'Transparante prijsopbouw',
      'Beste tarief gegarandeerd'
    ],
    voordelen: [
      'Gemiddeld 30-40% besparing',
      'Volledig gratis en vrijblijvend',
      'Geen verborgen kosten'
    ]
  },
  {
    id: 2,
    title: 'Contractvergelijking',
    description: 'Vergelijk alle beschikbare energiecontracten helder naast elkaar. Geen verrassingen, alleen transparante prijzen en voorwaarden.',
    icon: MagnifyingGlass,
    features: [
      'Real-time vergelijking',
      'Alle contracttypes (vast, dynamisch, maatwerk)',
      'Duidelijke kostenbreakdown',
      'Direct inzicht in besparing'
    ],
    voordelen: [
      'Bespaar tijd en moeite',
      'Objectieve vergelijking',
      'Direct duidelijk wat het beste is'
    ]
  },
  {
    id: 3,
    title: 'Overstapservice',
    description: 'Wij regelen je hele overstap. Van opzeggen bij je huidige leverancier tot activeren bij de nieuwe. Jij hoeft nergens aan te denken.',
    icon: ArrowsClockwise,
    features: [
      'Volledige ontzorging',
      'Opzeggen oude contract',
      'Aanmelden nieuwe contract',
      'Activeren en afstemmen'
    ],
    voordelen: [
      'Binnen 2 weken overgestapt',
      'Geen gedoe, wij regelen alles',
      'Geen onderbreking van levering'
    ]
  },
  {
    id: 4,
    title: 'Contractbeheer',
    description: 'Beheer al je energiecontracten centraal. We monitoren einddatums, adviseren over verlenging of overstap, en houden je op de hoogte van nieuwe kansen.',
    icon: FileText,
    features: [
      'Centraal contractoverzicht',
      'Automatische herinneringen',
      'Proactief advies over nieuwe kansen',
      'Jaarlijkse evaluatie'
    ],
    voordelen: [
      'Nooit meer vergeten op te zeggen',
      'Altijd de beste deal',
      'Blijvend contact en advies'
    ]
  },
  {
    id: 5,
    title: 'Groene Energie',
    description: 'Stap over naar duurzame energie zonder gedoe. We helpen je met groene contracten, zonnepanelen advies, batterij oplossingen en duurzaamheidsdoelen.',
    icon: Leaf,
    features: [
      'Groene energiecontracten',
      'Zonnepanelen advies',
      'Batterij oplossingen',
      'Duurzaamheidsrapportage',
      'CO2-reductie inzicht'
    ],
    voordelen: [
      'Draag bij aan duurzaamheid',
      'Vaak voordeliger dan je denkt',
      'Transparant over herkomst'
    ]
  },
  {
    id: 6,
    title: 'Batterij Oplossingen',
    description: 'Ondersteuning bij batterij oplossingen voor MKB en Grootzakelijk. We helpen je met de juiste batterij systemen voor energieopslag en zelfvoorzienendheid.',
    icon: BatteryHigh,
    features: [
      'Advies over batterij systemen',
      'Vergelijking van verschillende oplossingen',
      'Ondersteuning bij installatie',
      'Optimalisatie van energieopslag'
    ],
    voordelen: [
      'Maximaliseer zelf opgewekte energie',
      'Verlaag je energiekosten',
      'Verhoog je energieonafhankelijkheid'
    ]
  }
]

const procesStappen = [
  {
    nummer: '1',
    titel: 'Gratis Analyse',
    beschrijving: 'We analyseren je huidige verbruik en contract. Volledig gratis en vrijblijvend.',
    icon: MagnifyingGlass
  },
  {
    nummer: '2',
    titel: 'Persoonlijk Advies',
    beschrijving: 'Een specialist neemt contact op en bespreekt je situatie. We zoeken het perfecte contract voor jou.',
    icon: Users
  },
  {
    nummer: '3',
    titel: 'Wij Regelen Alles',
    beschrijving: 'Van vergelijken tot overstappen: wij regelen de hele overstap. Jij hoeft nergens aan te denken.',
    icon: CheckCircle
  },
  {
    nummer: '4',
    titel: 'Blijvend Contact',
    beschrijving: 'Ook na je overstap blijven we je adviseren. Nieuwe kansen? We laten het je weten.',
    icon: ClockClockwise
  }
]

const voordelen = [
  {
    icon: HandCoins,
    titel: 'Volledig Gratis',
    beschrijving: 'Je betaalt NOOIT aan ons. Ons advies en bemiddeling is volledig gratis.'
  },
  {
    icon: ShieldCheck,
    titel: '100% Onafhankelijk',
    beschrijving: 'We werken niet voor leveranciers, maar uitsluitend voor jou. Objectief advies in jouw belang.'
  },
  {
    icon: Users,
    titel: 'Persoonlijk Contact',
    beschrijving: 'Geen bots of call centers. Je hebt één vast aanspreekpunt die jou en je bedrijf kent.'
  },
  {
    icon: CheckCircle,
    titel: 'Volledig Ontzorgd',
    beschrijving: 'Van vergelijken tot beheren: wij regelen alles. Jij hoeft nergens meer aan te denken.'
  },
  {
    icon: ClockClockwise,
    titel: 'Altijd Actueel',
    beschrijving: 'We blijven je proactief adviseren over nieuwe kansen en marktontwikkelingen.'
  },
  {
    icon: ChartLine,
    titel: 'Transparant & Eerlijk',
    beschrijving: 'Geen verborgen kosten of verrassingen. Alles is helder en duidelijk.'
  }
]

const faqItems = [
  {
    vraag: 'Zijn jullie diensten echt volledig gratis?',
    antwoord: 'Ja, absoluut! Je betaalt NOOIT aan ons - ook niet als je een energiecontract afsluit. Wij bemiddelen voor je met energieleveranciers en onderhandelen de beste tarieven. In ruil ontvangen wij een kleine vergoeding van de energieleverancier (een klein gedeelte van hun winst op het contract). Dit heeft geen invloed op het tarief dat jij betaalt - je krijgt altijd het scherpste tarief dat we kunnen onderhandelen.'
  },
  {
    vraag: 'Hoe lang duurt het voordat ik kan overstappen?',
    antwoord: 'Gemiddeld kun je binnen 2 weken overstappen. Dit hangt af van je huidige contract en de opzegtermijn. We regelen alles voor je, inclusief het opzeggen van je oude contract en het activeren van het nieuwe. Er is geen onderbreking van je energielevering.'
  },
  {
    vraag: 'Wat gebeurt er met mijn huidige contract?',
    antwoord: 'Wij regelen het opzeggen van je huidige contract voor je. We zorgen ervoor dat je op het juiste moment overstapt, zodat je geen dubbele kosten hebt en geen onderbreking van je levering ervaart.'
  },
  {
    vraag: 'Kunnen jullie ook helpen met meerdere locaties?',
    antwoord: 'Ja, absoluut! We helpen bedrijven met één locatie tot bedrijven met tientallen locaties. We kunnen al je energiecontracten centraal beheren en zorgen voor uniforme voorwaarden en tarieven waar mogelijk.'
  },
  {
    vraag: 'Blijven jullie ook na de overstap beschikbaar?',
    antwoord: 'Ja, we blijven je proactief adviseren. We monitoren je contracten, houden je op de hoogte van nieuwe kansen, en adviseren je tijdig over verlenging of overstap. Je hebt altijd contact met ons.'
  },
  {
    vraag: 'Wat is het verschil tussen jullie diensten en zelf zoeken?',
    antwoord: 'Wij hebben toegang tot alle leveranciers en kunnen onderhandelen over betere tarieven. We kennen de markt door en door en weten welke contracten het beste bij jouw situatie passen. Bovendien regelen wij alles voor je - van vergelijken tot overstappen en beheren. Jij bespaart tijd en krijgt altijd het beste advies.'
  }
]

export default function DienstenPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
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
              <span className="text-sm font-semibold text-brand-teal-200">Onze Diensten</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Alles wat je nodig hebt voor het{' '}
              <span className="text-brand-teal-500">perfecte energiecontract</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Van vergelijken tot beheren: wij nemen je volledig uit handen. Onafhankelijk, transparant en altijd in jouw belang.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Lightning weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Volledig gratis</div>
                  <div className="font-semibold text-white">Geen verborgen kosten</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">100% onafhankelijk</div>
                  <div className="font-semibold text-white">Altijd in jouw belang</div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Users weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Persoonlijk advies</div>
                  <div className="font-semibold text-white">Vast aanspreekpunt</div>
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
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white"/>
            <path 
              d="M0,95 Q360,65 720,95 T1440,95" 
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

      {/* Diensten Overzicht */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Onze diensten
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je nodig hebt voor het perfecte energiecontract, van vergelijken tot beheren
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {diensten.map((dienst) => {
              const Icon = dienst.icon
              return (
                <Card key={dienst.id} className="hover-lift">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Icon weight="duotone" className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-3">
                          {dienst.title}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {dienst.description}
                        </p>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-brand-navy-500 mb-2 uppercase tracking-wide">
                              Wat krijg je:
                            </h4>
                            <ul className="space-y-2">
                              {dienst.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-brand-navy-500 mb-2 uppercase tracking-wide">
                              Voordelen:
                            </h4>
                            <ul className="space-y-2">
                              {dienst.voordelen.map((voordeel, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <ArrowRight weight="bold" className="w-4 h-4 text-brand-teal-500 flex-shrink-0 mt-1" />
                                  <span>{voordeel}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Hoe we werken
            </h2>
            <p className="text-lg text-gray-600">
              In 4 simpele stappen naar het perfecte energiecontract
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {procesStappen.map((stap, index) => {
              const Icon = stap.icon
              return (
                <div key={index} className="relative">
                  {/* Connector line (desktop only) */}
                  {index < procesStappen.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-teal-400 to-brand-teal-500/50 z-0" style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }} />
                  )}
                  
                  <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-navy-500 text-white font-bold text-xl mb-4 shadow-lg">
                      {stap.nummer}
                    </div>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 mb-4 shadow-lg">
                      <Icon weight="duotone" className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-2">
                      {stap.titel}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {stap.beschrijving}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Voordelen Sectie */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom onze diensten?
            </h2>
            <p className="text-lg text-gray-600">
              Wat ons onderscheidt van andere energiebemiddelaars
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {voordelen.map((voordeel, index) => {
              const Icon = voordeel.icon
              return (
                <Card key={index} className="hover-lift">
                  <CardContent className="pt-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-teal-400 to-brand-teal-500 shadow-lg mb-6">
                      <Icon weight="duotone" className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-brand-navy-500 mb-3">
                      {voordeel.titel}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {voordeel.beschrijving}
                    </p>
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
                Waarom kiezen bedrijven voor onze diensten?
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed mb-6">
                <p>
                  We maken het overstappen naar een betere energieleverancier simpel, transparant en volledig ontzorgd. Van het eerste gesprek tot het beheren van je contracten: wij staan altijd voor je klaar.
                </p>
                <p>
                  Onze diensten zijn volledig gratis en we werken uitsluitend in jouw belang. Geen verborgen kosten, geen verrassingen - alleen het beste advies en de scherpste tarieven.
                </p>
              </div>
              
              <ul className="space-y-3">
                {[
                  'Persoonlijk contact met vaste aanspreekpunt',
                  'Volledige ontzorging van A tot Z',
                  'Proactief advies over nieuwe kansen',
                  'Centraal beheer van alle contracten'
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
                src="/images/features-dashboard.jpg"
                alt="Energy services dashboard"
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
              Alles wat je wilt weten over onze diensten
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