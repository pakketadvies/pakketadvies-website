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
  CheckCircle,
  Users,
  ChartLineUp,
  CaretDown,
  CaretUp,
  ArrowRight,
  Phone,
  Buildings,
  ChartBar,
  Handshake,
} from '@phosphor-icons/react'

const voordelen = [
  {
    icon: ChartBar,
    titel: 'Volumevoordelen',
    beschrijving: 'Bij grootverbruik (75.000+ kWh) profiteer je van scherpe tarieven door volumevoordelen en strategische inkoop.',
  },
  {
    icon: Handshake,
    titel: 'Maatwerk oplossingen',
    beschrijving: 'Contracten op maat gemaakt voor jouw bedrijf, met flexibele voorwaarden die perfect aansluiten bij je behoeften.',
  },
  {
    icon: ChartLineUp,
    titel: 'Significante kostenbesparing',
    beschrijving: 'Bespaar tienduizenden euros per jaar door te profiteren van gunstige grootverbruikerstarieven.',
  },
  {
    icon: ShieldCheck,
    titel: 'Strategische prijszekerheid',
    beschrijving: 'Langdurige contracten met vaste tarieven geven je jarenlange budgetzekerheid en bescherming tegen marktvolatiliteit.',
  },
  {
    icon: Buildings,
    titel: 'Multi-locatie beheer',
    beschrijving: 'Centraal beheer van al je locaties met uniforme voorwaarden, wat energiebeheer eenvoudiger en efficiënter maakt.',
  },
  {
    icon: Users,
    titel: 'Dedicated accountmanager',
    beschrijving: 'Een vaste specialist die jouw bedrijf kent en altijd beschikbaar is voor advies en ondersteuning.',
  },
]

const procesStappen = [
  {
    nummer: '1',
    titel: 'Vul je interesse in',
    beschrijving: 'Laat je bedrijfsgegevens en verbruik achter via het formulier. We nemen snel contact op.',
    icon: Lightning,
  },
  {
    nummer: '2',
    titel: 'Intake gesprek',
    beschrijving: 'Een grootzakelijke specialist neemt contact op voor een uitgebreide intake over je bedrijf en behoeften.',
    icon: Phone,
  },
  {
    nummer: '3',
    titel: 'Persoonlijk voorstel',
    beschrijving: 'We analyseren je verbruik, zoeken de beste leveranciers en presenteren een maatwerk voorstel met scherpe tarieven.',
    icon: ChartLineUp,
  },
  {
    nummer: '4',
    titel: 'Wij regelen alles',
    beschrijving: 'Van onderhandelen tot activeren: wij regelen je hele overstap. Jij focust op je core business.',
    icon: CheckCircle,
  },
]

const faqItems = [
  {
    vraag: 'Voor welke bedrijven is dit geschikt?',
    antwoord: 'Grootzakelijke contracten zijn geschikt voor bedrijven met een jaarverbruik van 75.000 kWh of meer. Dit zijn vaak bedrijven met meerdere locaties, productiefaciliteiten, of grote kantoren. Tijdens het gesprek bepalen we samen of je in aanmerking komt voor grootzakelijke tarieven.',
  },
  {
    vraag: 'Wat zijn de voordelen van grootzakelijke contracten?',
    antwoord: 'Grootzakelijke contracten bieden scherpere tarieven door volumevoordelen, maatwerk oplossingen die perfect aansluiten bij je bedrijf, langdurige prijszekerheid, en vaak een dedicated accountmanager. Daarnaast kunnen we meerdere locaties centraal beheren.',
  },
  {
    vraag: 'Zijn de tarieven anders dan bij MKB?',
    antwoord: 'Ja, grootzakelijke tarieven zijn doorgaans lager dan MKB-tarieven omdat leveranciers bij grootverbruik andere inkoopstrategieën gebruiken en volumevoordelen kunnen doorgeven. De exacte tarieven zijn afhankelijk van je verbruik, locatie en contractduur.',
  },
  {
    vraag: 'Kan ik meerdere locaties opnemen?',
    antwoord: 'Absoluut! We kunnen al je locaties centraal beheren en zorgen voor uniforme voorwaarden waar mogelijk. Dit maakt je energiebeheer eenvoudiger en vaak voordeliger. We bespreken tijdens het gesprek hoe we je multi-locatie situatie het beste kunnen aanpakken.',
  },
  {
    vraag: 'Wat als mijn verbruik sterk fluctueert?',
    antwoord: 'We kunnen contracten afsluiten met flexibele voorwaarden die rekening houden met seizoensgebonden of variabel verbruik. Tijdens het gesprek bespreken we je verbruikspatronen en stellen we een contract voor dat hier perfect bij past.',
  },
  {
    vraag: 'Hoe lang duurt het voordat ik kan overstappen?',
    antwoord: 'Voor grootzakelijke contracten kan het soms iets langer duren (3-6 weken) omdat we vaak meerdere leveranciers benaderen en onderhandelen over de beste voorwaarden. We houden je gedurende het hele proces op de hoogte en zorgen voor een soepele overgang zonder onderbreking van je levering.',
  },
]

export default function GrootzakelijkPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero met Inline Formulier */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Enterprise energy solutions"
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
          {/* 2-kolommen layout: Hero content + Formulier */}
          <div className="grid lg:grid-cols-[1fr,480px] gap-12 items-start">
            {/* Links: Hero Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
                <Buildings weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm font-semibold text-brand-teal-200">Grootzakelijk Aanbod</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Scherpe tarieven voor{' '}
                <span className="text-brand-teal-500">grootverbruikers</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Maatwerk energiecontracten voor bedrijven vanaf 75.000 kWh. Profiteer van volumevoordelen en strategische inkoop voor maximale besparing.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <ChartBar weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Vanaf</div>
                    <div className="font-semibold text-white">75.000 kWh</div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <Handshake weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Maatwerk</div>
                    <div className="font-semibold text-white">Oplossingen</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Volledig</div>
                    <div className="font-semibold text-white">Gratis advies</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rechts: Formulier Card */}
            <div className="lg:sticky lg:top-32">
              <Card className="bg-white shadow-2xl border-0">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                      Vraag maatwerk offerte aan
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Binnen 24 uur reactie · Gratis en vrijblijvend
                    </p>
                  </div>
                  
                  <AanbiedingInteresseForm 
                    aanbiedingType="grootzakelijk"
                    compact={true}
                  />
                  
                  {/* Trust badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
                        <span>Binnen 24 uur</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle weight="fill" className="w-4 h-4 text-brand-teal-500" />
                        <span>7.500+ klanten</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

      {/* Transparante Tarieven Info */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Grootzakelijke tarieven
            </h2>
            <p className="text-lg text-gray-600">
              Maatwerk tarieven op basis van je specifieke situatie
            </p>
          </div>

          <Card className="border-2 border-brand-teal-500">
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                    Wat betaal je als grootverbruiker?
                  </h3>
                  <p className="text-gray-600 mb-4 font-semibold">
                    Vanaf 75.000 kWh (zonder zonnepanelen) gelden onderstaande tarieven:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Stroomtarief piek:</span>{' '}
                        <span className="text-gray-600">€0,10971 per kWh</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Stroomtarief dal:</span>{' '}
                        <span className="text-gray-600">€0,09981 per kWh</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Gastarief:</span>{' '}
                        <span className="text-gray-600">€0,37901 per m³</span>
                      </div>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 mb-4">
                    * Bovenstaande tarieven zijn exclusief alle overheidsheffingen en btw. 3 jaar vast.
                  </p>
                  <p className="text-gray-600">
                    Mogelijkheden voor strategische inkoop, aangepaste trajecten en competitieve tarieven door volumes te clusteren. Ook mogelijkheden voor eigenaren van zonnepanelen op de dynamische energiemarkt (EPEX of imbalance) inclusief slimme sturing en batterij oplossingen.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-brand-navy-500 mb-3">Wat kunnen we voor je regelen?</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Maatwerk contracten op basis van je verbruik en behoeften</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Multi-locatie beheer met uniforme voorwaarden</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Flexibele contractduur (1, 3 of 5 jaar)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Dedicated accountmanager voor persoonlijke service</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Strategische inkoop voor maximale besparing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom grootzakelijke contracten?
            </h2>
            <p className="text-lg text-gray-600">
              De voordelen van maatwerk en volumevoordelen voor grootverbruikers
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

      {/* Hoe het werkt */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Zo werkt het
            </h2>
            <p className="text-lg text-gray-600">
              In 4 stappen naar je maatwerk grootzakelijke energiecontract
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
              Waarom kiezen grootzakelijke klanten voor PakketAdvies?
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
              Alles wat je wilt weten over grootzakelijke energiecontracten
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
              Klaar voor maatwerk grootzakelijke tarieven?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Scroll naar boven en vul het formulier in, of bel ons direct voor persoonlijk advies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                variant="primary"
                className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Scroll naar boven
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

