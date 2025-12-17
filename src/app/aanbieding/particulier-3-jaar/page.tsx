'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AanbiedingInteresseForm } from '@/components/aanbieding/AanbiedingInteresseForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Lightning,
  ShieldCheck,
  Clock,
  CurrencyEur,
  CheckCircle,
  Users,
  ChartLineUp,
  Lock,
  CaretDown,
  CaretUp,
  ArrowRight,
  Phone,
  Envelope,
} from '@phosphor-icons/react'

const voordelen = [
  {
    icon: Lock,
    titel: '3 jaar lang zekerheid',
    beschrijving: 'Je tarieven blijven 3 jaar lang vast. Geen verrassingen, alleen stabiliteit en rust.',
  },
  {
    icon: ChartLineUp,
    titel: 'Gemiddeld 30-40% besparing',
    beschrijving: 'Bespaar honderden euros per jaar door te profiteren van de scherpste tarieven.',
  },
  {
    icon: ShieldCheck,
    titel: 'Beschermd tegen prijsstijgingen',
    beschrijving: 'Ook als de marktprijzen stijgen, blijven jouw tarieven hetzelfde. Perfecte budgetplanning.',
  },
  {
    icon: Clock,
    titel: 'Geen gedoe',
    beschrijving: 'Wij regelen je hele overstap. Van vergelijken tot aanmelden - jij hoeft nergens aan te denken.',
  },
  {
    icon: CurrencyEur,
    titel: 'Volledig gratis',
    beschrijving: 'Ons advies en bemiddeling is volledig gratis. Je betaalt alleen aan je energieleverancier.',
  },
  {
    icon: Users,
    titel: 'Persoonlijk advies',
    beschrijving: 'Een specialist neemt contact op om het perfecte contract voor jou te vinden.',
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
    beschrijving: 'Binnen 24 uur neemt een specialist contact op om je situatie te bespreken.',
    icon: Phone,
  },
  {
    nummer: '3',
    titel: 'Persoonlijk voorstel',
    beschrijving: 'We zoeken het beste 3-jarige contract voor jou en leggen alles helder uit.',
    icon: ChartLineUp,
  },
  {
    nummer: '4',
    titel: 'Wij regelen alles',
    beschrijving: 'Van aanmelden tot activeren: wij regelen je hele overstap. Jij geniet van lagere kosten.',
    icon: CheckCircle,
  },
]

const faqItems = [
  {
    vraag: 'Waarom een 3-jarig contract?',
    antwoord: 'Een 3-jarig contract geeft je 3 jaar lang zekerheid over je energiekosten. Je bent beschermd tegen prijsstijgingen en kunt perfect budgetteren. Daarnaast zijn de tarieven vaak lager dan bij kortere contracten, omdat leveranciers graag langere contracten afsluiten.',
  },
  {
    vraag: 'Wat als ik eerder wil opzeggen?',
    antwoord: 'De meeste 3-jarige contracten hebben een vaste looptijd. Opzeggen voor het einde van het contract kan soms, maar dan betaal je meestal een opzegvergoeding. Dit verschilt per leverancier. Tijdens het gesprek leggen we je exact uit wat de voorwaarden zijn.',
  },
  {
    vraag: 'Is dit echt volledig gratis?',
    antwoord: 'Ja, absoluut! Je betaalt NOOIT aan ons. Ons advies en bemiddeling is volledig gratis. Je betaalt alleen aan je energieleverancier, en wij zorgen ervoor dat je het scherpste tarief krijgt.',
  },
  {
    vraag: 'Wat zijn de tarieven?',
    antwoord: 'Voor het 3-jarige particulier aanbod betaal je €0,27811 per kWh stroom (piek), €0,26820 per kWh (dal), €0,27220 per kWh (enkel), en €1,21207 per m³ gas. Deze tarieven zijn inclusief alle overheidsheffingen en btw, en gelden voor 3 jaar vast.',
  },
  {
    vraag: 'Hoe snel kan ik overstappen?',
    antwoord: 'Gemiddeld kun je binnen 2-3 weken overstappen. Dit hangt af van je huidige contract en de opzegtermijn. Wij regelen alles voor je, inclusief het opzeggen van je oude contract. Er is geen onderbreking van je energielevering.',
  },
  {
    vraag: 'Wat als de prijzen dalen?',
    antwoord: 'Met een vast contract profiteer je niet van eventuele prijsdalingen tijdens de looptijd. Je hebt echter wel 3 jaar lang zekerheid en bescherming tegen stijgingen. Als je flexibiliteit belangrijker vindt, kunnen we ook dynamische contracten bespreken.',
  },
]

export default function Particulier3JaarPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Energy savings"
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
              <Lock weight="duotone" className="w-5 h-5 text-brand-teal-300" />
              <span className="text-sm font-semibold text-brand-teal-200">3-jarig vast contract</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              3 jaar lang zekerheid tegen de{' '}
              <span className="text-brand-teal-500">beste tarieven</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Bespaar honderden euros per jaar met een vast 3-jarig energiecontract. Geen verrassingen, alleen stabiliteit en lage kosten.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 md:gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <ChartLineUp weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Gemiddeld</div>
                  <div className="font-semibold text-white">30-40% besparing</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                  <Lock weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">3 jaar</div>
                  <div className="font-semibold text-white">Vaste tarieven</div>
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
              Waarom een 3-jarig contract?
            </h2>
            <p className="text-lg text-gray-600">
              De voordelen van langdurige zekerheid op je energiekosten
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

      {/* Transparante Tarieven Info */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Transparante tarieven
            </h2>
            <p className="text-lg text-gray-600">
              Geen verborgen kosten, alleen duidelijkheid
            </p>
          </div>

          <Card className="border-2 border-brand-teal-500">
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                    Wat betaal je?
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Voor het 3-jarige particulier aanbod gelden de volgende tarieven:
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Stroomtarief piek:</span>{' '}
                        <span className="text-gray-600">€0,27811 per kWh</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Stroomtarief dal:</span>{' '}
                        <span className="text-gray-600">€0,26820 per kWh</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Stroomtarief enkel:</span>{' '}
                        <span className="text-gray-600">€0,27220 per kWh</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Gastarief:</span>{' '}
                        <span className="text-gray-600">€1,21207 per m³</span>
                      </div>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    * Bovenstaande tarieven zijn inclusief alle overheidsheffingen en btw. 3 jaar vast.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-brand-navy-500 mb-3">Wat is inbegrepen?</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Alle overheidsheffingen (energiebelasting, ODE, BTW)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Netbeheerkosten (vaste kosten voor aansluiting)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Leverancierskosten (energieprijs zelf)</span>
                    </li>
                  </ul>
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
              In 4 simpele stappen naar je nieuwe 3-jarige energiecontract
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
              Alles wat je wilt weten over 3-jarige energiecontracten
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

      {/* Interesse Formulier - Sticky on mobile */}
      <section id="interesse-formulier" className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Interesse? Laat het ons weten!
            </h2>
            <p className="text-lg text-gray-600">
              Vul het formulier in en we nemen binnen 24 uur contact met je op voor een vrijblijvend gesprek.
            </p>
          </div>

          <AanbiedingInteresseForm aanbiedingType="particulier-3-jaar" />
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
              Klaar voor 3 jaar zekerheid?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Laat je gegevens achter en ontdek hoeveel je kunt besparen met een 3-jarig energiecontract.
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

