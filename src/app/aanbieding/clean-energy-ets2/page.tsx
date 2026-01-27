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
  Lightbulb,
  TrendUp,
  CalendarCheck,
  Handshake,
  Fire,
} from '@phosphor-icons/react'

const voordelen = [
  {
    icon: ShieldCheck,
    titel: '5-jarig vast contract',
    beschrijving: 'Zekerheid en stabiliteit met een vast gastarieven voor de komende 5 jaar, beschermd tegen marktschommelingen.',
  },
  {
    icon: CheckCircle,
    titel: 'ETS-2 risico afgedekt',
    beschrijving: 'Het enige 5-jarige vaste gastarieven dat het ETS-2 risico écht afdekt zonder verrassingen of bijbetalingen.',
  },
  {
    icon: TrendUp,
    titel: 'Scherpe tarieven',
    beschrijving: 'Profiteer van uitzonderlijk aantrekkelijke tarieven door strategische inkoop en volumevoordelen.',
  },
  {
    icon: Lightning,
    titel: 'KvK-nummer verplicht',
    beschrijving: 'Dit aanbod is alleen beschikbaar voor zakelijke klanten met een geldig KvK-nummer.',
  },
  {
    icon: CalendarCheck,
    titel: 'Beperkte periode',
    beschrijving: 'Speciaal voorjaarsaanbod voor KvK-klanten. Wacht niet te lang, dit aanbod is tijdelijk.',
  },
  {
    icon: Handshake,
    titel: 'Persoonlijk advies',
    beschrijving: 'Wij helpen je met het maken van de juiste keuze en regelen de volledige overstap voor je.',
  },
]

const tariefDetails = [
  {
    item: 'Unieke kans',
    detail: 'ETS-2 risico vastgelegd',
  },
  {
    item: 'Elektra normaal',
    detail: '€0,128',
  },
  {
    item: 'Elektra dal',
    detail: '€0,123',
  },
  {
    item: 'Gastarieven',
    detail: '€0,50',
  },
  {
    item: 'Doelgroep',
    detail: 'KvK (ook woonhuis)',
  },
  {
    item: 'Looptijd',
    detail: 't/m 01-01-2031',
  },
]

const procesStappen = [
  {
    nummer: '1',
    titel: 'Vul je interesse in',
    beschrijving: 'Laat je bedrijfsgegevens achter via het formulier. Dit duurt nog geen 2 minuten.',
    icon: Lightning,
  },
  {
    nummer: '2',
    titel: 'Persoonlijk gesprek',
    beschrijving: 'Een specialist neemt contact op om je situatie te bespreken en het aanbod toe te lichten.',
    icon: Phone,
  },
  {
    nummer: '3',
    titel: 'Contract opstellen',
    beschrijving: 'We stellen een contract op maat op en leggen alles helder uit, zodat je precies weet waar je aan toe bent. De ingangsdatum kan tot 12 maanden vooruit gepland worden.',
    icon: ChartLineUp,
  },
  {
    nummer: '4',
    titel: 'Wij regelen alles',
    beschrijving: 'Van aanmelding tot activatie: wij regelen je hele overstap. Jij profiteert van zekerheid en scherpe tarieven.',
    icon: CheckCircle,
  },
]

const faqItems = [
  {
    vraag: 'Wat is de ETS-2 bijmengverplichting?',
    antwoord: 'De ETS-2 (Emission Trading System fase 2) is een Europese CO2-heffing die per januari 2028 de energieprijzen, vooral gas, gaat beïnvloeden. De verwachte impact op de gasprijs blijft tot 2035/2036 doorlopen (8 à 9 jaar uitfasering). Dit contract dekt het ETS-2 risico volledig af voor de komende 5 jaar. Clean Energy is de enige energieleverancier die het uitfaseringstraject betrouwbaar vastlegt en daarmee prijszekerheid biedt.',
  },
  {
    vraag: 'Waarom is dit nu zo voordelig?',
    antwoord: 'Gelet op de inzetting van de ETS-2 bijmengverplichting per januari 2028 en de verwachte impact daarvan op de gasprijs, inclusief 8 à 9 jaar uitfasering (vanaf 2028 tot en met 2035/2036), is dit de allerlaatste kans om te vangen op het vastleggen van de gasprijs voor 5 jaar. Met deze unieke mogelijkheid voorkom je onverwachte impact en toekomstige bijbetalingen. Clean Energy is de enige leverancier die deze zekerheid biedt.',
  },
  {
    vraag: 'Is dit aanbod voor iedereen?',
    antwoord: 'Nee, dit persoonlijk aanbod is alleen voor KvK-klanten (ook eenmanszaken). Dit is de uitsluitende voorwaarde om van dit aanbod gebruik te kunnen maken. Goed om te weten: dit specifieke Clean Energy contract mag óók op woonhuizen worden aangesloten (mits u een KvK-nummer heeft).',
  },
  {
    vraag: 'Wat als ik nu nog een contract heb lopen?',
    antwoord: 'Tijdens het gesprek bespreken we de voorwaarden en specifieke vragen rondt bestaande looptijden. We leggen ook uit hoe we je overstap het beste kunnen timen om te profiteren van dit aanbod. De ingangsdatum van het nieuwe contract kan tot 12 maanden in de toekomst worden gepland, zodat je perfect kunt aansluiten wanneer je huidige contract afloopt.',
  },
  {
    vraag: 'Hoe lang is dit aanbod geldig?',
    antwoord: 'Dit is een speciaal voorjaarsaanbod voor KvK-klanten en is beperkt geldig. Wacht niet te lang met je aanmelding, want dit aanbod kan op elk moment eindigen.',
  },
  {
    vraag: 'Wat gebeurt er na de 5 jaar?',
    antwoord: 'Na afloop van het 5-jarige contract (t/m 01-01-2031) kun je opnieuw kiezen voor een nieuw contract bij Clean Energy of een andere leverancier. De ETS-2 impact is voor deze periode volledig afgedekt.',
  },
]

export default function CleanEnergyETS2Page() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero met Inline Formulier */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Clean Energy ETS-2 Aanbod"
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
                <Fire weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm font-semibold text-brand-teal-200">PERSOONLIJK AANBOD VOOR KVK-KLANTEN</span>
              </div>

              {/* Clean Energy Logo */}
              <div className="mb-6">
                <div className="inline-block bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-800">Clean Energy</h3>
                  <p className="text-sm text-gray-600">5 jaar vast gas (ETS-2 beschermd)</p>
                </div>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Het enige 5-jarige vaste gastarieven dat het{' '}
                <span className="text-brand-teal-500">ETS-2 risico écht afdekt</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                Let op: dit aanbod is uitsluitend bedoeld voor klanten met een KvK-nummer — maar het 
                contract kan wél worden aangesloten op woonhuizen. Looptijd tot en met 01-01-2031 
                (dus vanaf vandaag effectief circa 5 jaar zekerheid).
              </p>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb weight="duotone" className="w-6 h-6 text-brand-teal-300" />
                  Waarom dit nu afsluiten?
                </h3>
                <p className="text-gray-200 mb-4">
                  Gelet op de inzetting van de ETS-2 bijmengverplichting per januari 2028 
                  en de verwachte impact daarvan op de gasprijs, inclusief 8 à 9 jaar 
                  uitfasering (vanaf 2028 tot en met 2035/2036), is dit de allerlaatste kans om 
                  te vangen op het vastleggen van de gasprijs voor 5 jaar.
                </p>
                <p className="text-gray-200">
                  Belangrijk om te beseffen is dat dit de laatste kans is om je in te dekken tegen 
                  de ETS-2 impact. Clean Energy is de enige leverancier die het uitfaseringstraject 
                  volledig in je contract verwerkt en daarmee het ETS-2 risico compleet voor je wegneemt!
                </p>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">5 jaar vast</div>
                    <div className="font-semibold text-white">t/m 01-01-2031</div>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">ETS-2 risico</div>
                    <div className="font-semibold text-white">Volledig afgedekt</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-600"></div>
                
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <Users weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Alleen voor</div>
                    <div className="font-semibold text-white">KvK-klanten</div>
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
                      Claim dit voordeel
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Binnen 24 uur reactie · Gratis en vrijblijvend
                    </p>
                  </div>
                  
                  <AanbiedingInteresseForm 
                    aanbiedingType="clean-energy-ets2"
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

      {/* Tarieven Overzicht */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Clean Energy — 5 jaar vast gas (ETS-2 beschermd)
            </h2>
            <p className="text-lg text-gray-600">
              Alleen voor KvK-klanten (wel mogelijk op woonhuis)
            </p>
          </div>

          <Card className="border-2 border-brand-teal-500 mb-8">
            <CardContent className="pt-8">
              <div className="space-y-4">
                {tariefDetails.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-3 border-b border-gray-200 last:border-0"
                  >
                    <span className="font-semibold text-brand-navy-500">{item.item}</span>
                    <span className="text-gray-700 font-medium">{item.detail}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-brand-teal-50 border-2 border-brand-teal-500">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                <strong>Termijnbedrag berekenen contract:</strong> Het termijnbedrag is gebaseerd op je 
                voorgeschat verbruik. De netbeheerderskosten en overheidsheffingen zijn een 
                verwaarding over de levertijd en weergeven in je contract. We berekenen dit 
                voor je tijdens het gesprek.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Flexibele ingangsdatum:</strong> Heb je nog een lopend contract? De ingangsdatum 
                kan tot 12 maanden in de toekomst worden gepland, zodat je dit gunstige tarief nu al 
                kunt vastleggen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Voordelen */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container-custom max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Waarom dit aanbod uniek is
            </h2>
            <p className="text-lg text-gray-600">
              De voordelen van het Clean Energy ETS-2 beschermde contract
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
              In 4 stappen naar je 5-jarige ETS-2 beschermde contract
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
              Alles wat je wilt weten over dit unieke aanbod
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
              Heeft u vragen of wilt u even overleggen?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Neem gerust contact met ons op. We leggen je graag uitgebreid uit waarom dit een 
              unieke kans is om jezelf te beschermen tegen toekomstige prijsstijgingen.
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
              <Link href="mailto:info@pakketadvies.nl">
                <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  E-mail: info@pakketadvies.nl
                </Button>
              </Link>
            </div>

            <div className="mb-6">
              <Link href="tel:0850477065">
                <Button size="lg" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Phone weight="bold" className="w-5 h-5 mr-2" />
                  Bel direct: 085-0477065
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
