'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GasContractClaimForm } from '@/components/aanbieding/GasContractClaimForm'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Lightning,
  ShieldCheck,
  Clock,
  CurrencyEur,
  CheckCircle,
  ChartLineUp,
  Lock,
  CaretDown,
  CaretUp,
  ArrowRight,
  Phone,
  Buildings,
  Calculator,
  Flame,
  TrendUp,
} from '@phosphor-icons/react'

const voordelen = [
  {
    icon: Lock,
    titel: 'Tot 4,5 jaar lang vast',
    beschrijving:
      'Leg je gastarief tot wel 4,5 jaar vast en bouw rust in. Geen schommelende rekeningen meer — voorspelbare gaskosten t/m 2030.',
  },
  {
    icon: ShieldCheck,
    titel: 'Beschermd tegen ETS-2 schokken',
    beschrijving:
      'Vanaf 2027 komt de ETS-2 CO₂-heffing eraan. Bedrijven die nu vastleggen zitten op slot, terwijl andere ondernemers de prijs nog jaren zien stijgen.',
  },
  {
    icon: TrendUp,
    titel: 'Scherp gecontracteerd',
    beschrijving:
      '€0,39754 per m³ gas (excl. EB en BTW). Door volume-inkoop krijg je een tarief dat je individueel niet bij je leverancier kunt onderhandelen.',
  },
  {
    icon: Calculator,
    titel: 'Voorspelbare cashflow',
    beschrijving:
      'Een vast gastarief maakt je begroting waterdicht. Je weet exact wat je per maand kwijt bent en kunt zonder verrassingen vooruit plannen.',
  },
  {
    icon: CurrencyEur,
    titel: 'Volledig gratis advies',
    beschrijving:
      'Onze bemiddeling is altijd gratis. Je betaalt alleen aan je energieleverancier — wij regelen de overstap voor je en blijven je aanspreekpunt.',
  },
  {
    icon: Buildings,
    titel: 'Voor élke ondernemer',
    beschrijving:
      'Of je nu een kleine MKB-er bent of grootverbruiker: dit aanbod werkt voor alle zakelijke aansluitingen. Eén KvK-nummer is genoeg.',
  },
]

const procesStappen = [
  {
    nummer: '1',
    titel: 'Claim het aanbod',
    beschrijving:
      'Vul bovenaan je naam, telefoonnummer en bedrijfsnaam in. Nog geen 30 seconden werk.',
    icon: Lightning,
  },
  {
    nummer: '2',
    titel: 'Belafspraak op maat',
    beschrijving:
      'Een specialist belt je terug om je situatie en gewenste looptijd (1 t/m 4,5 jaar) door te nemen.',
    icon: Phone,
  },
  {
    nummer: '3',
    titel: 'Persoonlijk voorstel',
    beschrijving:
      'Op basis van je verbruik krijg je een helder voorstel met je vaste gastarief, looptijd en exacte ingangsdatum.',
    icon: ChartLineUp,
  },
  {
    nummer: '4',
    titel: 'Wij regelen alles',
    beschrijving:
      'Akkoord? Dan zetten wij de complete overstap in gang. Jij hoeft niets te doen behalve achterover leunen.',
    icon: CheckCircle,
  },
]

const faqItems = [
  {
    vraag: 'Waarom is nú het juiste moment om vast te leggen?',
    antwoord:
      'De energiemarkt staat bol van onzekerheid: ETS-2 vanaf 2027, geopolitieke spanningen en seizoensgebonden pieken op de gasmarkt. Wie nu een vast gastarief vastlegt voor 1 tot 4,5 jaar, ontkoppelt zich van die volatiliteit en kiest bewust voor zekerheid en rust in z\'n bedrijfsvoering.',
  },
  {
    vraag: 'Tot hoe lang kan ik mijn gastarief vastzetten?',
    antwoord:
      'Tot maximaal 4,5 jaar. Je kunt dus kiezen tussen 1, 2, 3, 4 of 4,5 jaar — afhankelijk van hoeveel zekerheid je wilt en je verwachte bedrijfsplanning. We bespreken in het belmoment welke looptijd voor jouw situatie het slimst is.',
  },
  {
    vraag: 'Wat houdt het tarief van €0,39754 per m³ in?',
    antwoord:
      'Dit is het kale leveringstarief voor gas, exclusief energiebelasting en BTW. Op je uiteindelijke factuur komen daar nog de overheidsheffingen (energiebelasting en ODE), netbeheerkosten en BTW (21%) bij. Het kale tarief blijft tijdens de hele looptijd hetzelfde — daar zit de zekerheid.',
  },
  {
    vraag: 'Wat als ik nu nog een lopend contract heb?',
    antwoord:
      'Geen probleem. We kunnen het nieuwe vaste gastarief tot 12 maanden in de toekomst plannen. Zo profiteer je nu al van het tarief en stappen we automatisch over zodra je huidige contract afloopt.',
  },
  {
    vraag: 'Voor wie is dit aanbod bedoeld?',
    antwoord:
      'Voor elke ondernemer met een KvK-nummer en een zakelijke gasaansluiting. Dat kan een eenmanszaak met een kantoor aan huis zijn, een MKB-bedrijf, of een grootverbruiker met meerdere locaties.',
  },
  {
    vraag: 'Is dit echt volledig gratis?',
    antwoord:
      'Ja, ons advies en de bemiddeling kosten je niets. Je betaalt alleen aan je nieuwe energieleverancier voor het geleverde gas. Wij krijgen onze vergoeding rechtstreeks van de leverancier voor het regelen van het contract — onafhankelijk van wat jij betaalt.',
  },
]

export default function GasVastzettenPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero met Inline Formulier */}
      <section className="bg-brand-navy-500 text-white py-16 md:py-24 pb-20 md:pb-28 pt-32 md:pt-40 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Zakelijk gastarief vastzetten"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-[1fr,480px] gap-12 items-start">
            {/* Links: Hero content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal-500/20 border border-brand-teal-400/30 mb-6">
                <Flame weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                <span className="text-sm font-semibold text-brand-teal-200">
                  Persoonlijk gas-aanbod · Tot 4,5 jaar vast
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Zet je gastarief nu vast —{' '}
                <span className="text-brand-teal-500">
                  tot wel 4,5 jaar lang zekerheid
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-6">
                Juist nu, met alle onrust op de energiemarkt, kies je met een vast
                gastarief voor rust in je bedrijfsvoering. Geen schommelingen meer,
                geen verrassingen op je factuur. Alleen voorspelbaarheid.
              </p>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Flame weight="duotone" className="w-6 h-6 text-brand-teal-300" />
                  Waarom nú vastleggen?
                </h3>
                <p className="text-gray-200 mb-4">
                  Met de aankomende ETS-2 CO₂-heffing per 2027 én de aanhoudende
                  marktvolatiliteit is dit een uniek moment om je gastarief tot wel{' '}
                  <strong className="text-white">4,5 jaar lang vast te leggen</strong>.
                  Wie nu kiest voor zekerheid, zit straks op slot terwijl andere
                  ondernemers de prijs nog jaren zien stijgen.
                </p>
                <p className="text-brand-teal-300 font-semibold text-lg">
                  €0,39754 per m³ gas
                  <span className="text-sm font-normal text-gray-300 ml-2">
                    (excl. energiebelasting en BTW)
                  </span>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <Lock weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Gas vast tot</div>
                    <div className="font-semibold text-white">4,5 jaar</div>
                  </div>
                </div>

                <div className="w-px h-8 bg-gray-600"></div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-teal-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck weight="duotone" className="w-5 h-5 text-brand-teal-300" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Gegarandeerd</div>
                    <div className="font-semibold text-white">Vast tarief</div>
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

            {/* Rechts: Formulier card */}
            <div className="lg:sticky lg:top-32">
              <Card className="bg-white shadow-2xl border-0">
                <CardContent className="p-6 md:p-8">
                  <div className="mb-6 text-center">
                    <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-2">
                      Claim dit aanbod
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Wij bellen je terug · Gratis en vrijblijvend
                    </p>
                  </div>

                  <GasContractClaimForm submitLabel="Claim dit aanbod" />

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
            <path d="M0,95 Q360,65 720,95 T1440,95 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Tarieven Info */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
              Eén tarief. Geen verrassingen.
            </h2>
            <p className="text-lg text-gray-600">
              Helder, transparant en jaren lang gegarandeerd
            </p>
          </div>

          <Card className="border-2 border-brand-teal-500">
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-2xl font-bold text-brand-navy-500 mb-4">
                    Wat betaal je voor gas?
                  </h3>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-3">
                      <CheckCircle weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Vast gastarief:</span>{' '}
                        <span className="text-gray-700 font-bold">€0,39754 per m³</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Looptijd:</span>{' '}
                        <span className="text-gray-700">flexibel, van 1 tot 4,5 jaar vast</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Lock weight="fill" className="w-6 h-6 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-brand-navy-500">Garantie:</span>{' '}
                        <span className="text-gray-700">het kale leveringstarief blijft de hele looptijd vast</span>
                      </div>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    * Tarief is exclusief energiebelasting en BTW. Op je
                    uiteindelijke factuur komen daar nog de overheidsheffingen (EB,
                    ODE), netbeheerkosten en BTW (21%) bij — die zijn voor iedere
                    leverancier hetzelfde. Wij berekenen je totale termijnbedrag voor
                    je tijdens het belmoment.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-brand-navy-500 mb-3">Wat is verder inbegrepen?</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Volledige overstapservice — wij regelen de switch met je huidige leverancier</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Flexibele ingangsdatum tot 12 maanden in de toekomst</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Persoonlijk aanspreekpunt bij PakketAdvies, ook na overstap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle weight="fill" className="w-5 h-5 text-brand-teal-500 flex-shrink-0 mt-0.5" />
                      <span>Volledig gratis bemiddeling — je betaalt alleen je leverancier</span>
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
              Waarom je gas nu vastleggen?
            </h2>
            <p className="text-lg text-gray-600">
              Zes redenen waarom dit aanbod jouw bedrijf verder helpt
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
              In 4 simpele stappen naar een vast gastarief tot 4,5 jaar lang
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {procesStappen.map((stap, index) => {
              const Icon = stap.icon
              return (
                <div key={index} className="relative">
                  {index < procesStappen.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-teal-400 to-brand-teal-500/50 z-0"
                      style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }}
                    />
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
              Waarom ondernemers PakketAdvies vertrouwen
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
              Alles wat je wilt weten over het vastzetten van je gastarief
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-0">
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
                    }
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
        <div className="absolute inset-0">
          <Image
            src="/images/hero-main.jpg"
            alt="Professional business"
            fill
            className="object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-500/95 via-brand-navy-600/90 to-brand-navy-700/95" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 bg-brand-teal-500/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar voor jaren rust op je gasrekening?
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Scroll terug naar boven en claim het aanbod, of bel ons direct voor
              persoonlijk advies.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                variant="primary"
                className="bg-brand-teal-500 hover:bg-brand-teal-600 text-white"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
              >
                Claim het aanbod
                <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
              </Button>
              <Link href="tel:0850477065">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Phone weight="bold" className="w-5 h-5 mr-2" />
                  Bel direct: 085 047 7065
                </Button>
              </Link>
            </div>

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
