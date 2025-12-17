'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AanbiedingInteresseForm } from '@/components/aanbieding/AanbiedingInteresseForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Lightning,
  ShieldCheck,
  Clock,
  Euro,
  CheckCircle,
  Users,
  ChartLineUp,
  CaretDown,
  CaretUp,
  ArrowRight,
  Phone,
  Sun,
  BatteryHigh,
  ArrowsClockwise,
  TrendUp,
} from '@phosphor-icons/react'

const voordelen = [
  {
    icon: TrendUp,
    titel: 'Betaal de marktprijs',
    beschrijving: 'Je betaalt de actuele marktprijs voor energie. Vaak lager dan vaste tarieven, vooral bij slim verbruik.',
  },
  {
    icon: Sun,
    titel: 'Perfect voor zonnepanelen',
    beschrijving: 'Profiteer optimaal van je zonnepanelen door tegen marktprijs te verkopen en te kopen wanneer nodig.',
  },
  {
    icon: BatteryHigh,
    titel: 'Ideal met batterij opslag',
    beschrijving: 'Combineer dynamische tarieven met een batterij: koop wanneer het goedkoop is, gebruik wanneer nodig.',
  },
  {
    icon: ArrowsClockwise,
    titel: 'Flexibiliteit en vrijheid',
    beschrijving: 'Geen vaste looptijd of opzegvergoedingen. Je kunt altijd overstappen of aanpassen aan je behoeften.',
  },
  {
    icon: ChartLineUp,
    titel: 'Potentieel voor besparing',
    beschrijving: 'Door slim te verbruiken op momenten met lage prijzen, kun je aanzienlijk besparen op je energiekosten.',
  },
  {
    icon: Clock,
    titel: 'Real-time inzicht',
    beschrijving: 'Zie per uur wat je betaalt. Perfect voor het optimaliseren van je verbruik en maximale kostenbesparing.',
  },
]

const procesStappen = [
  {
    nummer: '1',
    titel: 'Vul je interesse in',
    beschrijving: 'Laat je gegevens achter via het formulier. Dit duurt nog geen 2 minuten.',
    icon: Lightning,
  },
  {
    nummer: '2',
    titel: 'Persoonlijk gesprek',
    beschrijving: 'Een specialist neemt contact op om te bespreken of dynamische tarieven passen bij jouw situatie.',
    icon: Phone,
  },
  {
    nummer: '3',
    titel: 'Persoonlijk advies',
    beschrijving: 'We leggen uit hoe dynamische tarieven werken en wat de mogelijkheden zijn voor jouw situatie.',
    icon: ChartLineUp,
  },
  {
    nummer: '4',
    titel: 'Wij regelen alles',
    beschrijving: 'Van aanmelden tot activeren: wij regelen je hele overstap. Jij begint met besparen.',
    icon: CheckCircle,
  },
]

const faqItems = [
  {
    vraag: 'Wat zijn dynamische energietarieven?',
    antwoord: 'Dynamische energietarieven volgen de actuele marktprijs van energie. De prijs per kWh of m³ kan per uur variëren, afhankelijk van vraag en aanbod op de energiemarkt. Je betaalt de werkelijke marktprijs, wat vaak gunstiger is dan vaste tarieven, vooral als je slim verbruikt.',
  },
  {
    vraag: 'Voor wie zijn dynamische tarieven geschikt?',
    antwoord: 'Dynamische tarieven zijn vooral interessant voor huishoudens en bedrijven met zonnepanelen, een batterij, of de mogelijkheid om flexibel te verbruiken. Als je je verbruik kunt verplaatsen naar momenten met lagere prijzen (bijvoorbeeld overdag bij veel zon, of 's nachts), kun je maximaal profiteren.',
  },
  {
    vraag: 'Wat als de prijzen hoog zijn?',
    antwoord: 'Dynamische tarieven kunnen hoger zijn tijdens piekmomenten, maar gemiddeld zijn ze vaak gunstiger dan vaste tarieven. Door slim te verbruiken (bijvoorbeeld wasmachine draaien bij lage prijzen) en eventueel gebruik te maken van zonnepanelen of een batterij, kun je de impact van hoge pieken minimaliseren.',
  },
  {
    vraag: 'Kan ik inzicht krijgen in de prijzen?',
    antwoord: 'Ja, absoluut! Met dynamische tarieven krijg je real-time inzicht in de prijzen per uur. Veel leveranciers bieden apps of dashboards waar je precies kunt zien wanneer energie goedkoop of duur is, zodat je je verbruik kunt optimaliseren.',
  },
  {
    vraag: 'Zijn dynamische tarieven duurder of goedkoper?',
    antwoord: 'Gemiddeld genomen zijn dynamische tarieven vaak goedkoper dan vaste tarieven, omdat je de werkelijke marktprijs betaalt zonder de risico-opslag die leveranciers bij vaste contracten rekenen. Als je slim verbruikt en optimaal gebruik maakt van zonnepanelen of een batterij, kan de besparing nog groter zijn.',
  },
  {
    vraag: 'Kan ik altijd overstappen?',
    antwoord: 'Ja, een groot voordeel van dynamische tarieven is de flexibiliteit. Er zijn meestal geen vaste looptijden of opzegvergoedingen. Je kunt altijd overstappen naar een ander contract of terug naar vaste tarieven als je dat wilt.',
  },
]

export default function DynamischPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Dynamic energy pricing"
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
              <ArrowsClockwise weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">Dynamische energietarieven</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Betaal de marktprijs en bespaar met{' '}
              <span className="text-brand-teal-500">slim energiegebruik</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Dynamische energietarieven volgen de actuele marktprijs. Perfect voor zonnepanelen, batterijen en flexibel verbruik.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Sun weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Ideal voor</div>
                  <div className="font-semibold text-white">Zonnepanelen</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <ArrowsClockwise weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">100%</div>
                  <div className="font-semibold text-white">Flexibel</div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <TrendUp weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Marktprijs</div>
                  <div className="font-semibold text-white">Vaak gunstiger</div>
                </div>
              </div>
            </div>

            {/* CTA Button - Scroll to form */}
            <Button
              size="lg"
              variant="primary"
              className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white"
              onClick={() => {
                const formElement = document.getElementById('interesse-formulier')
                formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Toon interesse
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-full h-20 md:h-24 lg:h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom dynamische tarieven?
            </h2>
            <p className="text-lg text-gray-600">
              De voordelen van flexibele marktprijzen en slim energiegebruik
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

      {/* Hoe werkt dynamisch */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Hoe werken dynamische tarieven?
            </h2>
            <p className="text-lg text-gray-600">
              Transparante uitleg over marktprijzen en flexibel verbruik
            </p>
          </div>

          <Card className="border-2 border-brand-teal-500">
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                    Wat zijn dynamische tarieven?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Dynamische energietarieven volgen de actuele marktprijs van energie op de Europese energiemarkt (EPEX Spot voor stroom, TTF voor gas). De prijs per kWh of m³ varieert per uur, afhankelijk van vraag en aanbod.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Op momenten met veel aanbod (bijvoorbeeld bij veel wind of zon) zijn de prijzen lager. Tijdens piekmomenten (bijvoorbeeld 's avonds bij veel vraag) kunnen de prijzen hoger zijn. Gemiddeld zijn dynamische tarieven vaak gunstiger dan vaste tarieven.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-brand-navy-500 mb-3">Perfect voor:</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Huishoudens en bedrijven met zonnepanelen (verkopen tegen marktprijs)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Eigenaren van een batterij (kopen wanneer goedkoop, gebruiken wanneer nodig)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Flexibel verbruik (wasmachine, laadpaal, etc. op momenten met lage prijzen)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Wie wil profiteren van marktprijzen en flexibiliteit waardeert</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    * Tijdens het gesprek bespreken we of dynamische tarieven passen bij jouw situatie en verbruikspatroon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Zo werkt het
            </h2>
            <p className="text-lg text-gray-600">
              In 4 stappen naar dynamische energietarieven
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

      {/* Social Proof */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom kiezen voor PakketAdvies?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-brand-teal-500 mb-2">2.500+</div>
                <div className="text-gray-600">Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-brand-teal-500 mb-2">7.500+</div>
                <div className="text-gray-600">Tevreden klanten</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-brand-teal-500 mb-2">30-40%</div>
                <div className="text-gray-600">Gemiddelde besparing</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Veelgestelde vragen
            </h2>
            <p className="text-lg text-gray-600">
              Alles wat je wilt weten over dynamische energietarieven
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

      {/* Interesse Formulier */}
      <section id="interesse-formulier" className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Interesse? Laat het ons weten!
            </h2>
            <p className="text-lg text-gray-600">
              Vul het formulier in en we nemen binnen 24 uur contact met je op voor een vrijblijvend gesprek over dynamische energietarieven.
            </p>
          </div>

          <AanbiedingInteresseForm aanbiedingType="dynamisch" />
        </div>
      </section>

      {/* Finale CTA */}
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
              Klaar om te profiteren van marktprijzen?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Laat je gegevens achter en ontdek of dynamische energietarieven geschikt zijn voor jouw situatie.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                variant="primary"
                className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white"
                onClick={() => {
                  const formElement = document.getElementById('interesse-formulier')
                  formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Toon interesse
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Bel direct: 085 047 7065
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

